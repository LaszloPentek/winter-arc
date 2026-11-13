import { beforeEach, expect, it } from "vitest";
import { local, type Pending } from "../src/services/local";
import { processQueue } from "../src/services/sync";
const item: Pending = {
  id: "op-1",
  user: "a",
  expected: 0,
  data: {
    day: "2026-11-13",
    mood: 4,
    stress: 7,
    sleep: 7,
    focus: 5,
    energy: null,
    motivation: null,
    note: "Fontos gondolat",
    shift: "rest",
    sleep_hours: null,
    rest_day: true,
  },
};
beforeEach(async () => {
  await local.clear("a");
  await local.clear("b");
});
it("persists offline changes and isolates users", async () => {
  await local.put(item);
  expect(await local.pending("a")).toEqual([item]);
  expect(await local.pending("b")).toEqual([]);
});
it("retains pending data on network failure", async () => {
  await local.put(item);
  await expect(
    processQueue("a", async () => {
      throw new Error("offline");
    }),
  ).rejects.toThrow();
  expect(await local.pending("a")).toHaveLength(1);
});
it("deletes only after server acknowledgement", async () => {
  await local.put(item);
  await processQueue("a", async (p) => ({
    status: "saved",
    row: { ...p.data, user_id: "a", revision: 1, updated_at: "now" },
  }));
  expect(await local.pending("a")).toHaveLength(0);
});
it("preserves both versions on conflict and skips automatic retry", async () => {
  await local.put(item);
  const remote = {
    ...item.data,
    note: "Másik eszköz",
    user_id: "a",
    revision: 2,
    updated_at: "now",
  };
  await processQueue("a", async () => ({ status: "conflict", row: remote }));
  const [queued] = await local.pending("a");
  expect(queued.data.note).toBe("Fontos gondolat");
  expect(queued.conflict?.note).toBe("Másik eszköz");
  await processQueue("a", async () => {
    throw new Error("must not retry");
  });
});
it("stops a queue after account change", async () => {
  await local.put(item);
  await processQueue(
    "a",
    async () => {
      throw new Error("must not send");
    },
    () => false,
  );
  expect(await local.pending("a")).toHaveLength(1);
});
it("treats a remotely deleted record as an explicit conflict", async () => {
  await local.put(item);
  await processQueue("a", async () => ({ status: "conflict", row: null }));
  expect((await local.pending("a"))[0].conflict).toBeNull();
  await processQueue("a", async () => {
    throw new Error("must not retry");
  });
});
