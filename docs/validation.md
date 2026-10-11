# 验证记录

2026-10-11，本机 Safari 27.0.1、已安装的系统 WebKit 和 Xcode SDK。

## 已完成

- Node 自动测试：9 项通过。验证标准与旧名称的连接创建、属性覆盖、prototype 构造器路径、重复注入、独立执行环境、未提供 WebRTC 的环境、不可替换属性告警及已有引用的限制。
- 真实 `WKWebExtension` 清单加载及执行：扩展关闭或未获得网站权限时，顶部页面、about:blank、srcdoc 和 HTTP iframe 均能创建无 STUN 连接；开启并授权后均抛出 `SecurityError`。媒体采集 API 保持存在。
- macOS 扩展容器：Apple 官方 packager 生成，`xcodebuild` 未签名构建成功。
- 构建工程出现的大小写 bundle ID 不一致已通过使用与容器名称一致的 ID 修正。

## 待完成

- Safari 应用中加载临时扩展、网站权限、个人资料与无痕浏览验证。
- 同一网络配置下 TCPTest 和第二个检测站的关闭/开启/关闭对比。
- 浏览器重启及 24 小时临时扩展失效体验。
- 其他 macOS/Safari 版本、跨源 iframe、严格 CSP 等更全面的兼容性验证。
- App Store 签名、图标、容器界面和审核。

真实 WebKit 测试不代表全部浏览器路径安全，也不证明已经修复 VPN 分流。正式发布宣称必须以进一步实测为依据。测试记录不提交用户 IP、位置或截图。
