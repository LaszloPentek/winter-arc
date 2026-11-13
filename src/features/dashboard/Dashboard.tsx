import { useCover, useBlobUrl } from "../../hooks/useCover";
import { Link } from "react-router-dom";
import { ArrowUpRight, Feather, Moon, Shield, Snowflake } from "lucide-react";
import {
  BASELINE,
  challengeProgress,
  mean,
  metrics,
  today,
  type Baseline,
  type RecordRow,
} from "../../lib/domain";
import type { Pending } from "../../services/local";
export function Dashboard({
  rows,
  baseline,
  pending,
  signedIn,
  user,
}: {
  rows: RecordRow[];
  baseline: Baseline | null;
  pending: Pending[];
  signedIn: boolean;
  user?: string;
}) {
  const cover = useCover(user);
  const coverUrl = useBlobUrl(cover.data);
  const showCover = Boolean(coverUrl);
  const date = today();
  const progress = challengeProgress(date);
  const current = rows.find((r) => r.day === date);
  const waiting = pending.find((p) => p.data.day === date);
  const displayed = waiting?.data ?? current;
  return (
    <>
      <header className={showCover ? "hero personal-cover" : "hero"}>
        {showCover && <img className="personal-cover-image" src={coverUrl} alt="Winter Arc — The Quiet Season, személyes téli fantasy borító" />}
        <div className="hero-copy">
          <span className="eyebrow">
            <Snowflake size={16} />
            The Quiet Season
          </span>
          <h1>SANCTUARY</h1>
          <p>
            A külvilág várhat.
            <br />
            Ez a pillanat a tiéd.
          </p>
          <Link className="primary" to="/ritual">
            <Feather size={18} />
            {current ? "Mai mérésem szerkesztése" : "Napi bejelentkezés"}
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <span className="hero-caption">A Sanctuary for the Mind</span>
      </header>
      <section className="journey" aria-label="Winter Arc haladás">
        <div>
          <span className="eyebrow">2026. november 13. – december 31.</span>
          <h2>
            {progress.phase === "after" ? (
              "Az út folytatódik"
            ) : progress.phase === "before" ? (
              "Hamarosan kezdődik"
            ) : (
              <>
                {progress.day}. nap <span>/ {progress.total}</span>
              </>
            )}
          </h2>
        </div>
        <div className="journey-progress">
          <div className="between">
            <span>A csendes évszak</span>
            <span>{progress.remaining} nap van hátra</span>
          </div>
          <progress value={progress.day} max={progress.total} />
          <small>A naptár haladása. A kihagyott napok is az utad részei.</small>
        </div>
      </section>
      <section>
        <div className="section-heading">
          <h2>Ahogyan ma vagy</h2>
          <span>
            {waiting
              ? "Helyi, függő mentés"
              : current
                ? "Mentett napi mérés"
                : "Még nincs napi mérés"}
          </span>
        </div>
        <div className="metric-grid">
          {metrics.map(([key, label]) => (
            <article className="metric" key={key}>
              <span>{label}</span>
              <div>
                {displayed?.[key] ?? "—"}
                <small>/ 10</small>
              </div>
              <span className="metric-foot">
                {key === "stress"
                  ? "Az alacsonyabb nyugodtabb"
                  : displayed?.[key] != null
                    ? "A mai visszajelzésed"
                    : "A hiányzó adat nem rossz nap"}
              </span>
            </article>
          ))}
        </div>
      </section>
      <div className="dashboard-bottom">
        <section className="panel baseline">
          <div className="section-heading">
            <h2>Ahonnan elindultál</h2>
            <Shield size={19} />
          </div>
          <p>Kiinduló mérés · 2026. november 12.</p>
          <div className="baseline-grid">
            {metrics.slice(0, 4).map(([key, label]) => (
              <div key={key}>
                <span>{label}</span>
                <strong>
                  {(baseline ?? BASELINE)[key]}
                  <small>/10</small>
                </strong>
              </div>
            ))}
          </div>
          <p className="muted">
            {baseline
              ? "A külön tárolt kiinduló mérésed."
              : "A megbízásban megadott értékek. Fiókhoz mentés az első sikeres kapcsolódáskor."}{" "}
            Energia és motiváció: nincs kiinduló adat.
          </p>
        </section>
        <section className="panel quiet">
          <Moon size={26} />
          <h2>
            Nem kell minden nap
            <br />
            többet tenned.
          </h2>
          <p>A megfigyelés is elég. Térj vissza akkor, amikor jólesik.</p>
          <span className="subtle-rule" />
          <p>
            {rows.length
              ? `${rows.length} rögzített nap. Átlagos hangulat: ${mean(rows.map((r) => r.mood))?.toFixed(1)} / 10.`
              : signedIn
                ? "Az első méréssel kezdődik a saját történeted."
                : "Jelentkezz be, hogy a méréseid több eszközön is elérhetők legyenek."}
          </p>
        </section>
      </div>
    </>
  );
}
