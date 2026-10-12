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
