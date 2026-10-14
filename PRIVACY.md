# 隐私说明

WebRTC Guard 只在获得网站权限的页面启动时替换 WebRTC 连接构造器。

适用于 Safari、Chrome 与 Microsoft Edge。Chrome / Edge 包提供英文与简体中文描述，三个浏览器使用相同的拦截脚本。

扩展不读取、存储或发送 IP 地址、页面正文、浏览历史、表单或 Cookie。没有后台脚本、服务器、遥测、远程脚本及第三方运行依赖。网站访问权限用于在网页脚本环境中执行拦截，浏览器仍可能将其描述为读取和修改网站内容的权限。

构造器属性无法替换时，在当前页开发者控制台输出 API 名称和保护不完整的提醒，不输出地址或页面内容。

README 中链接的外部检测站有各自的隐私政策；用户主动访问检测站时，该站仍能获得 HTTP 请求的地址。扩展不会自动打开检测站或向 STUN 服务发起测试。

## Privacy policy

WebRTC Guard replaces WebRTC connection constructors when permitted pages start loading in Safari, Chrome and Microsoft Edge.

The extension does not read, store or transmit IP addresses, page content, browsing history, forms or cookies. It has no background script, server, analytics, remote code or third-party runtime dependencies. Website access is used only to run the blocking script in the page's JavaScript environment. Browsers may describe this as permission to read and change website data.

If a constructor cannot be replaced, the extension logs its API name and an incomplete-protection warning in the page console. No address or page content is logged.

External test sites have their own privacy policies and can see the HTTP address when you visit them. The extension does not open these sites or contact STUN servers. The optional development-only browser tests are separate from the extension package.
