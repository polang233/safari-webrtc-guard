#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
mkdir -p build
# Build the checked-in project; edits made in Xcode are retained.
xcodebuild -project 'native/WebRTC Guard/WebRTC Guard.xcodeproj' \
  -scheme 'WebRTC Guard' -configuration Debug \
  -derivedDataPath "$PWD/build/xcode" CODE_SIGNING_ALLOWED=NO build
