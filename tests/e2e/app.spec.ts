import { test, expect } from "@playwright/test";
test("dashboard and honest setup state", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "SANCTUARY", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Felhőkapcsolat beállítandó")).toBeVisible();
  await expect(page.getByText("Még nincs napi mérés")).toBeVisible();
  await page
    .getByRole("link", { name: "Napi bejelentkezés", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Egy pillanat magadnak." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Napi mérés mentése" }),
  ).toBeDisabled();
});
test("responsive navigation and no horizontal overflow", async ({
  page,
}, info) => {
  await page.goto("/");
  if (info.project.name === "mobile") {
    await page
      .getByRole("navigation", { name: "Mobil navigáció" })
      .getByRole("link", { name: "Chronicle" })
      .click();
    await expect(
      page.getByRole("heading", { name: "A napjaid lenyomata" }),
    ).toBeVisible();
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/${info.project.name}.png`,
    fullPage: true,
  });
});
test("settings explains setup and unavailable phases are explicit", async ({
  page,
}) => {
  await page.goto("/#/settings");
  await expect(
    page.getByRole("heading", { name: "Fiók és beállítások" }),
  ).toBeVisible();
  await expect(
    page.getByText("A felhőkapcsolat még nincs beállítva.", { exact: false }),
  ).toBeVisible();
  await page.goto("/#/quests");
  await expect(page.getByRole("heading", { name: "A saját küldetéseid" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Jelentkezz be a teendőidhez." })).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveCount(0);
  await page.goto("/#/journal");
  await expect(page.getByText("Következő fejezet · P1")).toBeVisible();
});
