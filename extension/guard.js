/* SPDX-License-Identifier: MIT */
(() => {
  "use strict";

  // Run synchronously in the page's MAIN world before its scripts start.
  // Never retain or expose the native constructor or its prototype.
  function blockedPeerConnection() {
    throw new DOMException("WebRTC connection blocked by WebRTC Guard.", "SecurityError");
  }
  Object.freeze(blockedPeerConnection.prototype);
  Object.freeze(blockedPeerConnection);

  for (const name of ["RTCPeerConnection", "webkitRTCPeerConnection", "mozRTCPeerConnection"]) {
    if (!(name in globalThis)) continue;
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
    if (descriptor?.value === blockedPeerConnection) continue;
    try {
      Object.defineProperty(globalThis, name, {
        value: blockedPeerConnection,
        writable: false,
        configurable: false,
        enumerable: descriptor?.enumerable ?? true
      });
    } catch {
      console.warn(`[WebRTC Guard] Could not block ${name}; protection is incomplete.`);
    }
  }
})();
