# 现有项目与可行性调查

调查日期：2026-10-11。搜索范围包含公开 GitHub 项目、开发者项目说明、Apple 文档和 Mozilla 浏览器兼容数据。搜索未找到可直接推荐的、经验证的 Safari 专用开源 WebRTC 阻止扩展；这不是对所有扩展或商店地区的穷尽证明。

| 项目 | 可参考内容 | 对本需求的适用性 |
| --- | --- | --- |
| [WebRTC Control](https://github.com/dlinbernard/webrtc-control) | 网页 API 拦截和浏览器隐私设置 | README 发布目标为 Chrome、Firefox、Opera、Edge；清单依赖 `privacy`，Safari 不能直接使用全部功能 |
| [WebRTC Leak Prevent](https://github.com/a8763506128977812212307169331690/WebRTC-Leak-Prevent) | Chromium WebRTC 网络策略 | 项目明确定位 Chromium；不是 Safari 扩展 |
| [Safari IP Monitor](https://github.com/Jesof/safari-ip-monitor) | Safari WebRTC 地址检测 | 检测和监控项目，不是阻止连接的方案 |

Safari 不支持 WebExtensions `privacy` API，不能直接设置 Chrome/Firefox 的 `privacy.network.webRTCIPHandlingPolicy`。[Mozilla 兼容数据](https://github.com/mdn/browser-compat-data/blob/main/webextensions/api/privacy.json)

Mozilla 兼容数据标记 Safari 从 18 支持 `content_scripts.world`，从 18.4 支持 `match_about_blank` 和 `match_origin_as_fallback`；授予权限之后的新页面加载才会遵循 `run_at`。[content_scripts 兼容数据](https://github.com/mdn/browser-compat-data/blob/main/webextensions/manifest/content_scripts.json)

Apple 官方支持临时加载扩展目录/ZIP；退出 Safari 或满 24 小时会移除。未签名扩展开关在退出 Safari 后重置。[官方运行说明](https://developer.apple.com/documentation/safariservices/running-your-safari-web-extension)

WebRTC ICE 候选可能披露网络地址。WebKit 的旧说明描述了 host、server-reflexive 和 TURN 地址的区别，但旧开发菜单和选项不应当作当前版本的关闭教程。“Remove Legacy WebRTC API”仅针对旧 API，不等于禁用现代 WebRTC。[WebKit 说明](https://webkit.org/blog/7763/a-closer-look-into-webrtc/) · [WebRTC 规范](https://www.w3.org/TR/webrtc/)

据此独立实现一个同步、默认阻止网页连接创建的实验版，不依赖异步存储读取、后台消息或网页 script 标签加载。网络级保护及保留通话的策略不属于本版本能力。
