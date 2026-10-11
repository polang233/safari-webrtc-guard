#!/usr/bin/env python3
"""Package only public extension resources; never include developer files."""
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
version = json.loads((root / "extension/manifest.json").read_text())["version"]
destination = root / "dist" / f"webrtc-guard-{version}.zip"
destination.parent.mkdir(exist_ok=True)
with ZipFile(destination, "w", ZIP_DEFLATED) as archive:
    for name in ("manifest.json", "guard.js"):
        archive.write(root / "extension" / name, name)
print(destination)
