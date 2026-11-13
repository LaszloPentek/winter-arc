import type { RecordRow } from "../lib/domain";
import { local, type Pending } from "./local";
export type SaveResult =
  | { status: "saved"; row: RecordRow }
  | { status: "conflict"; row: RecordRow | null };
export async function processQueue(
  user: string,
  send: (p: Pending) => Promise<SaveResult>,
  active: () => boolean = () => true,
) {
  for (const item of await local.pending(user)) {
    if (!active()) break;
    if (item.conflict !== undefined) continue;
    const result = await send(item);
    // Never remove the pending item until the server acknowledged it.
    if (result.status === "conflict")
      await local.put({ ...item, conflict: result.row });
    else await local.remove(item.id);
  }
}
export function withSyncLock<T>(
  user: string,
  run: () => Promise<T>,
): Promise<T> {
  return navigator.locks
    ? navigator.locks.request(`winter-sync:${user}`, run)
    : run();
}
