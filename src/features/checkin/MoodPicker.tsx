import { Sun, Leaf, MoonStar, Cloud, Mountain } from "lucide-react";
const moods = [
 {label:"Nagyon jól",low:9,high:10,color:"#C5A46D",Icon:Sun},
 {label:"Jól",low:7,high:8,color:"#9BB69D",Icon:Leaf},
 {label:"Megvagyok",low:5,high:6,color:"#91CDE8",Icon:MoonStar},
 {label:"Nehéz most",low:3,high:4,color:"#B4A2C7",Icon:Cloud},
 {label:"Nagyon nehéz",low:1,high:2,color:"#CF9385",Icon:Mountain},
];
export function MoodPicker({value,onChange}:{value:string;onChange:(value:string)=>void}) {
 return <section className="mood-picker" aria-labelledby="mood-heading">
  <div className="mood-ornament" aria-hidden="true">✧</div>
  <h2 id="mood-heading">Hogy vagy most?</h2>
  <p className="mood-intro">Egy pillanat, csak magadnak.</p>
  <div className="mood-options" role="radiogroup" aria-label="Hangulat választása">
   {moods.map(({label,low,high,color,Icon})=><label className="mood-option" key={label} style={{"--mood-color":color} as React.CSSProperties}>
    <input type="radio" name="mood-category" value={low} checked={value!==""&&Number(value)>=low&&Number(value)<=high} onChange={()=>onChange(String(low))}/>
    <span className="mood-card"><span className="mood-radio" aria-hidden="true"/><Icon className="mood-emblem" size={42} strokeWidth={1.25} aria-hidden="true"/><span className="mood-label">{label}<small>{low}–{high} / 10</small></span></span>
   </label>)}
  </div>
  <p className="mood-reassurance">Bármelyik válasz rendben van.</p>
  <p className="mood-help">Választáskor a jelzett pár első értékét állítjuk be. A pontos pontszámot lent, a Hangulat mezőben módosíthatod.</p>
 </section>;
}
