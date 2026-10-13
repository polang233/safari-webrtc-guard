# WebRTC Guard

<img src="assets/branding/logo-128.png" width="80" alt="WebRTC Guard logo">

[简体中文](README.md) · English

[![Tests](https://github.com/polang233/safari-webrtc-guard/actions/workflows/test.yml/badge.svg)](https://github.com/polang233/safari-webrtc-guard/actions/workflows/test.yml)
[![MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-5865F2)
![No tracking](https://img.shields.io/badge/privacy-no%20tracking%20·%20no%20storage-357a55)

A lightweight WebRTC blocker. It prevents pages from creating WebRTC connections on sites you allow, reducing IP exposure through ICE/STUN.

One ~30-line script, with no background process, network requests or third-party runtime dependencies. Use the browser's site-access controls to choose where it runs. **Web calls, remote desktop and peer-to-peer transfers also stop working on those sites.**

## Browser support

| <img src="docs/browsers/safari.png" width="32" alt="Safari"> Safari | <img src="docs/browsers/chrome.svg" width="32" alt="Chrome"> Chrome | <img src="docs/browsers/edge.png" width="32" alt="Edge"> Microsoft Edge |
| :---: | :---: | :---: |
| macOS · Safari 18.4+ | Desktop · Chromium 119+ | Desktop · Chromium 119+ |
| Temporary extension / Xcode app | Developer mode | Developer mode |

Chrome Web Store and Microsoft Edge Add-ons listings are being prepared. Build from source for now; published Safari ZIPs are available in [Releases](https://github.com/polang233/safari-webrtc-guard/releases). Minimum versions reflect manifest requirements; see [validation notes](docs/validation.md) for versions actually tested.

## Install

### Chrome / Edge

1. Download or clone the source and run `python3 scripts/package.py`. This only needs Python 3. With Node.js installed, you can also use `npm run package`; no dependency installation is needed.
2. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge and turn on **Developer mode**.
3. Click **Load unpacked** and select the generated `dist/chromium` folder. Alternatively, extract `dist/webrtc-guard-chromium-1.1.0.zip` and select the folder containing `manifest.json`.
4. Choose allowed sites under **Site access** in the extension's details, then **reload the page**.

With access to all sites, the extension automatically blocks WebRTC on regular HTTP/HTTPS pages. To use calls on a site, remove that site's permission or disable the extension, then reload. Allow incognito / InPrivate separately in extension details.

### Safari

1. Download a Safari release ZIP, or run `npm run package` to create `dist/webrtc-guard-1.1.0.zip`.
2. Safari → Settings → Advanced → enable **Show features for web developers**.
3. Settings → Developer → **Add Temporary Extension…**, select the ZIP and allow unsigned extensions when prompted.
4. Enable **WebRTC Guard**, allow it on your sites and **reload the page**.

Temporary extensions are removed when you quit Safari or after 24 hours. Add and allow them again. Each profile and private browsing need separate permissions.

<details>
<summary>Safari: build with Xcode</summary>

Open `native/WebRTC Guard/WebRTC Guard.xcodeproj`, choose **WebRTC Guard → My Mac**, and run. In Safari's developer settings, enable **Allow unsigned extensions**, then enable the extension and grant site access.

[Apple's guide](https://developer.apple.com/documentation/safariservices/running-your-safari-web-extension) says extensions installed by running an Xcode container are not subject to the temporary ZIP's 24-hour limit. However, **Allow unsigned extensions** resets when Safari quits. The ad-hoc build without a Team and system recognition have been verified; the complete Safari enablement, blocking and restart flow for this route remains untested. Signed distribution requires the appropriate Apple developer account.

</details>

## Actual results

These screenshots show the packaged extension running in Chrome for Testing 155.0.8059.39 and Microsoft Edge 155.0.4283.45. The local probe does not look up a public IP. The Safari TCPTest images redact addresses and location, while keeping detection results intact.

| Chrome · disabled | Chrome · enabled |
| --- | --- |
| ![Chrome disabled: native connections available](docs/screenshots/chrome-disabled.png) | ![Chrome enabled: SecurityError blocks connection creation](docs/screenshots/chrome-enabled.png) |

| Edge · disabled | Edge · enabled |
| --- | --- |
| ![Edge disabled: native connections available](docs/screenshots/edge-disabled.png) | ![Edge enabled: SecurityError blocks connection creation](docs/screenshots/edge-enabled.png) |

<details>
<summary>Safari · TCPTest comparison</summary>

| Disabled | Enabled |
| --- | --- |
| ![Safari disabled: STUN returns addresses, addresses and location redacted](docs/screenshots/tcptest-disabled.jpg) | ![Safari enabled: STUN cannot obtain IP](docs/screenshots/tcptest-enabled.jpg) |

</details>

After enabling and reloading, run `new RTCPeerConnection()` in the page console. Expect `SecurityError: WebRTC connection blocked by WebRTC Guard.` Compare enabled and disabled states at [BrowserLeaks](https://browserleaks.com/webrtc) or [TCPTest](https://www.tcptest.cn/webrtc). Empty STUN results alone do not prove the extension works.

## Protection scope

This is protection in page JavaScript. It does not disable the browser's WebRTC engine or system UDP. Unpermitted sites, browser internal pages, existing connections and native references saved before injection are outside its guarantee. Synchronous access to fresh iframe realms and other bypass paths need to be evaluated against the [validation notes](docs/validation.md). It cannot guarantee protection against every deliberate workaround.

It does not change the HTTP address websites normally see or replace a correctly configured VPN. See the [privacy policy](PRIVACY.md).

## Develop and package

```sh
npm test                         # dependency-free Node unit tests
npm run package                  # Safari ZIP + Chrome/Edge ZIP and unpacked folder
npm ci                           # development-only Playwright
npx playwright install chromium  # test browser
npm run test:browsers             # real Chromium extension loading, blocking and restoration
npm run test:browsers -- --edge    # installed Microsoft Edge
python3 scripts/test-webkit.py    # real WKWebExtension tests on macOS
sh scripts/build-macos.sh        # Safari container build
```

All three browsers use `extension/guard.js`. Safari references `extension/` directly. The package script generates Chrome / Edge metadata in English and Simplified Chinese. Test screenshots and results go to `output/playwright/`. See [store publishing materials](docs/store-listing.md) for submission files and listing copy.

[MIT](LICENSE)
