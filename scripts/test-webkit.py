#!/usr/bin/env python3
"""macOS 15.4+ / Xcode integration test with real WKWebExtension loading."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import subprocess
import tempfile
from threading import Thread

root = Path(__file__).resolve().parent.parent
with tempfile.TemporaryDirectory(prefix="safari-webrtc-test-") as directory:
    binary = str(Path(directory) / "webkit-probe")
    subprocess.run([
        "xcrun", "swiftc", "-parse-as-library", "-module-cache-path", str(Path(directory) / "cache"),
        str(root / "tests/webkit.swift"), "-o", binary
    ], check=True, cwd=root)
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(SimpleHTTPRequestHandler, directory=str(root / "tests")))
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        for arguments in (["--baseline"], ["--denied"], []):
            subprocess.run([binary, f"--port={server.server_port}", *arguments], check=True, cwd=root, timeout=35)
    finally:
        server.shutdown()
        server.server_close()
        thread.join()
