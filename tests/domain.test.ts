import { describe, it, expect } from "vitest";
import {
  BASELINE,
  challengeProgress,
  checkinSchema,
  mean,
  today,
} from "../src/lib/domain";
describe("Budapest calendar", () => {
  it("has exactly 49 inclusive days", () => {
    expect(challengeProgress("2026-11-13")).toMatchObject({
      day: 1,
      total: 49,
      remaining: 48,
    });
    expect(challengeProgress("2026-12-31")).toMatchObject({
      day: 49,
      remaining: 0,
      phase: "active",
    });
  });
  it("supports before and after the challenge", () => {
    expect(challengeProgress("2026-11-12").day).toBe(0);
    expect(challengeProgress("2027-01-01").phase).toBe("after");
  });
  it("uses Budapest midnight and daylight saving", () => {
    expect(today(new Date("2026-11-12T23:30:00Z"))).toBe("2026-11-13");
    expect(today(new Date("2026-07-01T22:30:00Z"))).toBe("2026-07-02");
  });
});
it("never invents missing baseline values", () => {
  expect(BASELINE).toMatchObject({
    mood: 4,
    stress: 7,
    sleep: 7,
    focus: 5,
    energy: null,
    motivation: null,
  });
});
it("excludes missing observations from averages", () => {
  expect(mean([null, 4, 6, undefined])).toBe(5);
  expect(mean([null])).toBeNull();
});
it("requires the core scores and rejects impossible days", () => {
  expect(checkinSchema.safeParse({ day: "2026-02-30" }).success).toBe(false);
  expect(checkinSchema.safeParse({ day: "2026-11-13", mood: 0 }).success).toBe(
    false,
  );
});
