import { useState, type FormEvent } from "react";
import { LockKeyhole, Mail } from "lucide-react";
import { configured, supabase } from "../../services/client";
import { local } from "../../services/local";
import { withSyncLock } from "../../services/sync";
import { authSendError } from "../../lib/authSendError";
import { authReturnUrl } from "../../lib/authRedirect";
import type { Session } from "@supabase/supabase-js";
export function Settings({
  session,
  pendingCount,
  onLogout,
}: {
  session: Session | null;
  pendingCount: number;
  onLogout: () => void;
}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function auth(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true, emailRedirectTo: authReturnUrl(window.location.origin, import.meta.env.BASE_URL) },
      });
      if (error) throw error;
      setSent(true);
      setMessage("Elküldtük a belépőlinket. Nyisd meg a levelet, és kattints a benne lévő gombra ugyanebben a böngészőben. A levél angol nyelvű is lehet.");
    } catch (error) {
      setMessage(authSendError(error));
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    if (!session || !supabase || pendingCount) return;
    setBusy(true);
    setMessage("");
    try {
      await withSyncLock(session.user.id, async () => {
        if ((await local.pending(session.user.id)).length)
          throw new Error("Függő mentések");
        const { error } = await supabase!.auth.signOut({ scope: "local" });
        if (error) throw error;
        await local.clear(session.user.id);
        onLogout();
      });
    } catch {
      setMessage(
        "A kijelentkezés vagy a helyi gyorsítótár törlése nem sikerült. Ellenőrizd a kapcsolatot.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <header className="page-heading">
        <span className="eyebrow">A te menedéked</span>
        <h1>Fiók és beállítások</h1>
        <p>Ugyanazzal a fiókkal telefonon és számítógépen.</p>
      </header>
      <section className="panel settings-panel">
        <LockKeyhole size={28} />
        <h2>{session ? "Bejelentkezve" : "Privát tér, saját fiókkal"}</h2>
        {!configured ? (
          <>
            <p>
              A felhőkapcsolat még nincs beállítva. A mentés a Supabase-projekt
              csatlakoztatása után lesz elérhető.
            </p>
            <ol>
              <li>Hozz létre egy Supabase-projektet.</li>
              <li>Futtasd a mellékelt SQL-migrációkat.</li>
              <li>
                Add meg a projekt URL-jét és publikus kulcsát a helyi{" "}
                <code>.env.local</code> fájlban.
              </li>
              <li>
                Állítsd be a visszatérési címet a README szerint, majd
                indítsd újra az alkalmazást.
              </li>
            </ol>
            <p>A pontos útmutató a projekt README.md fájljában található.</p>
          </>
        ) : session ? (
          <>
            <p>{session.user.email}</p>
            <p>
              A személyes adatok hozzáférését a fiókodhoz kötött
              adatbázis-szabályok korlátozzák.
            </p>
            <button
              onClick={() => void logout()}
              disabled={pendingCount > 0 || busy}
            >
              Kijelentkezés erről az eszközről
            </button>
            {pendingCount > 0 && (
              <p>
                Előbb rendezd a függő mentéseket és az ütközéseket (
                {pendingCount}). Így a helyi adataid megmaradnak.
              </p>
            )}
          </>
        ) : (
          <form onSubmit={auth}>
            <label>
              E-mail-cím
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                disabled={sent}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <button className="primary" disabled={busy || sent}>
              <Mail size={18} />
              {busy ? "Egy pillanat…" : sent ? "Link elküldve" : "Belépőlink kérése"}
            </button>
            {sent && (
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setMessage("");
                }}
              >
                Másik cím vagy új link
              </button>
            )}
            <p>Az első belépéssel létrejön a fiókod. Nincs szükség jelszóra. A levelet ugyanazon az eszközön, ugyanabban a böngészőben nyisd meg, ahol a linket kérted.</p>
          </form>
        )}
        <p role="status">{message}</p>
      </section>
      <section className="panel settings-panel">
        <h2>Adatvédelem</h2>
        <p>
          Nincs reklám és külső használatelemzés. Az alkalmazás nem
          diagnosztikai vagy terápiás eszköz.
        </p>
        <p>
          A gyorsítótár ezen az eszközön tárolja a méréseidet, ezért saját,
          zárolható eszközön használd. A kijelentkezés törli ennek a fióknak a
          helyi másolatát. A felhőadatok megmaradnak.
        </p>
        <p>
          A teljes export/import és a fióktörlés kezelőfelülete a P4 része.
          Addig az adatbázis tulajdonosa a Supabase kezelőfelületén exportálhat,
          illetve törölhet felhasználót; a kapcsolódó P0 rekordok törlése
          automatikus.
        </p>
      </section>
    </>
  );
}
