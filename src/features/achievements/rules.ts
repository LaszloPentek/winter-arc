export type XpEvent = {kind:"checkin"|"todo";source:string;points:number;created_at:string};
export const achievementRules = [
 {id:"spark",name:"Az első szikra",description:"Első elmentett napi mérés",kind:"checkin",target:1},
 {id:"wanderer",name:"Visszatérő vándor",description:"Mérés 7 különböző napon",kind:"checkin",target:7},
 {id:"chronicler",name:"A csend krónikása",description:"Mérés 30 különböző napon",kind:"checkin",target:30},
 {id:"step",name:"Az első lépés",description:"Első teljesített teendő",kind:"todo",target:1},
 {id:"path",name:"Ösvényépítő",description:"10 különböző teendő teljesítése",kind:"todo",target:10},
 {id:"master",name:"Küldetésmester",description:"50 különböző teendő teljesítése",kind:"todo",target:50},
 {id:"winter",name:"Téli utazó",description:"Az 5. szint elérése · 400 XP",kind:"xp",target:400},
] as const;
export function calculateAchievements(events:XpEvent[]) {
 const seen=new Set<string>();
 const ordered=[...events].sort((a,b)=>Date.parse(a.created_at)-Date.parse(b.created_at)).filter(e=>{
  const key=`${e.kind}:${e.source}`;
  if(seen.has(key)) return false;
  seen.add(key);return true;
 });
 return achievementRules.map(rule=>{
  let count=0;let unlockedAt:string|null=null;
  for(const event of ordered) {
   if(rule.kind==="xp") count+=event.points;
   else if(event.kind===rule.kind) count++;
   if(!unlockedAt&&count>=rule.target) unlockedAt=event.created_at;
  }
  return {...rule,progress:Math.min(count,rule.target),unlockedAt};
 });
}
