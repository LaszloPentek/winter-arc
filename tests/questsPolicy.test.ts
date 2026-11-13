// @vitest-environment node
import {PGlite} from "@electric-sql/pglite";
import {readFileSync} from "node:fs";
import {expect,it} from "vitest";
it("protects tasks and XP, detects stale writes, and rewards each source once",async()=>{
 const db=new PGlite(); const a="11111111-1111-4111-8111-111111111111",b="22222222-2222-4222-8222-222222222222",id="33333333-3333-4333-8333-333333333333";
 try {
 await db.exec(`create schema auth; create role anon; create role authenticated;
 create table auth.users(id uuid primary key); insert into auth.users values('${a}'),('${b}');
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth,public to authenticated;
 create table public.daily_checkins(user_id uuid,day date,primary key(user_id,day));
 insert into public.daily_checkins values('${a}','2026-11-13');`);
 await db.exec(readFileSync("supabase/migrations/202611130004_quests_xp.sql","utf8"));
 await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${a}',false);`);
 const call=async(action:string,revision:number)=>db.query("select public.save_todo($1,$2,$3,$4)",[id,revision,action,"Séta"]);
 await call("create",0); await call("create",0);
 expect((await db.query("select * from todos")).rows).toHaveLength(1);
 await call("complete",1);
 await expect(call("reopen",1)).rejects.toThrow("revision conflict");
 await call("reopen",2); await call("complete",3); await call("archive",4); await call("restore",5);
 expect((await db.query<{total:number}>("select sum(points)::integer as total from xp_events")).rows[0].total).toBe(30);
 await expect(db.exec(`insert into xp_events values('${a}','todo','fake',20,now())`)).rejects.toThrow();
 await expect(db.exec("update todos set completed=false")).rejects.toThrow();
 await db.exec(`select set_config('request.jwt.claim.sub','${b}',false)`);
 expect((await db.query("select * from todos")).rows).toHaveLength(0);
 expect((await db.query("select * from xp_events")).rows).toHaveLength(0);
 await expect(call("complete",6)).rejects.toThrow("not found");
 await expect(call("create",0)).rejects.toThrow("not found");
 await db.exec(`reset role; insert into daily_checkins values('${a}','2026-11-14'); update daily_checkins set day=day;`);
 expect((await db.query<{total:number}>("select sum(points)::integer as total from xp_events")).rows[0].total).toBe(40);
 } finally {await db.close();}
},60000);
