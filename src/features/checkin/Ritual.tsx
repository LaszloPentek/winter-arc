import { MoodPicker } from "./MoodPicker";
import { useEffect, useState, type FormEvent } from "react";
import { Check, Feather } from "lucide-react";
import {
  checkinSchema,
  metrics,
  payload,
  today,
  type Checkin,
  type RecordRow,
} from "../../lib/domain";
export function RitualForm({
  date,
  row: incoming,
  disabled,
  onSave,
}: {
  date: string;
  row?: RecordRow;
  disabled: boolean;
  onSave: (data: Checkin, expected: number) => Promise<void>;
}) {
  const [row, setRow] = useState(incoming);
  const [dirty, setDirty] = useState(false);
  const [scores, setScores] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      metrics.map(([key]) => [key, row?.[key]?.toString() ?? ""]),
    ),
  );
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!dirty) {
      setRow(incoming);
      setScores(
        Object.fromEntries(
          metrics.map(([key]) => [key, incoming?.[key]?.toString() ?? ""]),
        ),
      );
    }
  }, [incoming, dirty]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    const form = new FormData(e.currentTarget);
    const parsed = checkinSchema.safeParse({
      day: date,
      ...Object.fromEntries(
        metrics.map(([key]) => [
          key,
          scores[key] === "" ? null : Number(scores[key]),
        ]),
      ),
      note: form.get("note"),
      shift: form.get("shift"),
      sleep_hours:
        form.get("sleep_hours") === "" ? null : Number(form.get("sleep_hours")),
      rest_day: form.get("rest_day") === "on",
    });
    if (!parsed.success) {
      setMessage(
        "Töltsd ki a négy alapmutatót 1–10 között, és ellenőrizd a többi mezőt.",
      );
      return;
    }
    if (date > today()) {
      setMessage("Jövőbeli naphoz még nem menthető mérés.");
      return;
    }
    setBusy(true);
    try {
      await onSave(payload(parsed.data), row?.revision ?? 0);
      setDirty(false);
      setMessage("Helyben elmentve. A felhőmentés állapotát fent követheted.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Nem sikerült menteni. A kitöltött mezők megmaradtak.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      onSubmit={submit}
      onChange={() => setDirty(true)}
      className="ritual-form"
    >
      {dirty && incoming?.revision !== row?.revision && (
        <p className="notice">
          Közben másik eszközön változott ez a nap. A kitöltésed megmaradt;
          mentéskor összehasonlíthatod a változatokat.
        </p>
      )}
      <fieldset key={row?.revision ?? 0} disabled={disabled || busy}>
        <legend className="sr-only">Napi állapotfelmérés</legend>
        <MoodPicker value={scores.mood} onChange={(value) => { setDirty(true); setScores({ ...scores, mood: value }); }} />
        <div className="score-grid">
          {metrics.map(([key, label], i) => (
            <label className="score-input" key={key}>
              <span>
                {label}
                {i > 3 && <small>Opcionális</small>}
              </span>
              <select
                aria-label={label}
                required={i < 4}
                value={scores[key]}
                onChange={(e) =>
                  setScores({ ...scores, [key]: e.target.value })
                }
              >
                <option value="">
                  {i < 4 ? "Válassz értéket" : "Nem rögzítem"}
                </option>
                {Array.from({ length: 10 }, (_, n) => (
                  <option key={n} value={n + 1}>
                    {n + 1} / 10
                  </option>
                ))}
              </select>
              <span className="scale">
                <span>{key === "stress" ? "Nyugodt" : "Alacsony"}</span>
                <span>{key === "stress" ? "Nagyon feszült" : "Magas"}</span>
              </span>
            </label>
          ))}
        </div>
        <div className="two-fields">
          <label>
            Műszak
            <select name="shift" defaultValue={row?.shift ?? "other"}>
              <option value="morning">Délelőttös</option>
              <option value="afternoon">Délutános</option>
              <option value="rest">Szabadnap</option>
              <option value="other">Egyéb</option>
            </select>
          </label>
          <label>
            Alvásidő <small>(opcionális, óra)</small>
            <input
              name="sleep_hours"
              type="number"
              min="0"
              max="24"
              step="0.25"
              defaultValue={row?.sleep_hours ?? ""}
            />
          </label>
        </div>
        <label>
          Néhány szó a mai napról <small>(opcionális)</small>
          <textarea
            name="note"
            maxLength={4000}
            rows={4}
            placeholder="Annyit írj, amennyi most jólesik."
            defaultValue={row?.note ?? ""}
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            name="rest_day"
            defaultChecked={row?.rest_day ?? false}
          />
          Ez egy pihenőnap. Teret adok a regenerációnak.
        </label>
        <button className="primary" type="submit" disabled={busy || disabled}>
          <Check size={18} />
          {busy
            ? "Helyi mentés…"
            : row
              ? "Mérés módosítása"
              : "Napi mérés mentése"}
        </button>
      </fieldset>
      <p role="status" className="form-status">
        {message}
      </p>
    </form>
  );
}
export function RitualHeader() {
  return (
    <header className="page-heading">
      <span className="eyebrow">
        <Feather size={15} />
        Daily Ritual
      </span>
      <h1>Egy pillanat magadnak.</h1>
      <p>Nincs jó vagy rossz válasz. Csak azt jelöld, ahogyan most vagy.</p>
    </header>
  );
}
