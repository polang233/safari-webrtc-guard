#!/usr/bin/env python3
"""Package only public extension resources; never include developer files."""
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
manifest = json.loads((root / "extension/manifest.json").read_text())
version = manifest["version"]
icons = set(manifest.get("icons", {}).values())
icons.update(manifest.get("action", {}).get("default_icon", {}).values())
files = ["manifest.json", "guard.js", *sorted(icons)]
for name in files:
    if not (root / "extension" / name).is_file():
        raise FileNotFoundError(f"Missing extension resource: {name}")
destination = root / "dist" / f"webrtc-guard-{version}.zip"
destination.parent.mkdir(exist_ok=True)
with ZipFile(destination, "w", ZIP_DEFLATED) as archive:
    for name in files:
        archive.write(root / "extension" / name, name)
print(destination)
