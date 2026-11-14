import { Achievements } from "../achievements/Achievements";
import { fetchXpEvents } from "../../services/achievements";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "../../services/client";
import { today } from "../../lib/domain";
import { matchesTodo,todoViews,type Todo,type TodoView } from "./domain";
import { TodoEditor } from "./TodoEditor";
async function fetchTasks(user:string) {
 const tasks:Todo[]=[];
 for(let offset=0;;offset+=500) {
  const {data,error}=await supabase!.from('todos').select('id,title,completed,archived,revision,due_date').eq('user_id',user).order('created_at').order('id').range(offset,offset+499);
  if(error) throw new Error('A teendők nem tölthetők be. Ellenőrizd a kapcsolatot, majd frissítsd a listát.');
  tasks.push(...data as Todo[]);if(data.length<500) return tasks;
 }
}
export function Quests({user}:{user?:string}) {
 const [title,setTitle]=useState('');const [due,setDue]=useState('');const draft=useRef(crypto.randomUUID());
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [view,setView]=useState<TodoView>('all');const [editing,setEditing]=useState<Todo|null>(null);
 const query=useQuery({queryKey:['quests',user],enabled:!!user,refetchInterval:30000,retry:1,queryFn:async()=>{
  const [tasks,events]=await Promise.all([fetchTasks(user!),fetchXpEvents(user!)]);
  return {tasks,events,xp:events.reduce((sum,e)=>sum+e.points,0)};
 }});
 async function save(action:string,task?:Todo,details?:{title:string;due:string;revision:number}) {
  if(busy) return;
  if(!navigator.onLine){setMessage('A módosításhoz internetkapcsolat kell. A beírt szöveg ebben a nézetben megmarad.');return;}
  setBusy(true);setMessage('');
  try {
   const auth=await supabase!.auth.getSession();if(auth.data.session?.user.id!==user) throw new Error('Jelentkezz be újra.');
   const result=action==='create'||action==='edit'
    ?await supabase!.rpc('save_todo_details',{p_id:task?.id??draft.current,p_revision:details?.revision??0,p_title:details?.title??title,p_due_date:(details?.due??due)||null})
    :await supabase!.rpc('save_todo',{p_id:task!.id,p_revision:task!.revision,p_action:action,p_title:''});
   if(result.error) throw new Error(result.error.message.includes('revision conflict')?'Ez a teendő közben másik eszközön megváltozott. A saját változatod megmaradt; frissítjük a felhőváltozatot.':'A mentés nem igazolható. Frissítsd a listát; a beírt szöveget megőriztük.');
   if(action==='create') {
    draft.current=crypto.randomUUID();
    if(result.data.title!==title.trim()||(result.data.due_date??null)!==(due||null)){setMessage('A korábbi próbálkozás már elmentődött. Az új szöveget és határidőt külön teendőként hozzáadhatod.');return;}
    setTitle('');setDue('');setView('all');
   }
   if(action==='edit') setEditing(null);
   setMessage('Mentve a felhőbe.');
  } catch(error){setMessage(error instanceof Error?error.message:'Nem sikerült menteni.');}
  finally{await query.refetch();setBusy(false);}
 }
 const day=today();const xp=query.data?.xp??0;const tasks=query.data?.tasks??[];
 const visible=tasks.filter(t=>matchesTodo(t,view,day)).sort((a,b)=>(a.due_date??'9999').localeCompare(b.due_date??'9999')||a.title.localeCompare(b.title,'hu'));
 return <section className="quests"><h1>A saját küldetéseid</h1><p>Apró lépések, a saját ritmusodban.</p>
 {!user?<p className="panel"><Link to="/settings">Jelentkezz be a teendőidhez.</Link></p>:<>
 {query.data&&<div className="panel xp-panel"><h2>{Math.floor(xp/100)+1}. szint <span>· {xp} XP</span></h2><progress aria-label="Haladás a következő szintig" max={100} value={xp%100}/><p>{100-xp%100} XP a következő szintig.</p><p>Napi mérés: 10 XP. Egy teendő első teljesítése: 20 XP. Szerkesztésért és újrapipálásért nem jár új pont. Nincs levonás vagy elvesző sorozat.</p></div>}
 {query.error&&<p role="alert">{query.error.message}</p>}
 <form className="panel" onSubmit={e=>{e.preventDefault();void save('create');}}><label htmlFor="todo-title">Új teendő</label><input id="todo-title" value={title} maxLength={200} required onChange={e=>setTitle(e.target.value)} placeholder="Mi legyen a következő apró lépés?" disabled={busy}/><label htmlFor="todo-date">Határidő · kihagyható</label><input id="todo-date" type="date" value={due} onChange={e=>setDue(e.target.value)} disabled={busy}/><button className="primary" disabled={busy||!title.trim()||!query.data}>Hozzáadás</button><p>A teendők mentéséhez internetkapcsolat szükséges.</p></form>
 <p role="status">{message}</p>
 {editing&&<TodoEditor key={editing.id} original={editing} current={tasks.find(t=>t.id===editing.id)} busy={busy} onCancel={()=>setEditing(null)} onSave={(newTitle,newDue,revision)=>save('edit',editing,{title:newTitle,due:newDue,revision})}/>}
 <div className="quest-toolbar" role="group" aria-label="Teendők szűrése">{todoViews.map(([key,label])=><button key={key} aria-pressed={view===key} onClick={()=>setView(key)}>{label} ({tasks.filter(t=>matchesTodo(t,key,day)).length})</button>)}<button disabled={busy||query.isFetching} onClick={()=>void query.refetch()}>Lista frissítése</button></div>
 <p className="todo-view-help">A Ma nézet a lejárt teendőket is mutatja. Közelgő: a következő 7 nap. Később: távolabbi vagy határidő nélküli feladatok. Budapest szerinti dátumok.</p>
 <ul className="quest-list">{visible.map(t=><li className="panel" key={t.id}><div><label><input type="checkbox" checked={t.completed} disabled={busy||t.archived||!!editing} onChange={()=>void save(t.completed?'reopen':'complete',t)}/><span className={t.completed?'quest-done':''}>{t.title}</span></label><p className="todo-due">{t.due_date?<><time dateTime={t.due_date}>{t.due_date}</time>{!t.completed&&!t.archived&&t.due_date<day?' · Lejárt':''}</>:'Határidő nélkül'}</p></div><div className="todo-actions"><button disabled={busy||!!editing} onClick={()=>{setEditing({...t});setMessage('');}}>Szerkesztés</button><button disabled={busy||!!editing} onClick={()=>void save(t.archived?'restore':'archive',t)}>{t.archived?'Visszaállítás':'Archiválás'}</button></div></li>)}</ul>
 {query.data&&!visible.length&&<p>Ebben a nézetben nincs teendő.</p>}
 {query.data?.events&&<Achievements events={query.data.events}/>}
 </>}
 </section>;
}
