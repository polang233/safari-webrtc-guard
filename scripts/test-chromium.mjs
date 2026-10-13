#!/usr/bin/env node
// Verify the shipped ZIP with a real extension, never an injected test copy.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const browserName = args.includes("--edge") ? "edge" : "chrome";
const executableIndex = args.indexOf("--executable");
const executablePath = executableIndex >= 0 ? args[executableIndex + 1] : undefined;
if (executableIndex >= 0 && !executablePath) throw new Error("--executable needs a browser binary path");
const manifest = JSON.parse(await readFile(join(root, "extension/manifest.json")));
const archivePath = join(root, "dist", `webrtc-guard-chromium-${manifest.version}.zip`);
const temporary = await mkdtemp(join(tmpdir(), "webrtc-guard-browser-"));
const extensionPath = join(temporary, "extension");
execFileSync("python3", ["-m", "zipfile", "-e", archivePath, extensionPath]);
const output = join(root, "output/playwright", browserName);
await mkdir(output, { recursive: true });
const server = createServer(async (request, response) => {
  const url = new URL(request.url, "http://127.0.0.1");
  const files = {
    "/chromium.html": ["tests/chromium.html", "text/html"],
    "/chromium.js": ["tests/chromium.js", "text/javascript"],
    "/chromium.css": ["tests/chromium.css", "text/css"],
    "/chromium-frame.html": ["tests/chromium-frame.html", "text/html"],
    "/chromium-frame.js": ["tests/chromium-frame.js", "text/javascript"],
    "/logo.png": ["assets/branding/logo-128.png", "image/png"],
  };
  if (url.pathname === "/strict") {
    response.writeHead(200, { "Content-Type": "text/html", "Content-Security-Policy": "default-src 'none'; script-src 'self'" });
    response.end('<!doctype html><title>Strict CSP probe</title>');
    return;
  }
  const file = files[url.pathname];
  if (!file) { response.writeHead(404); response.end(); return; }
  try {
    response.writeHead(200, { "Content-Type": file[1], "Cache-Control": "no-store" });
    response.end(await readFile(join(root, file[0])));
  } catch { response.writeHead(500); response.end(); }
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${server.address().port}`;
let context;
try {
  context = await chromium.launchPersistentContext(join(temporary, "profile"), {
    ...(executablePath ? { executablePath } : { channel: browserName === "edge" ? "msedge" : "chromium" }),
    headless: !args.includes("--headed"),
    ignoreDefaultArgs: ["--disable-extensions"],
    viewport: { width: 1280, height: 800 },
    args: ["--enable-unsafe-extension-debugging"],
  });
  const page = await context.newPage();
  const session = await context.browser().newBrowserCDPSession();
  const report = {
    browser: browserName,
    version: context.browser().version(),
    extensionVersion: manifest.version,
    packageSHA256: createHash("sha256").update(await readFile(archivePath)).digest("hex"),
    scenarios: {},
  };
  const loadedKeys = ["top", "prototype", "synchronousBlank", "blank", "srcdoc", "httpFrame", "crossOrigin"];
  async function probe(state, expected) {
    const label = browserName === "edge" ? "Microsoft Edge" : (executablePath ? "Chrome for Testing" : "Chromium");
    await page.goto(`${url}/chromium.html?browser=${encodeURIComponent(label)}&version=${report.version}`);
    await page.waitForFunction(() => window.probeDone, null, { timeout: 15000 });
    const results = await page.evaluate(() => window.probeResults);
    for (const key of loadedKeys) assert.equal(results[key], expected, `${state}: ${key}`);
    assert.equal(results.capture, "function");
    if (expected === "SecurityError") assert.equal(results.ice, "SecurityError");
    else assert.match(results.ice, /^completed · \d+ candidate\(s\)$/);
    report.scenarios[state] = results;
    await page.screenshot({ path: join(output, `${state}.png`) });
    console.log(`${browserName} ${report.version}: ${state} PASS`);
  }
  await probe("disabled", "created");
  const { id } = await session.send("Extensions.loadUnpacked", { path: extensionPath });
  assert.ok(id, "Browser must actually load the packaged extension");
  await probe("enabled", "SecurityError");
  await page.goto(`${url}/strict`);
  const strict = await page.evaluate(() => {
    try { const connection = new RTCPeerConnection(); connection.close(); return "created"; }
    catch (error) { return error.name; }
  });
  assert.equal(strict, "SecurityError", "MAIN world injection must work with strict page CSP");
  report.scenarios.strictCSP = strict;
  await session.send("Extensions.uninstall", { id });
  await probe("restored", "created");
  await writeFile(join(output, "results.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(`Saved verified screenshots and results to ${output}`);
} finally {
  await context?.close();
  await new Promise(resolve => server.close(resolve));
  await rm(temporary, { recursive: true, force: true });
}
