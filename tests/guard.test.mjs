import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../extension/guard.js", import.meta.url), "utf8");
const names = ["RTCPeerConnection", "webkitRTCPeerConnection", "mozRTCPeerConnection"];

function realm(extra = {}) {
  let calls = 0;
  const native = function () { calls++; };
  const warnings = [];
  const context = vm.createContext({ DOMException, console: { warn: x => warnings.push(x) }, ...extra });
  for (const name of names) context[name] = native;
  return { context, native, warnings, calls: () => calls, run: () => vm.runInContext(source, context) };
}

test("standard and prefixed constructors fail before native networking can begin", () => {
  const r = realm(); r.run();
  for (const name of names) {
    assert.throws(() => vm.runInContext(`new ${name}({iceServers:[{urls:'stun:example.invalid'}]})`, r.context), { name: "SecurityError" });
    assert.throws(() => vm.runInContext(`${name}.call(null)`, r.context), { name: "SecurityError" });
    assert.throws(() => vm.runInContext(`new ${name}.prototype.constructor()`, r.context), { name: "SecurityError" });
  }
  assert.equal(r.calls(), 0);
});

test("assignment, deletion, and property replacement cannot restore constructors", () => {
  const r = realm(); r.context.saved = r.native; r.run();
  assert.equal(vm.runInContext("Reflect.set(globalThis, 'RTCPeerConnection', saved)", r.context), false);
  assert.equal(vm.runInContext("Reflect.deleteProperty(globalThis, 'RTCPeerConnection')", r.context), false);
  assert.equal(vm.runInContext("Reflect.defineProperty(globalThis, 'RTCPeerConnection', {value: saved})", r.context), false);
  assert.throws(() => vm.runInContext("new RTCPeerConnection()", r.context), { name: "SecurityError" });
});

test("repeated injection remains blocked", () => {
  const r = realm(); r.run(); r.run();
  assert.throws(() => vm.runInContext("new RTCPeerConnection()", r.context), { name: "SecurityError" });
});

test("each independent frame realm must receive its own injection", () => {
  const parent = realm(); const child = realm(); parent.run();
  vm.runInContext("new RTCPeerConnection()", child.context);
  assert.equal(child.calls(), 1);
  child.run();
  assert.throws(() => vm.runInContext("new RTCPeerConnection()", child.context), { name: "SecurityError" });
});

test("media capture and unrelated browser APIs remain available", () => {
  const capture = () => "capture";
  const fetch = () => "http";
  const r = realm({ navigator: { mediaDevices: { getUserMedia: capture } }, fetch }); r.run();
  assert.equal(r.context.navigator.mediaDevices.getUserMedia, capture);
  assert.equal(r.context.fetch, fetch);
});

test("an engine without WebRTC is left without synthetic WebRTC APIs", () => {
  const context = vm.createContext({ DOMException }); vm.runInContext(source, context);
  for (const name of names) assert.equal(vm.runInContext(`typeof ${name}`, context), "undefined");
});

test("a preexisting unreplaceable constructor produces an explicit warning", () => {
  const r = realm();
  Object.defineProperty(r.context, "RTCPeerConnection", { value: r.native, writable: false, configurable: false });
  r.run(); assert.equal(r.context.RTCPeerConnection, r.native);
  assert.equal(r.warnings.length, 1);
});

test("saved references from before injection remain usable: documented boundary", () => {
  const r = realm(); r.context.saved = r.native; r.run();
  vm.runInContext("new saved()", r.context); assert.equal(r.calls(), 1);
});

test("manifest requests synchronous MAIN-world injection in matching frames", () => {
  const manifest = JSON.parse(readFileSync(new URL("../extension/manifest.json", import.meta.url)));
  assert.equal(manifest.manifest_version, 3);
  const [script] = manifest.content_scripts;
  assert.equal(script.world, "MAIN"); assert.equal(script.run_at, "document_start");
  assert.equal(script.all_frames, true); assert.equal(script.match_about_blank, true);
  assert.equal(script.match_origin_as_fallback, true);
  assert.deepEqual(script.matches, ["http://*/*", "https://*/*"]);
  assert.deepEqual(script.js, ["guard.js"]);
  assert.equal(manifest.background, undefined); assert.equal(manifest.permissions, undefined);
});
