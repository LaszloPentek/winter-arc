import { z } from "zod";
import { differenceInCalendarDays, parseISO } from "date-fns";

export const START = "2026-11-13";
export const END = "2026-12-31";
export function today(now = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
export function challengeProgress(day: string) {
  const total = differenceInCalendarDays(parseISO(END), parseISO(START)) + 1;
  const elapsed = differenceInCalendarDays(parseISO(day), parseISO(START)) + 1;
  return {
    total,
    day: Math.min(total, Math.max(0, elapsed)),
    remaining: Math.max(0, total - Math.max(0, elapsed)),
    phase: elapsed < 1 ? "before" : elapsed > total ? "after" : "active",
  };
}
const score = z.number().int().min(1).max(10);
export const checkinSchema = z
  .object({
    day: z.iso.date(),
    mood: score,
    stress: score,
    sleep: score,
    focus: score,
    energy: score.nullable(),
    motivation: score.nullable(),
    note: z.string().max(4000),
    shift: z.enum(["morning", "afternoon", "rest", "other"]),
    sleep_hours: z.number().min(0).max(24).nullable(),
    rest_day: z.boolean(),
  })
  .strict();
export type Checkin = z.infer<typeof checkinSchema>;
export interface RecordRow extends Checkin {
  user_id: string;
  revision: number;
  updated_at: string;
}
export interface Baseline {
  day: string;
  mood: number;
  stress: number;
  sleep: number;
  focus: number;
  energy: number | null;
  motivation: number | null;
}
export const BASELINE: Baseline = {
  day: "2026-11-12",
  mood: 4,
  stress: 7,
  sleep: 7,
  focus: 5,
  energy: null,
  motivation: null,
};
export const metrics = [
  ["mood", "Hangulat"],
  ["stress", "Stressz"],
  ["sleep", "Alvásminőség"],
  ["focus", "Koncentráció"],
  ["energy", "Energia"],
  ["motivation", "Motiváció"],
] as const;
export function mean(values: (number | null | undefined)[]) {
  const known = values.filter((v): v is number => v != null);
  return known.length ? known.reduce((a, b) => a + b, 0) / known.length : null;
}
export function payload(row: Checkin): Checkin {
  return checkinSchema.parse(
    Object.fromEntries(
      Object.keys(checkinSchema.shape).map((k) => [k, row[k as keyof Checkin]]),
    ),
  );
}
