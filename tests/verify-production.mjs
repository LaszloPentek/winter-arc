import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    "4181",
    "--strictPort",
  ],
  { stdio: "pipe", windowsHide: true },
);
let browser;
try {
  let ready = false;
  for (let n = 0; n < 50; n++) {
    try {
      const r = await fetch("http://127.0.0.1:4181/winter-arc/");
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {
      /* Wait for preview. */
    }
    await delay(200);
  }
  if (!ready) throw new Error("Preview did not start");
  browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 320, height: 780 },
    serviceWorkers: "allow",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const failedAssets = [];
  page.on("response", (r) => {
    if (r.status() >= 400) failedAssets.push(r.url());
  });
  await page.goto("http://127.0.0.1:4181/winter-arc/");
  await page.getByRole("heading", { name: "SANCTUARY", exact: true }).waitFor();
  await page.screenshot({
    path: "test-results/mobile-320.png",
    fullPage: true,
  });
  for (const route of ["/ritual", "/settings", "/chronicle"]) {
    await page.goto(`http://127.0.0.1:4181/winter-arc/#${route}`);
    await page.locator("h1").waitFor();
    if (
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      )
    )
      throw new Error(`Overflow at ${route}`);
  }
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("heading", { name: "A napjaid lenyomata" }).waitFor();
  if (errors.length || failedAssets.length)
    throw new Error(JSON.stringify({ errors, failedAssets }));
  console.log(
    "PASS: /winter-arc/ assets, 320px navigation/forms, no browser errors, production offline reload.",
  );
} finally {
  await browser?.close();
  server.kill();
}
