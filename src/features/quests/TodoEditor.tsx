import {useState} from "react";
import type {Todo} from "./domain";
export function TodoEditor({original,current,busy,onSave,onCancel}:{original:Todo;current?:Todo;busy:boolean;onSave:(title:string,due:string,revision:number)=>Promise<void>;onCancel:()=>void}) {
 const [title,setTitle]=useState(original.title);const [due,setDue]=useState(original.due_date??'');
 const conflict=!!current&&current.revision!==original.revision;
 return <form className="panel todo-editor" onSubmit={e=>{e.preventDefault();void onSave(title,due,original.revision);}}>
 <h2>Teendő szerkesztése</h2>
 <label htmlFor="edit-title">Megnevezés</label><input id="edit-title" value={title} maxLength={200} required onChange={e=>setTitle(e.target.value)} disabled={busy}/>
 <label htmlFor="edit-date">Határidő · kihagyható</label><input id="edit-date" type="date" value={due} onChange={e=>setDue(e.target.value)} disabled={busy}/>
 <button type="button" disabled={busy||!due} onClick={()=>setDue('')}>Határidő törlése</button>
 {conflict&&<div role="alert"><p>Ez a teendő közben megváltozott. A saját beírt változatod felül megmaradt.</p><p>Jelenlegi felhőváltozat: <strong>{current.title}</strong> · {current.due_date??'Határidő nélkül'} · {current.archived?'Archivált':current.completed?'Kész':'Aktív'}</p><details><summary>Szerkesztés előtti változat</summary><p>{original.title} · {original.due_date??'Határidő nélkül'}</p></details><button type="button" disabled={busy||!title.trim()} onClick={()=>void onSave(title,due,current.revision)}>Saját szöveg és határidő mentése a friss változatra</button></div>}
 {!conflict&&<button className="primary" disabled={busy||!title.trim()}>Módosítás mentése</button>}
 <button type="button" disabled={busy} onClick={onCancel}>Mégse</button>
 </form>;
}
