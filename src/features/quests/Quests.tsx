import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "../../services/client";
type Todo = {id:string; title:string; completed:boolean; archived:boolean; revision:number};
export function Quests({user}:{user?:string}) {
 const [title,setTitle]=useState(""); const draft=useRef(crypto.randomUUID());
 const [busy,setBusy]=useState(false); const [message,setMessage]=useState(""); const [archive,setArchive]=useState(false);
 const query=useQuery({queryKey:["quests",user],enabled:!!user,refetchInterval:30000,retry:1,queryFn:async()=>{
  const [tasks,xp]=await Promise.all([supabase!.from("todos").select("id,title,completed,archived,revision").eq("user_id",user!).order("created_at"),supabase!.from("xp_events").select("points").eq("user_id",user!)]);
  if(tasks.error||xp.error) throw new Error("A küldetések nem tölthetők be. Ellenőrizd a kapcsolatot és az adatbázis beállítását.");
  return {tasks:tasks.data as Todo[],xp:xp.data.reduce((sum,e)=>sum+e.points,0)};
 }});
 async function save(action:string,task?:Todo) {
  if(!navigator.onLine) {setMessage("A teendők módosításához internetkapcsolat kell. A beírt szöveg itt marad.");return;}
  setBusy(true);setMessage("");
  try {
   const auth=await supabase!.auth.getSession();
   if(auth.data.session?.user.id!==user) throw new Error("Jelentkezz be újra.");
   const result=await supabase!.rpc("save_todo",{p_id:task?.id??draft.current,p_revision:task?.revision??0,p_action:action,p_title:title});
   if(result.error) throw new Error(result.error.message.includes("revision conflict")?"Ez a teendő közben másik eszközön megváltozott. Frissítettük a listát; nézd át, majd próbáld újra.":"A mentés nem igazolható. Frissítsd a listát; a beírt szöveget megőriztük.");
   if(action==="create") { draft.current=crypto.randomUUID(); if(result.data.title!==title.trim()) {setMessage("A korábbi próbálkozás már elmentődött. Az új szöveg itt maradt; külön teendőként hozzáadhatod.");return;} setTitle(""); }
   setMessage("Mentve a felhőbe.");
  } catch(error) {setMessage(error instanceof Error?error.message:"Nem sikerült menteni.");}
  finally {await query.refetch();setBusy(false);}
 }
 const xp=query.data?.xp??0;
 return <section className="quests"><h1>A saját küldetéseid</h1><p>Apró lépések, a saját ritmusodban.</p>
 {!user?<p className="panel"><Link to="/settings">Jelentkezz be a teendőidhez.</Link></p>:<>
 {query.data&&<div className="panel xp-panel"><h2>{Math.floor(xp/100)+1}. szint <span>· {xp} XP</span></h2><progress aria-label="Haladás a következő szintig" max={100} value={xp%100}/><p>{100-xp%100} XP a következő szintig.</p><p>Napi mérés: 10 XP. Egy teendő első teljesítése: 20 XP. Újrapipálásért nem jár új pont. Nincs levonás vagy elvesző sorozat.</p></div>}
 {query.error&&<p role="alert">{query.error.message}</p>}
 <form className="panel" onSubmit={e=>{e.preventDefault();void save("create");}}><label htmlFor="todo-title">Új teendő</label><input id="todo-title" value={title} maxLength={200} onChange={e=>setTitle(e.target.value)} placeholder="Mi legyen a következő apró lépés?" disabled={busy}/><button className="primary" disabled={busy||!title.trim()||!query.data}>Hozzáadás</button><p>A teendők mentéséhez most internetkapcsolat szükséges.</p></form>
 <p role="status">{message}</p><div className="quest-toolbar"><button onClick={()=>setArchive(!archive)}>{archive?"Aktív teendők":"Archívum"}</button><button disabled={busy||query.isFetching} onClick={()=>void query.refetch()}>Lista frissítése</button></div>
 <ul className="quest-list">{query.data?.tasks.filter(t=>t.archived===archive).map(t=><li className="panel" key={t.id}><label><input type="checkbox" checked={t.completed} disabled={busy||t.archived} onChange={()=>void save(t.completed?"reopen":"complete",t)}/><span className={t.completed?"quest-done":""}>{t.title}</span></label><button disabled={busy} onClick={()=>void save(t.archived?"restore":"archive",t)}>{t.archived?"Visszaállítás":"Archiválás"}</button></li>)}</ul>
 {query.data&&!query.data.tasks.some(t=>t.archived===archive)&&<p>{archive?"Nincsenek archivált teendők.":"Még nincs teendőd. Adj hozzá egy saját, teljesíthető lépést."}</p>}
 </>}
 </section>;
}
