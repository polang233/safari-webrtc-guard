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
