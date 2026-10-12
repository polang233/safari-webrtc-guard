# WebRTC Guard

![WebRTC Guard Logo](assets/branding/logo-128.png)

简体中文 · [English](README.en.md)

开着 VPN，网页仍可能通过 WebRTC（ICE/STUN）取得你的真实 IP。WebRTC Guard 在你授权的 Safari 网站中阻止网页创建 WebRTC 连接，从源头避免这类泄露。

- **只在你授权的网站生效**：Safari 的网站权限就是开关，不需要另配白名单。
- **轻量**：一个约 30 行的脚本；无后台、无统计、无网络请求、无存储。详见[隐私说明](PRIVACY.md)。
- **代价**：已授权网站的网页语音/视频通话、远程桌面和点对点传输将无法使用。

> 需要 macOS 上的 Safari 18.4 及以上。

## 安装（无需开发者账号）

1. 从 [Releases](https://github.com/polang233/safari-webrtc-guard/releases/latest) 下载 `webrtc-guard-1.0.0.zip`。
2. Safari → 设置 → 高级 → 勾选“显示网页开发者功能”。
3. 设置 → 开发者 → **添加临时扩展…**，选择下载的 ZIP，并按系统提示允许未签名扩展。
4. 设置 → 扩展中启用 **WebRTC Guard**，再在工具栏为网站授权（单个网站或全部网站），然后**重新加载网页**。

临时扩展在退出 Safari 或 24 小时后会被移除，需要重新添加。无痕浏览和不同个人资料需分别启用和授权。

### 为什么只能临时使用？

这是目前的安装方式带来的限制，不是扩展本身的限制：

- Safari 只允许未签名的扩展以“临时扩展”的方式加载，**退出 Safari 或满 24 小时就会被移除**，每次都要重新添加并重新授权网站。
- 要像普通扩展一样一次安装、长期保留，需要经过 Apple 签名（通过 Apple Developer Program 签名后分发，或上架 App Store）。
- 本项目的维护者目前没有 Apple Developer Program 账号，所以**不提供已签名或上架的版本，只能以临时扩展的方式使用**。

### 不想每天重新添加？用 Xcode 自己构建（免费，无需付费账号）

按 Apple 官方文档（[Running your Safari web extension](https://developer.apple.com/documentation/safariservices/running-your-safari-web-extension)），用 Xcode 运行容器 App 安装的扩展**不受 24 小时限制**。没有加入 Apple Developer Program 也可以这样做，代价是扩展未签名，Safari 默认会忽略它：

1. 安装 Xcode，打开 `native/WebRTC Guard/WebRTC Guard.xcodeproj`。
2. 选择 **WebRTC Guard → My Mac**，点击运行（Product → Run）。
3. Safari → 设置 → 高级 → 勾选“显示网页开发者功能”，然后在 设置 → 开发者 中勾选**允许未签名的扩展**。
4. 设置 → 扩展中启用 **WebRTC Guard**，为网站授权后重新加载网页。

注意：

- “允许未签名的扩展”**每次退出 Safari 后都会重置**，下次启动 Safari 需要重新勾选。这比临时扩展省事，但不是“装一次就不用管”。
- 不选 Team 也能构建：Xcode 会使用 ad-hoc 签名（不含开发者身份），Safari 仍把它当作未签名扩展。如果你选择了免费账号的 Personal Team，Apple 说明其 provisioning profile 7 天后过期，需要重新构建安装。
- 已在本机（Xcode 27.0）验证：不选 Team 可成功构建，产物为 ad-hoc 签名，系统能识别其中的 Safari 扩展（见 [docs/validation.md](docs/validation.md)）。第 3、4 步在 Safari 里的表现依据 Apple 官方文档，尚未在本项目中逐项验证。
- 如果你有付费的开发者账号，可以为 App 和 Extension 两个 Target 选择你自己的 Team，由 Apple 签名后就不需要“允许未签名的扩展”了。各类账号的具体限制请以 Apple 官方文档为准。

## 某个网站需要通话？

在 Safari 中撤销该网站的扩展权限（或临时停用扩展），然后重新加载网页即可恢复 WebRTC。

## 验证是否生效

授权并重新加载后，在网页的开发者控制台执行：

```js
new RTCPeerConnection()
```

得到 `SecurityError: WebRTC connection blocked by WebRTC Guard.` 即表示该页已拦截。也可以在 [BrowserLeaks](https://browserleaks.com/webrtc) 对比开启前后的结果。

## 限制

- 这是网页 JavaScript 层的防护，不会关闭 Safari 的 WebRTC 引擎或系统 UDP。未授权的网站、授权前已打开的页面不受保护。
- 只拦截 WebRTC，不改变网站看到的 HTTP 出口地址，也不能替代正确配置的 VPN。
- 不保证能防住所有刻意的绕过手段。

## 开发

```sh
npm test                        # Node 单元测试，无第三方依赖
python3 scripts/test-webkit.py  # 真实 WKWebExtension 运行时测试（macOS 15.4+、Xcode）
npm run package                 # 打包到 dist/
sh scripts/build-macos.sh       # 构建未签名的 macOS 容器 App
```

- `extension/`：扩展本体（`manifest.json` + `guard.js`）。Xcode 工程直接引用此目录。
- `native/WebRTC Guard/`：macOS 容器 App 的 Xcode 工程，用 **WebRTC Guard → My Mac** 构建运行。
- 图标：运行 `python3 scripts/generate-icons.py` 统一导出，详见[图标资源说明](assets/branding/README.md)。

上架 App Store 需要 Apple Developer Program 签名与审核，参见 Apple 的[打包](https://developer.apple.com/documentation/safariservices/packaging-a-web-extension-for-safari)与[分发](https://developer.apple.com/documentation/safariservices/distributing-your-safari-web-extension)说明。

## 许可

[MIT](LICENSE)
