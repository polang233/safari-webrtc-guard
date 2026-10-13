"""Check the ZIPs submitted to browsers and stores, including shared script bytes."""
import json
from pathlib import Path
import subprocess
import unittest
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parent.parent


class Packages(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        subprocess.run(["python3", "scripts/package.py"], cwd=ROOT, check=True)
        cls.manifest = json.loads((ROOT / "extension/manifest.json").read_text())

    def test_versions_and_runtime(self):
        self.assertEqual(self.manifest["version"], json.loads((ROOT / "package.json").read_text())["version"])
        for suffix in ("", "-chromium"):
            with ZipFile(ROOT / "dist" / f"webrtc-guard{suffix}-{self.manifest['version']}.zip") as archive:
                manifest = json.loads(archive.read("manifest.json"))
                self.assertEqual(manifest["version"], self.manifest["version"])
                self.assertEqual(manifest["content_scripts"], self.manifest["content_scripts"])
                self.assertEqual(archive.read("guard.js"), (ROOT / "extension/guard.js").read_bytes())
                for key in ("background", "permissions", "host_permissions", "web_accessible_resources"):
                    self.assertNotIn(key, manifest)
                self.assertTrue(all(not name.startswith(("tests/", "node_modules/", "native/")) for name in archive.namelist()))
                icons = set(manifest["icons"].values()) | set(manifest["action"]["default_icon"].values())
                for icon in icons:
                    self.assertGreater(len(archive.read(icon)), 0)

    def test_chromium_localization_and_unpacked_files(self):
        with ZipFile(ROOT / "dist" / f"webrtc-guard-chromium-{self.manifest['version']}.zip") as archive:
            manifest = json.loads(archive.read("manifest.json"))
            self.assertEqual(manifest["minimum_chrome_version"], "119")
            self.assertEqual(manifest["default_locale"], "en")
            self.assertEqual(archive.read("icons/icon-128.png"), (ROOT / "assets/branding/store/chrome-icon-128.png").read_bytes())
            for locale in ("en", "zh_CN"):
                messages = json.loads(archive.read(f"_locales/{locale}/messages.json"))
                self.assertEqual(messages["extensionName"]["message"], "WebRTC Guard")
                self.assertLessEqual(len(messages["extensionDescription"]["message"]), 132)
            for name in archive.namelist():
                self.assertEqual(archive.read(name), (ROOT / "dist/chromium" / name).read_bytes())


if __name__ == "__main__":
    unittest.main()
