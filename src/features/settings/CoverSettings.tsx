import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useBlobUrl, useCover } from "../../hooks/useCover";
import { uploadCover, validateCover } from "../../services/cover";
export function CoverSettings({user}:{user:string}) {
  const cover=useCover(user); const qc=useQueryClient();
  const [file,setFile]=useState<File|null>(null);
  const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
  const url=useBlobUrl(file ?? cover.data);
  async function save() {
    if (!file || busy) return;
    setBusy(true);setMessage("");
    try { await uploadCover(user,file); qc.setQueryData(["cover",user],file);setFile(null);setMessage("A saját borítód elmentve. A többi eszközön rövidesen megjelenik."); }
    catch(e){setMessage(e instanceof Error ? e.message : "Nem sikerült feltölteni a képet.");}
    finally {setBusy(false);}
  }
  return <section className="panel settings-panel">
    <h2>Saját borítóm</h2>
    <p>A Sanctuary tetején jelenik meg, minden eszközödön. A kép privát, csak a fiókod fér hozzá. JPG, PNG vagy WebP, legfeljebb 5 MB.</p>
    {url && <img className="cover-preview" src={url} alt="Saját borító előnézete"/>}
    {cover.isError && <p role="alert">A mentett borító nem tölthető be. Ellenőrizd a kapcsolatot.</p>}
    <label>Kép kiválasztása<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>{
      const selected=e.target.files?.[0];e.target.value="";setMessage("");
      if (!selected)return;
      try {validateCover(selected);setFile(selected);} catch(error){setMessage((error as Error).message);}
    }}/></label>
    <div className="actions"><button className="primary" disabled={!file || busy} onClick={()=>void save()}>{busy ? "Feltöltés…" : "Borító mentése"}</button>
    {file && <button disabled={busy} onClick={()=>setFile(null)}>Mégse</button>}</div>
    <p>A kép teljes egészében látszik. Cseréhez válassz új képet és mentsd el. Feltöltéshez internetkapcsolat szükséges.</p>
    <p role="status">{message}</p>
  </section>;
}
