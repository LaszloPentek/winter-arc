import { supabase } from "./client";
import type { XpEvent } from "../features/achievements/rules";
// Explicit paging avoids the API row limit silently truncating XP and achievements.
export async function fetchXpEvents(user:string):Promise<XpEvent[]> {
 const events:XpEvent[]=[];
 for(let offset=0;;offset+=500) {
  const {data,error}=await supabase!.from("xp_events").select("kind,source,points,created_at").eq("user_id",user)
   .order("created_at").order("kind").order("source").range(offset,offset+499);
  if(error) throw new Error("Az XP és a jelvények nem tölthetők be. Próbáld meg újra a lista frissítését.");
  events.push(...data as XpEvent[]);
  if(data.length<500) return events;
 }
}
