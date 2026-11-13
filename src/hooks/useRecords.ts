import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { checkinSchema, type Checkin } from "../lib/domain";
import { local, type Pending } from "../services/local";
import { bootstrap, fetchSnapshot, sendPending } from "../services/remote";
import { processQueue, withSyncLock } from "../services/sync";
import { supabase } from "../services/client";

export function useRecords(user: string | undefined) {
  const qc = useQueryClient();
  const [pending, setPending] = useState<Pending[]>([]);
  const [online, setOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const active = useRef(user);
  active.current = user;
  useEffect(() => {
    active.current = user;
    return () => { active.current = undefined; };
  }, [user]);
  const busy = useRef(false);
  const query = useQuery({
    queryKey: ["records", user],
    enabled: Boolean(user),
    queryFn: async () => {
      const snapshot = await local.snapshot(user!);
      if (!navigator.onLine)
        return snapshot ?? { user: user!, rows: [], baseline: null };
      await bootstrap(user!);
      const remote = await fetchSnapshot(user!);
      await local.cache(remote);
      if (active.current === user) setVerified(true);
      return remote;
    },
    retry: 1,
    refetchInterval: online ? 30000 : false,
  });
  useEffect(() => {
    let alive = true;
    if (user) {
      void local
        .snapshot(user)
        .then((s) => {
          if (alive && s && !qc.getQueryData(["records", user]))
            qc.setQueryData(["records", user], s);
        })
        .catch(() => {
          if (alive) setError("A helyi tároló nem érhető el.");
        });
      void local
        .pending(user)
        .then((p) => {
          if (alive) setPending(p);
        })
        .catch(() => {
          if (alive) setError("A helyi mentési sor nem olvasható.");
        });
    }
    return () => {
      alive = false;
    };
  }, [user, qc]);
  const sync = useCallback(async () => {
    if (!user || !navigator.onLine || busy.current) return;
    busy.current = true;
    setSyncing(true);
    setError("");
    try {
      await withSyncLock(user, async () => {
        if (active.current !== user) return;
        await bootstrap(user);
        await processQueue(user, sendPending, () => active.current === user);
        if (active.current === user) {
          setPending(await local.pending(user));
          await qc.invalidateQueries({ queryKey: ["records", user] });
        }
      });
    } catch {
      if (active.current === user)
        setError(
          "A szinkronizálás nem sikerült. A helyi mentések megmaradtak. Próbáld újra.",
        );
    } finally {
      busy.current = false;
      if (active.current === user) setSyncing(false);
    }
  }, [user, qc]);
  useEffect(() => {
    const onOnline = () => {
      setOnline(true);
      void sync();
    };
    const onOffline = () => {
      setOnline(false);
      setVerified(false);
    };
    const onFocus = () => {
      void sync();
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("focus", onFocus);
    const timer = window.setInterval(() => {
      void sync();
    }, 30000);
    void sync();
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("focus", onFocus);
      clearInterval(timer);
    };
  }, [sync]);
  useEffect(() => {
    if (!user || !supabase) return;
    const channel = supabase
      .channel(`checkins:${user}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "daily_checkins",
          filter: `user_id=eq.${user}`,
        },
        () => {
          void qc.invalidateQueries({ queryKey: ["records", user] });
        },
      )
      .subscribe();
    return () => {
      void supabase!.removeChannel(channel);
    };
  }, [user, qc]);
  async function save(data: Checkin, expected: number) {
    if (!user) throw new Error("A mentéshez jelentkezz be.");
    checkinSchema.parse(data);
    await withSyncLock(user, async () => {
      if (active.current !== user)
        throw new Error("A munkamenet megváltozott. Jelentkezz be újra.");
      if ((await local.pending(user)).some((p) => p.data.day === data.day))
        throw new Error(
          "Ehhez a naphoz már van függő mentés. Előbb szinkronizáld vagy oldd fel az ütközést.",
        );
      await local.put({ id: crypto.randomUUID(), user, data, expected });
      setPending(await local.pending(user));
    });
    void sync();
  }
  async function resolve(item: Pending, choice: "local" | "server") {
    if (!user || item.user !== user) return;
    // Download both versions before an explicit decision; server history retains replaced rows.
    const blob = new Blob([JSON.stringify(item, null, 2)], {
      type: "application/json",
    });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `winter-arc-utkozes-${item.data.day}.json`;
    a.click();
    URL.revokeObjectURL(href);
    await withSyncLock(user, async () => {
      if (choice === "local")
        await local.put({
          ...item,
          expected: item.conflict?.revision ?? 0,
          conflict: undefined,
        });
      else await local.remove(item.id);
      setPending(await local.pending(user));
    });
    void sync();
  }
  return {
    ...query,
    pending,
    online,
    syncing,
    verified,
    error:
      error ||
      (query.error
        ? "A szerveradatok nem tölthetők be. Ellenőrizd a kapcsolatot és a Supabase beállításait."
        : ""),
    save,
    sync,
    resolve,
  };
}
