import {describe,it,expect} from "vitest";
import {calculateAchievements,type XpEvent} from "../src/features/achievements/rules";
const event=(kind:"checkin"|"todo",i:number):XpEvent=>({kind,source:String(i),points:kind==="todo"?20:10,created_at:new Date(Date.UTC(2026,10,1+i)).toISOString()});
describe("achievement rules",()=>{
 it("shows seven locked badges without inventing progress",()=>{const result=calculateAchievements([]);expect(result).toHaveLength(7);expect(result.every(a=>a.progress===0&&!a.unlockedAt)).toBe(true);});
 it("unlocks at the exact threshold and keeps the first qualifying date",()=>{
  const rows=Array.from({length:30},(_,i)=>event("checkin",i));
  const result=calculateAchievements(rows.reverse());
  expect(result[0].unlockedAt).toBe(event("checkin",0).created_at);
  expect(result[1].unlockedAt).toBe(event("checkin",6).created_at);
  expect(result[2].unlockedAt).toBe(event("checkin",29).created_at);
  expect(result[6].unlockedAt).toBeNull();
 });
 it("deduplicates repeated sources and keeps kinds distinct",()=>{
  const a=event("todo",0); const result=calculateAchievements([a,a,event("checkin",0)]);
  expect(result[3].progress).toBe(1);expect(result[0].progress).toBe(1);expect(result[6].progress).toBe(30);
 });
 it("level five means 400 XP, and 50 distinct todos unlock mastery",()=>{
  const rows=Array.from({length:50},(_,i)=>event("todo",i));
  expect(calculateAchievements(rows.slice(0,19))[6].unlockedAt).toBeNull();
  const result=calculateAchievements(rows);
  expect(result[6].unlockedAt).toBe(rows[19].created_at);
  expect(result[4].unlockedAt).toBe(rows[9].created_at);
  expect(result[5].unlockedAt).toBe(rows[49].created_at);
 });
});
