// Actual PostgreSQL execution in WASM. Auth roles and auth.uid() mirror the JWT boundary.
// This validates SQL/RLS; hosted Auth, Realtime and two-device transport still need live verification.
// @vitest-environment node
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
const A = "11111111-1111-4111-8111-111111111111",
  B = "22222222-2222-4222-8222-222222222222";
let db: PGlite;
const value = {
  day: "2026-01-01",
  mood: 4,
  stress: 7,
  sleep: 7,
  focus: 5,
  energy: null,
  motivation: null,
  note: "Első",
  shift: "rest",
  sleep_hours: null,
  rest_day: true,
};
async function asUser(user: string) {
  await db.exec(
    `reset role; set role authenticated; select set_config('request.jwt.claim.sub','${user}',false);`,
  );
}
async function save(expected: number, data = value, id = crypto.randomUUID()) {
  return (
    await db.query<{
      r: { status: string; row: { revision: number; note: string } };
    }>("select public.save_checkin($1,$2,$3::jsonb) as r", [
      id,
      expected,
      JSON.stringify(data),
    ])
  ).rows[0].r;
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create schema auth; create role anon; create role authenticated;
 create table auth.users(id uuid primary key); insert into auth.users values('${A}'),('${B}');
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth,public to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;`);
  await db.exec(
    readFileSync("supabase/migrations/202611130001_foundation.sql", "utf8"),
  );
  await db.exec(
    readFileSync("supabase/migrations/202611130002_realtime.sql", "utf8"),
  );
}, 60000);
afterAll(async () => {
  await db?.close();
});
describe("PostgreSQL security and persistence", () => {
  it("initializes baseline once and preserves existing values", async () => {
    await asUser(A);
    await db.exec(
      "select public.initialize_winter_arc();select public.initialize_winter_arc();",
    );
    let result = await db.query<{ mood: number; energy: null }>(
      "select * from public.baselines",
    );
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].energy).toBeNull();
    await db.exec("reset role; update public.baselines set mood=6;");
    await asUser(A);
    await db.exec("select public.initialize_winter_arc()");
    result = await db.query("select * from public.baselines");
    expect(result.rows[0].mood).toBe(6);
  });
  it("saves and retries idempotently", async () => {
    await asUser(A);
    const id = crypto.randomUUID();
    const first = await save(0, value, id);
    const repeat = await save(0, value, id);
    expect(first.status).toBe("saved");
    expect(repeat).toEqual(first);
    expect(
      (await db.query("select * from public.daily_checkins")).rows,
    ).toHaveLength(1);
  });
  it("edits with version history and preserves rest days", async () => {
    await asUser(A);
    expect((await save(1, { ...value, note: "Második" })).row.revision).toBe(2);
    expect(
      (await db.query("select * from public.checkin_versions")).rows,
    ).toHaveLength(1);
    expect(
      (
        await db.query<{ rest_day: boolean }>(
          "select rest_day from public.daily_checkins",
        )
      ).rows[0].rest_day,
    ).toBe(true);
  });
  it("rejects stale edits without losing either saved version", async () => {
    await asUser(A);
    expect((await save(1, { ...value, note: "Elavult" })).status).toBe(
      "conflict",
    );
    expect(
      (
        await db.query<{ note: string }>(
          "select note from public.daily_checkins",
        )
      ).rows[0].note,
    ).toBe("Második");
  });
  it("cannot read another owner data, history, baseline or receipts", async () => {
    await asUser(B);
    for (const table of [
      "profiles",
      "challenges",
      "baselines",
      "daily_checkins",
      "checkin_versions",
      "sync_operations",
    ])
      expect(
        (await db.query(`select * from public.${table}`)).rows,
      ).toHaveLength(0);
  });
  it("allows each owner one independent entry for the same day", async () => {
    await asUser(B);
    expect((await save(0)).status).toBe("saved");
    expect(
      (await db.query("select * from public.daily_checkins")).rows,
    ).toHaveLength(1);
  });
  it("blocks direct writes and owner spoofing", async () => {
    await asUser(B);
    await expect(
      db.exec(
        `update public.daily_checkins set note='hacked' where user_id='${A}'`,
      ),
    ).rejects.toThrow();
    await expect(
      save(0, { ...value, user_id: A } as typeof value),
    ).rejects.toThrow();
  });
  it("rejects invalid scores and anonymous access", async () => {
    await asUser(B);
    await expect(save(1, { ...value, mood: 11 })).rejects.toThrow();
    await db.exec(
      "reset role;set role anon;select set_config('request.jwt.claim.sub','',false);",
    );
    await expect(
      db.exec("select * from public.daily_checkins"),
    ).rejects.toThrow();
    await expect(
      db.exec("select public.initialize_winter_arc()"),
    ).rejects.toThrow();
    await expect(save(0)).rejects.toThrow();
  });
});
