import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { RitualForm } from "../src/features/checkin/Ritual";
import type { RecordRow } from "../src/lib/domain";
it("saves intentional scores without inventing optional metrics", async () => {
  const save = vi.fn().mockResolvedValue(undefined);
  const user = userEvent.setup();
  render(<RitualForm date="2026-01-01" disabled={false} onSave={save} />);
  for (const label of ["Hangulat", "Stressz", "Alvásminőség", "Koncentráció"])
    await user.selectOptions(screen.getByLabelText(label), "7");
  await user.click(screen.getByRole("button", { name: "Napi mérés mentése" }));
  expect(save).toHaveBeenCalledWith(
    expect.objectContaining({ mood: 7, energy: null, motivation: null }),
    0,
  );
});
it("keeps an unsaved draft and original version when another device updates", async () => {
  const user = userEvent.setup();
  const save = vi.fn().mockResolvedValue(undefined);
  const row: RecordRow = {
    day: "2026-01-01",
    user_id: "a",
    revision: 1,
    updated_at: "now",
    mood: 4,
    stress: 7,
    sleep: 7,
    focus: 5,
    energy: null,
    motivation: null,
    note: "Eredeti",
    shift: "rest",
    sleep_hours: null,
    rest_day: false,
  };
  const { rerender } = render(
    <RitualForm date={row.day} row={row} disabled={false} onSave={save} />,
  );
  await user.selectOptions(screen.getByLabelText("Hangulat"), "8");
  rerender(
    <RitualForm
      date={row.day}
      row={{ ...row, revision: 2, mood: 2 }}
      disabled={false}
      onSave={save}
    />,
  );
  expect(screen.getByLabelText("Hangulat")).toHaveValue("8");
  await user.click(screen.getByRole("button", { name: "Mérés módosítása" }));
  expect(save).toHaveBeenCalledWith(expect.objectContaining({ mood: 8 }), 1);
});
it("retains values when persistence fails", async () => {
  const user = userEvent.setup();
  const save = vi.fn().mockRejectedValue(new Error("Tárolási hiba"));
  render(<RitualForm date="2026-01-01" disabled={false} onSave={save} />);
  for (const label of ["Hangulat", "Stressz", "Alvásminőség", "Koncentráció"])
    await user.selectOptions(screen.getByLabelText(label), "4");
  await user.click(screen.getByRole("button", { name: "Napi mérés mentése" }));
  expect(await screen.findByText("Tárolási hiba")).toBeVisible();
  expect(screen.getByLabelText("Hangulat")).toHaveValue("4");
});
