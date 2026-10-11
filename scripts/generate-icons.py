#!/usr/bin/env python3
"""Export the approved logo to macOS and extension assets with Apple's sips."""
import json
from pathlib import Path
import shutil
import subprocess

root = Path(__file__).resolve().parent.parent
branding = root / "assets/branding"
source = branding / "logo-source.png"
catalog = root / "native/WebRTC Guard/WebRTC Guard/Assets.xcassets/AppIcon.appiconset"
profile = Path("/System/Library/ColorSync/Profiles/sRGB Profile.icc")


def export(destination: Path, size: int, input_image: Path = source):
    destination.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([
        "sips", "--setProperty", "format", "png", "--embedProfile", str(profile),
        "--resampleHeightWidth", str(size), str(size), str(input_image), "--out", str(destination)
    ], check=True, stdout=subprocess.DEVNULL)


export(branding / "logo.png", 1024)
export(branding / "logo-128.png", 128)

images = []
for size in (16, 32, 128, 256, 512):
    for scale in (1, 2):
        filename = f"icon_{size}x{size}{'@2x' if scale == 2 else ''}.png"
        export(catalog / filename, size * scale)
        images.append({"filename": filename, "idiom": "mac", "scale": f"{scale}x", "size": f"{size}x{size}"})
(catalog / "Contents.json").write_text(json.dumps({"images": images, "info": {"author": "xcode", "version": 1}}, indent=2) + "\n")

for size in (16, 32, 48, 64, 128, 256, 512):
    export(root / f"extension/icons/icon-{size}.png", size)

for size in (16, 32):
    export(root / f"extension/icons/toolbar-{size}.png", size, branding / "toolbar-source.png")

shutil.copy2(branding / "logo.png", root / "native/WebRTC Guard/WebRTC Guard/Resources/Icon.png")
print("Exported 1024px logo, 10 macOS icon slots, 7 color icons, 2 template icons, and container image.")
