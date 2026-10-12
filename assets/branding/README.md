# WebRTC Guard 图标资源

- `logo-source.png`：用户选定的原始 Logo，1254×1254，像素内容保持不变，已移除文件中嵌入的内容来源元数据。
- `logo.png`：1024×1024 的 sRGB 彩色图片，用于 App 图标及容器界面。
- `logo-128.png`：README 使用的预览图。
- `toolbar-source.png`：内置 imagegen 根据原图制作的透明底单色轮廓，仅用于浏览器工具栏。
- `toolbar-prompt.txt`：透明轮廓版的生成提示词。

macOS AppIcon 采用 Xcode 资产目录，提供 16、32、128、256、512 点的 1×/2× 图片。浏览器扩展提供彩色图标及 16/32px 工具栏模板图标。

在 macOS 上执行 `python3 scripts/generate-icons.py`，根据两个母版重新导出所有使用中的 PNG。更换 Logo 造型时应同时更新两个母版。打包脚本会从清单收集图标路径，并在缺少资源时失败。
