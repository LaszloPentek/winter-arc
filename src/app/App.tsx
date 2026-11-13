import { useState } from "react";
import { HashRouter, Link, NavLink, Route, Routes } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Cloud,
  CloudOff,
  Feather,
  Home,
  Settings as SettingsIcon,
  Shield,
  Snowflake,
  Swords,
} from "lucide-react";
import { useAuth } from "./Auth";
import { useRecords } from "../hooks/useRecords";
import { Dashboard } from "../features/dashboard/Dashboard";
import { RitualForm, RitualHeader } from "../features/checkin/Ritual";
import { Settings } from "../features/settings/Settings";
import { metrics, today, type Checkin } from "../lib/domain";
import { configured } from "../services/client";

const navigation = [
  ["/", "Sanctuary", Home],
  ["/ritual", "Ritual", Feather],
  ["/quests", "Quests", Swords],
  ["/chronicle", "Chronicle", Shield],
  ["/journal", "Journal", BookOpen],
] as const;
function Planned({ name, phase }: { name: string; phase: string }) {
  return (
    <section className="planned panel">
      <Snowflake size={34} />
      <span className="eyebrow">Következő fejezet · {phase}</span>
      <h1>{name}</h1>
      <p>
        Ez a funkció a következő fejlesztési szakaszban készül el. A napi
        mérések már a Ritual oldalon rögzíthetők a fiók csatlakoztatása után.
      </p>
      <Link to="/ritual" className="primary">
        A napi mérésemhez
      </Link>
    </section>
  );
}
export function App() {
  const { session } = useAuth();
  return (
    <HashRouter>
      <Shell key={session?.user.id ?? "guest"} />
    </HashRouter>
  );
}
function Shell() {
  const { session, loading, authError } = useAuth();
  const qc = useQueryClient();
  const records = useRecords(session?.user.id);
  const [date, setDate] = useState(today());
  const rows = records.data?.rows ?? [];
  const row = rows.find((r) => r.day === date);
  const pending = records.pending;
  const dayPending = pending.find((p) => p.data.day === date);
  const state = !configured
    ? "Felhőkapcsolat beállítandó"
    : !session
      ? "Nincs bejelentkezve"
      : !records.online
        ? "Offline · helyi adatok"
        : records.syncing
          ? "Szinkronizálás folyamatban"
          : records.error
            ? "Szinkronizációs hiba"
            : pending.length
              ? `${pending.length} függő mentés`
              : records.verified && !records.isFetching
                ? "Mentve · felhővel egyeztetve"
                : "Adatok betöltése…";
  return (
    <div className="app-shell">
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        Ugrás a tartalomra
      </a>
      <aside className="sidebar">
        <Link to="/" className="brand">
          <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />
          <span>
            WINTER ARC<small>The Quiet Season</small>
          </span>
        </Link>
        <p className="nav-caption">A belső világod</p>
        <nav aria-label="Fő navigáció">
          {navigation.map(([path, label, Icon]) => (
            <NavLink end={path === "/"} key={path} to={path}>
              <Icon size={19} />
              <span>{label}</span>
              {["Quests", "Journal"].includes(label) && <small>P1</small>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <p>
            „A csendben is
            <br />
            történik változás.”
          </p>
          <NavLink to="/settings">
            <SettingsIcon size={18} />
            Fiók és beállítások
          </NavLink>
          <span>2026 · A te ritmusodban</span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>
            {new Intl.DateTimeFormat("hu-HU", {
              timeZone: "Europe/Budapest",
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            }).format(new Date())}
          </span>
          <Link to="/settings" className="account">
            <span className="account-dot" />
            {session ? "Saját menedékem" : "Belépés"}
            <SettingsIcon size={16} />
          </Link>
        </header>
        <div
          className={`syncbar ${records.error ? "error" : ""}`}
          role="status"
        >
          {records.online ? <Cloud size={15} /> : <CloudOff size={15} />}
          <span>{state}</span>
          {session && (
            <button
              onClick={() => void records.sync()}
              disabled={records.syncing || !records.online}
            >
              Frissítés
            </button>
          )}
        </div>
        <main id="main" tabIndex={-1}>
          {loading && <p role="status">Munkamenet ellenőrzése…</p>}
          {authError && (
            <p role="alert" className="notice">
              {authError}
            </p>
          )}
          {records.error && (
            <p role="alert" className="notice">
              {records.error}
            </p>
          )}
          {pending
            .filter((p) => p.conflict !== undefined)
            .map((p) => (
              <section className="conflict panel" key={p.id}>
                <h2>Két változat ugyanarra a napra · {p.data.day}</h2>
                <p>
                  Másik eszközön is változott. Nézd át a két változatot. A
                  döntéskor biztonsági másolatot töltünk le; ez személyes
                  adatokat tartalmaz.
                </p>
                <div className="two-fields">
                  <ConflictVersion title="Ezen az eszközön" data={p.data} />
                  <ConflictVersion
                    title="A felhőben"
                    data={p.conflict ?? null}
                  />
                </div>
                <div className="actions">
                  <button
                    onClick={() =>
                      void records
                        .resolve(p, "local")
                        .catch(() =>
                          window.alert(
                            "Az ütközés feloldása nem sikerült; a változatok megmaradtak.",
                          ),
                        )
                    }
                  >
                    Helyi változat mentése
                  </button>
                  <button
                    onClick={() =>
                      void records
                        .resolve(p, "server")
                        .catch(() =>
                          window.alert(
                            "Az ütközés feloldása nem sikerült; a változatok megmaradtak.",
                          ),
                        )
                    }
                  >
                    Felhőváltozat megtartása
                  </button>
                </div>
              </section>
            ))}
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  rows={rows}
                  baseline={records.data?.baseline ?? null}
                  pending={pending}
                  signedIn={Boolean(session)}
                  user={session?.user.id}
                />
              }
            />
            <Route
              path="/ritual"
              element={
                <>
                  <RitualHeader />
                  <div className="ritual-layout">
                    <section className="panel">
                      <label className="date-field">
                        Melyik naphoz térsz vissza?
                        <input
                          aria-label="Mérés dátuma"
                          type="date"
                          value={date}
                          max={today()}
                          onChange={(e) => {
                            if (e.target.value) setDate(e.target.value);
                          }}
                        />
                      </label>
                      {!session && (
                        <p className="notice">
                          A mentéshez{" "}
                          <Link to="/settings">
                            jelentkezz be vagy állítsd be a fiókot
                          </Link>
                          .
                        </p>
                      )}
                      {dayPending && (
                        <p className="notice">
                          Ehhez a naphoz függő helyi mentés tartozik.
                          Szinkronizálás után újra szerkeszthető.
                        </p>
                      )}
                      <RitualForm
                        key={`${session?.user.id}:${date}`}
                        date={date}
                        row={row}
                        disabled={!session || Boolean(dayPending)}
                        onSave={records.save}
                      />
                    </section>
                    <aside className="ritual-help">
                      <MoonNote />
                      <h3>A saját skálád</h3>
                      <p>
                        1: alacsony, 10: magas. A stressznél az alacsonyabb
                        érték jelent nyugodtabb állapotot.
                      </p>
                      <p>
                        Az energia és motiváció kihagyható. Egy naphoz egy mérés
                        tartozik, amit később módosíthatsz.
                      </p>
                    </aside>
                  </div>
                </>
              }
            />
            <Route
              path="/chronicle"
              element={
                <>
                  <header className="page-heading">
                    <span className="eyebrow">Chronicle</span>
                    <h1>A napjaid lenyomata</h1>
                    <p>
                      A mentett méréseid. A hiányzó napoknak nincs pontszámuk.
                    </p>
                  </header>
                  {!rows.length ? (
                    <section className="panel">
                      <h2>Még nincs felhőben rögzített nap.</h2>
                      <Link to="/ritual">Elkészítem az első mérésem</Link>
                    </section>
                  ) : (
                    <div className="history">
                      {rows.map((r) => (
                        <article className="panel" key={r.day}>
                          <div className="section-heading">
                            <h2>{r.day}</h2>
                            <Link to="/ritual" onClick={() => setDate(r.day)}>
                              Szerkesztés
                            </Link>
                          </div>
                          <div className="history-metrics">
                            {metrics.map(([key, label]) => (
                              <span key={key}>
                                {label}: <strong>{r[key] ?? "—"}</strong>
                              </span>
                            ))}
                          </div>
                          {r.rest_day && <p>Pihenőnap</p>}
                          {r.note && <p className="user-note">{r.note}</p>}
                        </article>
                      ))}
                    </div>
                  )}
                </>
              }
            />
            <Route
              path="/quests"
              element={<Planned name="A saját küldetéseid" phase="P1" />}
            />
            <Route
              path="/journal"
              element={<Planned name="Önismereti napló" phase="P1" />}
            />
            <Route
              path="/settings"
              element={
                <Settings
                  session={session}
                  pendingCount={pending.length}
                  onLogout={() => qc.clear()}
                />
              }
            />
            <Route
              path="*"
              element={
                <section className="panel">
                  <h1>Ez az ösvény nem található.</h1>
                  <Link to="/">Vissza a Sanctuaryhoz</Link>
                </section>
              }
            />
          </Routes>
          <footer>
            Winter Arc — The Quiet Season
            <span>Egy nyugodtabb kapcsolat önmagaddal.</span>
          </footer>
        </main>
      </div>
      <nav className="mobile-nav" aria-label="Mobil navigáció">
        {navigation.map(([path, label, Icon]) => (
          <NavLink end={path === "/"} key={path} to={path}>
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
function MoonNote() {
  return (
    <>
      <Feather size={26} />
      <h2>Ez nem vizsga.</h2>
      <p>Nem kell jobban lenned, mint tegnap. Elég észrevenni, hol vagy ma.</p>
    </>
  );
}
function ConflictVersion({
  title,
  data,
}: {
  title: string;
  data: Checkin | null;
}) {
  return (
    <article>
      <h3>{title}</h3>
      {data ? (
        <>
          <dl>
            {metrics.map(([key, label]) => (
              <div key={key} className="between">
                <dt>{label}</dt>
                <dd>{data[key] ?? "Nincs adat"}</dd>
              </div>
            ))}
            <div className="between">
              <dt>Alvásidő</dt>
              <dd>
                {data.sleep_hours == null
                  ? "Nincs adat"
                  : `${data.sleep_hours} óra`}
              </dd>
            </div>
            <div className="between">
              <dt>Műszak</dt>
              <dd>
                {
                  {
                    morning: "Délelőttös",
                    afternoon: "Délutános",
                    rest: "Szabadnap",
                    other: "Egyéb",
                  }[data.shift]
                }
              </dd>
            </div>
            <div className="between">
              <dt>Pihenőnap</dt>
              <dd>{data.rest_day ? "Igen" : "Nem"}</dd>
            </div>
          </dl>
          <p className="user-note">{data.note || "Nincs megjegyzés."}</p>
        </>
      ) : (
        <p>A rekordot közben törölték, vagy nem létezik.</p>
      )}
    </article>
  );
}
