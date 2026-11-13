import { Flame, Compass, BookOpen, Footprints, Route, Crown, Mountain, Check, LockKeyhole } from "lucide-react";
import { calculateAchievements, type XpEvent } from "./rules";
const icons={spark:Flame,wanderer:Compass,chronicler:BookOpen,step:Footprints,path:Route,master:Crown,winter:Mountain};
const dateFormat=new Intl.DateTimeFormat("hu-HU",{timeZone:"Europe/Budapest",year:"numeric",month:"short",day:"numeric"});
export function Achievements({events}:{events:XpEvent[]}) {
 const achievements=calculateAchievements(events);
 return <section className="achievements" aria-labelledby="achievements-title">
  <header><h2 id="achievements-title">A megszerzett nyomaid</h2><p>Achievementek · {achievements.filter(a=>a.unlockedAt).length} / {achievements.length} feloldva</p></header>
  <p>Nem kell egymást követő napokon teljesítened. A korábbi teljesítmények is számítanak; a megszerzett jelvények megmaradnak.</p>
  <ul className="achievement-grid">{achievements.map(a=>{
   const Icon=icons[a.id];
   return <li key={a.id} className={`achievement ${a.unlockedAt?"achievement-earned":""}`}>
    <div className="achievement-emblem" aria-hidden="true"><Icon size={34} strokeWidth={1.4}/></div>
    <div className="achievement-detail"><h3>{a.name}</h3><p>{a.description}</p>
     <div className="achievement-state">{a.unlockedAt?<><Check size={16} aria-hidden="true"/>Feloldva · <time dateTime={a.unlockedAt}>{dateFormat.format(new Date(a.unlockedAt))}</time></>:<><LockKeyhole size={15} aria-hidden="true"/>Még előtted áll</>}</div>
     <progress aria-label={`${a.name}: ${a.progress} / ${a.target}`} max={a.target} value={a.progress}/><span className="achievement-count">{a.progress} / {a.target}{a.kind==="xp"?" XP":""}</span>
    </div>
   </li>;
  })}</ul>
  <p className="achievement-note">A feloldás dátuma a feltételt teljesítő XP-jóváírás időpontja. A régebbi méréseknél ez az XP-rendszer bevezetésének napja lehet. A jelvényekért nem jár további XP.</p>
 </section>;
}
