import { useState } from "react";
import { addDays, addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, parseISO, startOfMonth, startOfWeek } from "date-fns";
import { hu } from "date-fns/locale";
import { Link } from "react-router-dom";
import { metrics, today, type RecordRow } from "../../lib/domain";
import type { Pending } from "../../services/local";
export function MoodCalendar({rows,pending,onSelect}:{rows:RecordRow[];pending:Pending[];onSelect:(day:string)=>void}) {
 const [anchor,setAnchor]=useState(today());
 const [mode,setMode]=useState<"month"|"week">("month");
 const [selected,setSelected]=useState(today());
 const date=parseISO(anchor);
 const start=startOfWeek(mode==="month"?startOfMonth(date):date,{weekStartsOn:1});
 const end=endOfWeek(mode==="month"?endOfMonth(date):date,{weekStartsOn:1});
 const days=eachDayOfInterval({start,end});
 const saved=rows.find(row=>row.day===selected);
 const waiting=pending.find(item=>item.data.day===selected);
 const detail=waiting?.data??saved;
 function move(direction:number){setAnchor(format(mode==="month"?addMonths(date,direction):addDays(date,direction*7),"yyyy-MM-dd"));}
 return <section className="panel mood-calendar" aria-label="Hangulatnaptár">
  <div className="section-heading"><h2>Hangulatnaptár</h2><div className="actions"><button aria-pressed={mode==="month"} onClick={()=>setMode("month")}>Havi</button><button aria-pressed={mode==="week"} onClick={()=>setMode("week")}>Heti</button></div></div>
  <div className="calendar-toolbar"><button aria-label="Előző időszak" onClick={()=>move(-1)}>←</button><h3 aria-live="polite">{mode==="month"?format(date,"yyyy. MMMM",{locale:hu}):`${format(start,"yyyy. MM. dd.")} – ${format(end,"MM. dd.")}`}</h3><button aria-label="Következő időszak" onClick={()=>move(1)}>→</button><button onClick={()=>{setAnchor(today());setSelected(today());}}>Ma</button></div>
  <p>A szám a hangulatod 1–10 között. A vonal hiányzó mérést jelöl, nem rossz napot.</p>
  <div className="calendar-grid">
   {["H","K","Sze","Cs","P","Szo","V"].map(label=><span className="calendar-weekday" key={label}>{label}</span>)}
   {days.map(day=>{const key=format(day,"yyyy-MM-dd");const local=pending.find(item=>item.data.day===key);const row=local?.data??rows.find(item=>item.day===key);return <button key={key} className={`calendar-day ${key.slice(0,7)!==anchor.slice(0,7)?"outside":""} ${row?"recorded":""}`} aria-pressed={selected===key} aria-current={key===today()?"date":undefined} aria-label={`${key}: ${row?`hangulat ${row.mood}/10${local?", helyi mentés":""}`:"nincs mérés"}`} onClick={()=>setSelected(key)}><span>{format(day,"d")}</span><strong>{row?.mood??"—"}</strong>{local&&<small>•</small>}</button>;})}
  </div>
  <div className="calendar-detail" aria-live="polite"><h3>{selected}</h3>{detail?<><p>{waiting?"Helyi, függő mentés":"Mentett napi mérés"}</p><div className="history-metrics">{metrics.map(([key,label])=><span key={key}>{label}: <strong>{detail[key]??"—"}</strong></span>)}</div>{detail.rest_day&&<p>Pihenőnap</p>}{detail.note&&<p className="user-note">{detail.note}</p>}</>:<p>Ehhez a naphoz még nincs mérés.</p>}{selected<=today()&&<Link className="primary" to="/ritual" onClick={()=>onSelect(selected)}>{detail?"Mérés megnyitása":"Mérés rögzítése"}</Link>}</div>
 </section>;
}
