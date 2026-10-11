# 验证记录

2026-10-11，本机 Safari 27.0.1、已安装的系统 WebKit 和 Xcode SDK。

## 已完成

- Node 自动测试：9 项通过。验证标准与旧名称的连接创建、属性覆盖、prototype 构造器路径、重复注入、独立执行环境、未提供 WebRTC 的环境、不可替换属性告警及已有引用的限制。
- 真实 `WKWebExtension` 清单加载及执行：扩展关闭或未获得网站权限时，顶部页面、about:blank、srcdoc 和 HTTP iframe 均能创建无 STUN 连接；开启并授权后均抛出 `SecurityError`。媒体采集 API 保持存在。
- macOS 扩展容器：Apple 官方 packager 生成，`xcodebuild` 未签名构建成功。
- 构建工程出现的大小写 bundle ID 不一致已通过使用与容器名称一致的 ID 修正。
- GitHub Actions 自动测试与扩展打包通过。
- Safari 27.0.1 中成功加载临时扩展，仅对 tcptest.cn 授权一天，完成未授权/开启/关闭/重新开启对比。结果见下表。

| 状态 | TCPTest STUN 行 | 控制台 |
| --- | --- | --- |
| 未获得网站权限 | 部分国内服务器取得地址 | 未进行手动构造器检查 |
| 开启、授权并重载 | 14 行均为“未获取到 IP” | `new RTCPeerConnection()` 抛出 `SecurityError: WebRTC connection blocked by Safari WebRTC Guard.` |
| 关闭并重载 | Bilibili、芒果 TV、小米 WiFi 三行取得地址 | 无 STUN 构造器可创建并关闭，返回 `WebRTC restored` |
| 再次开启并重载 | 14 行均为“未获取到 IP” | 初次开启的构造器验证已证明拦截 |

另一次为截图进行的关闭状态复测中，芒果 TV、小米 WiFi 取得地址，Bilibili 未取得。STUN 可达性会变化，不应将单行空白当作扩展保护的证明。

[关闭状态截图](screenshots/tcptest-disabled.png) · [开启状态截图](screenshots/tcptest-enabled.png)。截图前在网页显示层替换地址和地理位置为遮挡标记，检测结果文字保持原样。没有上传原始地址、位置或未遮挡截图。

TCPTest 在 STUN 结果全部为空时仍显示“HTTP / WebRTC”标签和“未检测到泄露”，因此验证同时检查了逐行结果和真实构造器错误。HTTP 出口仍可见，本测试未证明 VPN 分流已修复。

## 待完成

- Safari 个人资料与无痕浏览验证。
- 第二个检测站的开启/关闭交叉验证。
- 浏览器重启及 24 小时临时扩展失效体验。
- 其他 macOS/Safari 版本、跨源 iframe、严格 CSP 等更全面的兼容性验证。
- App Store 签名、图标、容器界面和审核。

这些测试不代表全部浏览器路径安全，也不证明已经修复 VPN 分流。其他版本、网站与执行环境仍须进一步实测。
