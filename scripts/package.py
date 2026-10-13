#!/usr/bin/env python3
"""Package only public extension resources; never include developer files."""
import json
from pathlib import Path
import shutil
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
manifest = json.loads((root / "extension/manifest.json").read_text())
version = manifest["version"]
icons = set(manifest.get("icons", {}).values())
icons.update(manifest.get("action", {}).get("default_icon", {}).values())
files = ["manifest.json", "guard.js", *sorted(icons)]
for name in files:
    if not (root / "extension" / name).is_file():
        raise FileNotFoundError(f"Missing extension resource: {name}")
dist = root / "dist"
dist.mkdir(exist_ok=True)


def package(destination, resources):
    with ZipFile(destination, "w", ZIP_DEFLATED) as archive:
        for name, content in sorted(resources.items()):
            info = ZipInfo(name, (2026, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(info, content)
    print(destination)


resources = {name: (root / "extension" / name).read_bytes() for name in files}
package(dist / f"webrtc-guard-{version}.zip", resources)

# Chrome and Edge share a package and the same guard.js used by Safari.
chromium = dict(manifest)
chromium.update({
    "name": "__MSG_extensionName__",
    "description": "__MSG_extensionDescription__",
    "default_locale": "en",
    "minimum_chrome_version": "119",
})
chromium["action"] = {
    "default_title": "__MSG_extensionName__",
    "default_icon": {"16": "icons/icon-16.png", "32": "icons/icon-32.png"},
}
resources = {name: content for name, content in resources.items() if not name.startswith("icons/toolbar-")}
resources["manifest.json"] = (json.dumps(chromium, ensure_ascii=False, indent=2) + "\n").encode()
resources["icons/icon-128.png"] = (root / "assets/branding/store/chrome-icon-128.png").read_bytes()
for path in sorted((root / "chromium/_locales").glob("*/messages.json")):
    resources[f"_locales/{path.parent.name}/messages.json"] = path.read_bytes()

unpacked = dist / "chromium"
if unpacked.exists():
    shutil.rmtree(unpacked)
for name, content in resources.items():
    target = unpacked / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(content)
package(dist / f"webrtc-guard-chromium-{version}.zip", resources)
