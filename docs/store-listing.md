# Chrome Web Store / Microsoft Edge Add-ons

两个商店共用 `dist/webrtc-guard-chromium-1.1.0.zip`。运行 `npm run package` 生成；ZIP 根目录包含 `manifest.json`，无需重新压缩或加入其他目录。当前尚未提交商店。

## 商店信息

- 名称：WebRTC Guard
- 网站：https://github.com/polang233/safari-webrtc-guard
- 支持：https://github.com/polang233/safari-webrtc-guard/issues
- 隐私政策：https://github.com/polang233/safari-webrtc-guard/blob/main/PRIVACY.md
- 单一用途：阻止已授权网页创建 WebRTC 连接，减少通过 ICE/STUN 暴露 IP 的机会。
- 网站权限理由：在普通 HTTP/HTTPS 页面的脚本启动前替换 WebRTC 连接构造器。扩展不读取或传输页面内容。
- 数据使用：扩展不收集、存储或传输用户数据；不含远程代码、广告或统计。

提交时确认上述网址已包含当前版本资料，并按商店实际表单填写数据使用声明。

## 简体中文描述

WebRTC Guard 在你允许的网站中阻止网页创建 WebRTC 连接，减少通过 ICE/STUN 暴露 IP 地址的机会。适合希望在日常浏览时停用网页 WebRTC 连接的用户。

安装后无需配置额外名单。打开浏览器的扩展详情，在“网站访问权限”中选择允许的网站，再重新加载网页即可生效。需要在某个网站使用语音或视频通话时，撤销该站权限或临时停用扩展，然后重新加载网页。

扩展只运行一个轻量脚本，没有后台进程、统计、存储、远程代码或第三方运行依赖，也不会读取或发送 IP、浏览历史、页面内容、表单或 Cookie。

请注意：已授权网站的网页通话、远程桌面和点对点传输会被阻止。这是网页 JavaScript 层的拦截，不会关闭浏览器的 WebRTC 引擎或系统 UDP，不能保证阻止所有主动绕过，也不改变网站看到的 HTTP 出口地址。它不能替代正确配置的 VPN。网页授权或扩展开关改变后，请重新加载网页。

## English description

WebRTC Guard prevents pages from creating WebRTC connections on sites you allow, reducing IP exposure through ICE/STUN. It is for users who want to disable page-level WebRTC connections while browsing.

Choose allowed websites using the browser's built-in extension site-access controls, then reload the page. No separate allowlist is needed. To use calls on a website, remove its site permission or temporarily disable the extension, then reload.

The extension runs one lightweight script. It has no background process, analytics, storage, remote code or third-party runtime dependencies. It does not read or transmit IP addresses, browsing history, page content, forms or cookies.

Web calls, remote desktop and peer-to-peer transfers stop working on allowed sites. Blocking happens in page JavaScript; it does not disable the browser's WebRTC engine or system UDP and cannot guarantee protection against every deliberate bypass. It does not change the HTTP address websites normally see or replace a correctly configured VPN. Reload pages after changing site permissions or enabling/disabling the extension.

## 审核测试步骤

1. 安装扩展，允许访问一个普通 HTTPS 网站，重新加载。
2. 在该网页控制台执行 `new RTCPeerConnection()`，预期抛出 `SecurityError: WebRTC connection blocked by WebRTC Guard.`。
3. 关闭扩展并重新加载，预期能创建连接；可执行 `const pc = new RTCPeerConnection(); pc.close();`。
4. 开启后重新加载，再次验证拦截。没有登录、付费或远程服务依赖。
5. 可在 BrowserLeaks / TCPTest 对比 STUN 检测，但网络不可达也会导致候选为空，应同时确认构造器结果。

## 图片

已准备的商店素材：

| 用途 | 文件 | 尺寸 |
| --- | --- | --- |
| Chrome 图标 | [chrome-icon-128.png](../assets/branding/store/chrome-icon-128.png) | 128×128，96px 图案及透明边距，已放入 Chrome / Edge ZIP |
| Edge Logo | [edge-logo-300.png](../assets/branding/store/edge-logo-300.png) | 300×300 |
| 小型宣传图 | [promo-440x280.png](../assets/branding/store/promo-440x280.png) | 440×280 |

素材基于现有 Logo；修改品牌资源后可运行 `node scripts/store-assets.mjs` 重新导出，再执行 `npm run package`。导出使用开发依赖 Playwright 和已安装的测试浏览器，扩展运行时不依赖它们。

`docs/screenshots/chrome-enabled.png` 和 `edge-enabled.png` 是对应浏览器中的实际本机检测截图，尺寸 1280×800。图中不包含公网 IP；检测页展示的是实际 API 调用结果。关闭状态图片可作为第二张对比图。Safari 的旧检测截图用于 README，不作为 Chrome / Edge 的商店截图。

商店要求以提交时的官方表单为准：

- [Chrome 图片要求](https://developer.chrome.com/docs/webstore/images)：128×128 PNG 图标、440×280 宣传图，至少一张 1280×800 或 640×400 截图。
- [Edge 发布说明](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension)：方形 Logo，推荐 300×300；截图可用 1280×800 或 640×480。Chrome / Edge 共用 1280×800 截图尺寸。

上架前需在各自开发者后台创建条目、上传 ZIP 和图片、填写隐私声明并提交审核。Chrome Web Store 和 Edge Add-ons 的商店链接在审核通过后再加入 README。
