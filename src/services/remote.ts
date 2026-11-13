import { supabase } from "./client";
import type { Baseline, RecordRow } from "../lib/domain";
import type { Pending, Snapshot } from "./local";
import type { SaveResult } from "./sync";
async function authorization(user: string) {
  const { data, error } = await supabase!.auth.getSession();
  if (error || !data.session || data.session.user.id !== user)
    throw new Error("A munkamenet nem a mentés tulajdonosához tartozik.");
  return `Bearer ${data.session.access_token}`;
}
export async function bootstrap(user: string) {
  const token = await authorization(user);
  const { error } = await supabase!.rpc("initialize_winter_arc").setHeader("Authorization", token);
  if (error) throw error;
}
export async function fetchSnapshot(user: string): Promise<Snapshot> {
  const token = await authorization(user);
  const rows: RecordRow[] = [];
  // Do not silently truncate long-term history at the PostgREST row limit.
  for (let offset = 0; ; offset += 500) {
    const records = await supabase!
      .from("daily_checkins")
      .select("*")
      .eq("user_id", user)
      .order("day", { ascending: false })
      .range(offset, offset + 499)
      .setHeader("Authorization", token);
    if (records.error) throw records.error;
    rows.push(...(records.data as RecordRow[]));
    if (records.data.length < 500) break;
  }
  const baseline = await supabase!
    .from("baselines")
    .select("*")
    .eq("user_id", user)
    .eq("day", "2026-11-12")
    .maybeSingle()
    .setHeader("Authorization", token);
  if (baseline.error) throw baseline.error;
  return { user, rows, baseline: baseline.data as Baseline | null };
}
export async function sendPending(item: Pending): Promise<SaveResult> {
  const token = await authorization(item.user);
  const { data, error } = await supabase!.rpc("save_checkin", {
    p_operation: item.id,
    p_expected: item.expected,
    p_data: item.data,
  }).setHeader("Authorization", token);
  if (error) throw error;
  return data as SaveResult;
}
