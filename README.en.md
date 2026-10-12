# WebRTC Guard

![WebRTC Guard Logo](assets/branding/logo-128.png)

[简体中文](README.md) · English

Even with a VPN on, web pages can still learn your real IP address through WebRTC (ICE/STUN). WebRTC Guard stops pages from creating WebRTC connections on the Safari sites you allow, so this leak can't happen there.

- **Only on sites you allow**: Safari's website permissions are the on/off switch, so there's no separate allowlist to manage.
- **Lightweight**: a single ~30-line script with no background page, analytics, network requests or storage. See the [privacy notes](PRIVACY.md) (Chinese).
- **Trade-off**: voice/video calls, remote desktop and peer-to-peer transfers in the browser stop working on allowed sites.

> Requires Safari 18.4 or later on macOS.

## Install (no developer account needed)

1. Download `webrtc-guard-1.0.0.zip` from [Releases](https://github.com/polang233/safari-webrtc-guard/releases/latest).
2. Safari → Settings → Advanced → turn on **Show features for web developers**.
3. Settings → Developer → **Add Temporary Extension…**, choose the downloaded ZIP, and allow unsigned extensions when macOS asks.
4. Turn on **WebRTC Guard** in Settings → Extensions, allow it for a site (or all sites) from the toolbar, then **reload the page**.

Temporary extensions are removed when you quit Safari or after 24 hours, so you need to add them again. Private browsing and each Safari profile need to be enabled and allowed separately.

### Why is it temporary only?

This comes from how the extension is installed, not from the extension itself:

- Safari only loads unsigned extensions as "temporary extensions", which are **removed when you quit Safari or after 24 hours**. You have to add the extension again and re-allow your sites each time.
- To install once and keep it like a normal extension, it has to be signed by Apple (signed through the Apple Developer Program and distributed, or published on the App Store).
- The maintainer does not currently have an Apple Developer Program account, so **no signed or App Store build is provided, and the extension can only be used as a temporary extension**.

### Don't want to re-add it every day? Build it with Xcode (free, no paid account needed)

According to Apple's documentation ([Running your Safari web extension](https://developer.apple.com/documentation/safariservices/running-your-safari-web-extension)), an extension installed by running the container app from Xcode is **not subject to the 24-hour limit**. You can do this without joining the Apple Developer Program. The trade-off is that the extension is unsigned, and Safari ignores unsigned extensions by default:

1. Install Xcode and open `native/WebRTC Guard/WebRTC Guard.xcodeproj`.
2. Choose **WebRTC Guard → My Mac** and run it (Product → Run).
3. In Safari → Settings → Advanced, turn on **Show features for web developers**, then in Settings → Developer turn on **Allow unsigned extensions**.
4. Turn on **WebRTC Guard** in Settings → Extensions, allow it for a site, then reload the page.

Notes:

- "Allow unsigned extensions" **resets every time you quit Safari**, so you have to turn it on again at the next launch. That is less work than temporary extensions, but it is not "install once and forget".
- You can build without picking a Team: Xcode uses an ad-hoc signature (no developer identity), and Safari still treats it as an unsigned extension. If you pick a free account's Personal Team, Apple says its provisioning profiles expire after 7 days and you have to rebuild and reinstall.
- Verified on the maintainer's Mac (Xcode 27.0): the build succeeds without a Team, the result is ad-hoc signed, and the system recognizes the embedded Safari extension (see [docs/validation.md](docs/validation.md)). How Safari behaves in steps 3 and 4 follows Apple's documentation and hasn't been checked step by step in this project.
- If you have a paid developer account, you can pick your own Team for both targets so Apple signs the build, and you won't need "Allow unsigned extensions". See Apple's documentation for what each account type allows.

## Need calls on a site?

Remove the extension's permission for that site in Safari (or turn the extension off for a while), then reload the page to get WebRTC back.

## Check that it works

After allowing the site and reloading, run this in the page's developer console:

```js
new RTCPeerConnection()
```

If you get `SecurityError: WebRTC connection blocked by WebRTC Guard.`, the page is protected. You can also compare results with the extension on and off at [BrowserLeaks](https://browserleaks.com/webrtc).

## Limits

- Protection works in the page's JavaScript. It doesn't turn off Safari's WebRTC engine or system UDP. Sites you haven't allowed, and pages opened before you allowed them, aren't protected.
- It only blocks WebRTC. It doesn't change the HTTP address websites see, and it doesn't replace a correctly configured VPN.
- It can't promise to stop every deliberate workaround.

## Development

```sh
npm test                        # Node unit tests, no third-party dependencies
python3 scripts/test-webkit.py  # real WKWebExtension runtime test (macOS 15.4+, Xcode)
npm run package                 # package into dist/
sh scripts/build-macos.sh       # build the unsigned macOS container app
```

- `extension/`: the extension itself (`manifest.json` + `guard.js`). The Xcode project references this folder directly.
- `native/WebRTC Guard/`: Xcode project for the macOS container app. Build and run with **WebRTC Guard → My Mac**.
- Icons: run `python3 scripts/generate-icons.py` to export every size. See the [branding notes](assets/branding/README.md).

Publishing to the App Store requires Apple Developer Program signing and review. See Apple's guides on [packaging](https://developer.apple.com/documentation/safariservices/packaging-a-web-extension-for-safari) and [distribution](https://developer.apple.com/documentation/safariservices/distributing-your-safari-web-extension).

## License

[MIT](LICENSE)
