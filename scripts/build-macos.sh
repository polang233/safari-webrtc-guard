#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
mkdir -p build
# The packager derives the container suffix from app-name. Keep the case identical.
xcrun safari-web-extension-packager "$PWD/extension" \
  --project-location "$PWD/native" \
  --app-name 'Safari WebRTC Guard' \
  --bundle-identifier io.github.polang233.Safari-WebRTC-Guard \
  --swift --macos-only --no-open --no-prompt
xcodebuild -project 'native/Safari WebRTC Guard/Safari WebRTC Guard.xcodeproj' \
  -scheme 'Safari WebRTC Guard' -configuration Debug \
  -derivedDataPath "$PWD/build/xcode" CODE_SIGNING_ALLOWED=NO build
