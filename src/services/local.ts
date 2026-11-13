import type { Baseline, Checkin, RecordRow } from "../lib/domain";
export interface Pending {
  id: string;
  user: string;
  data: Checkin;
  expected: number;
  conflict?: RecordRow | null;
}
export interface Snapshot {
  user: string;
  rows: RecordRow[];
  baseline: Baseline | null;
}
const DB_NAME = "winter-arc-p0";
export async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore("pending", { keyPath: "id" });
      db.createObjectStore("snapshots", { keyPath: "user" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function access<T>(
  store: string,
  mode: IDBTransactionMode,
  action: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const req = action(tx.objectStore(store));
    tx.oncomplete = () => {
      resolve(req.result);
      db.close();
    };
    tx.onerror = tx.onabort = () => {
      reject(
        tx.error ?? req.error ?? new Error("A helyi mentés nem sikerült."),
      );
      db.close();
    };
  });
}
export const local = {
  async pending(user: string) {
    return (
      (await access("pending", "readonly", (s) => s.getAll())) as Pending[]
    ).filter((p) => p.user === user);
  },
  put(p: Pending) {
    return access("pending", "readwrite", (s) => s.put(p));
  },
  remove(id: string) {
    return access("pending", "readwrite", (s) => s.delete(id));
  },
  snapshot(user: string) {
    return access("snapshots", "readonly", (s) => s.get(user)) as Promise<
      Snapshot | undefined
    >;
  },
  cache(snapshot: Snapshot) {
    return access("snapshots", "readwrite", (s) => s.put(snapshot));
  },
  async clear(user: string) {
    for (const p of await this.pending(user)) await this.remove(p.id);
    await access("snapshots", "readwrite", (s) => s.delete(user));
  },
};
