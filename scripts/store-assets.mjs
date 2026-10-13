#!/usr/bin/env node
// Render the existing approved branding at each store's required size.
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const index = args.indexOf("--executable");
const executablePath = index >= 0 ? args[index + 1] : undefined;
if (index >= 0 && !executablePath) throw new Error("--executable needs a browser binary path");
const browser = await chromium.launch(executablePath ? { executablePath } : { channel: "chromium" });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(pathToFileURL(join(root, "assets/branding/store-preview.html")).href);
  await page.locator("img").first().waitFor();
  await page.evaluate(() => Promise.all([...document.images].map(image => image.decode())));
  const destination = join(root, "assets/branding/store");
  await mkdir(destination, { recursive: true });
  for (const [id, name] of [["chrome-icon", "chrome-icon-128.png"], ["edge-icon", "edge-logo-300.png"], ["small-promo", "promo-440x280.png"]]) {
    await page.locator(`#${id}`).screenshot({ path: join(destination, name), omitBackground: true });
    console.log(join(destination, name));
  }
} finally { await browser.close(); }
