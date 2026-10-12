# 验证记录

2026-10-11，本机 Safari 27.0.1、已安装的系统 WebKit 和 Xcode SDK。

## 手动对比方法

1. 保持相同的 VPN/TUN 状态和规则，关闭扩展，打开 [TCPTest WebRTC 检测](https://www.tcptest.cn/webrtc)，私下记录 HTTP 地址及各 STUN 行结果。
2. 启用扩展、授权该网站，重新加载并检测。预期所有 STUN 行无法取得地址；不同检测站文案不同。
3. 确认 HTTP 地址仍然可见。HTTP 与 WebRTC 地址相同只说明两者出口一致；如果 HTTP 已是原始地址，要另查分流规则、TUN 路由、IPv6 和 UDP。
4. 用 [BrowserLeaks WebRTC](https://browserleaks.com/webrtc) 交叉核对。没有候选地址也可能是 STUN 不可达，不能单凭空白结果判定保护成功。
5. 控制台执行 `new RTCPeerConnection()`，应得到扩展的 `SecurityError`。
6. 关闭扩展并重新加载，验证 WebRTC 功能恢复。分享反馈前隐藏 IP、位置、代理节点和浏览记录。

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

[关闭状态截图](screenshots/tcptest-disabled.jpg) · [开启状态截图](screenshots/tcptest-enabled.jpg)。截图前在网页显示层替换地址和地理位置为遮挡标记，检测结果文字保持原样。没有上传原始地址、位置或未遮挡截图。

TCPTest 在 STUN 结果全部为空时仍显示“HTTP / WebRTC”标签和“未检测到泄露”，因此验证同时检查了逐行结果和真实构造器错误。HTTP 出口仍可见，本测试未证明 VPN 分流已修复。

## 项目名称更新验证（2026-10-11）

通过 Xcode 的 Rename 流程把工程和目标改为 WebRTC Guard，并整理原生源码目录、App 显示名称、扩展清单与构建脚本。原生工程及共享 Scheme 纳入 Git，已有 Bundle Identifier 保留原值。

改名后 9 项 Node 测试通过；WebRTC Guard macOS 容器与嵌入扩展构建成功；检查构建产物的显示名称和打包 ZIP 清单均为新名称。Logo 候选只保存于本地 design 目录，原有图标内容保持不变。

## Logo 接入验证（2026-10-11）

采用用户选定的红底米白色网络锁盾 Logo，原始文件保存于 `assets/branding/logo-source.png`。已导出 1024px sRGB 图片、macOS AppIcon 的 10 个尺寸槽位、7 个彩色扩展图标及 16/32px 的透明工具栏图标。容器界面使用同一彩色图片。

Node 测试通过；macOS 最终构建通过；ZIP 和嵌入扩展中的 9 个图标资源均与清单及源文件一致。已在 Safari 27.0.1 重新加载现有扩展，确认设置页显示彩色 Logo、工具栏显示清晰的单色轮廓；网站授权仍仅限 tcptest.cn。Xcode 的 AppIcon 各尺寸槽位已核对。

## WebKit 测试修复（2026-10-12）

macOS 27.0.1 的 WKWebView 中 `navigator.mediaDevices` 为 `undefined`，导致 `tests/probe.html` 在记录结果前抛错，`scripts/test-webkit.py` 报 `probe did not run`。探针改为检查 `MediaStream` 是否存在。同时把“同步访问新建 about:blank iframe 的 `contentWindow`”纳入断言：未加载、未授权时为 `created`，授权后为 `SecurityError`。三种情况均通过；9 项 Node 测试通过；Xcode 构建 WebRTC Guard 容器成功且无警告。

## Xcode 免费构建路线验证（2026-10-12）

Xcode 27.0，不指定 Team，执行 `xcodebuild -scheme 'WebRTC Guard' -configuration Debug -destination 'platform=macOS' build`（与在 Xcode 中点击运行等价），构建成功。

- App 与嵌入扩展均为 ad-hoc 签名（`Signature=adhoc`，`TeamIdentifier=not set`），`codesign --verify --deep --strict` 通过。
- 扩展资源（`manifest.json`、`guard.js`、`icons`）已嵌入；`pluginkit` 能列出 `io.github.polang233.Safari-WebRTC-Guard.Extension`，SDK 为 `com.apple.Safari.web-extension`。
- 未验证：Safari 中“允许未签名的扩展”勾选后扩展出现在列表、启用并授权网站后拦截生效，以及退出重启 Safari 后的行为。该设置属于 Safari 安全设置，需要使用者自行勾选。

## 工程备注

- 现有 Bundle Identifier 保留原值，以维持安装身份；GitHub 仓库仍叫 `safari-webrtc-guard`。
- 首次生成工程时，Xcode 打包工具对 `world`、`match_about_blank`、`match_origin_as_fallback` 发出兼容性警告；本机 WebKit 运行时已验证这些场景，其他版本须实测。

## 待完成

- Safari 个人资料与无痕浏览验证。
- 第二个检测站的开启/关闭交叉验证。
- 浏览器重启及 24 小时临时扩展失效体验。
- 其他 macOS/Safari 版本、跨源 iframe、严格 CSP 等更全面的兼容性验证。
- App Store 签名、图标、容器界面和审核。

这些测试不代表全部浏览器路径安全，也不证明已经修复 VPN 分流。其他版本、网站与执行环境仍须进一步实测。
