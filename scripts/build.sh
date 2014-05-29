#!/usr/bin/env bash
set -e

pwd="${PWD##}"
app="lomis"
build="$pwd/build"

have() { command -v "$1" >/dev/null; }
info() { echo "$0: $1"; }
error() { info "$1"; exit 1;}

grunt build
have "cca" || npm install -g cca
have "android" || error "Android SDK required"

[[ -d "$build/$app" ]] && rm -rf "$build/$app"
mkdir -p "$build" && cd "$build"

cca create "$app" --android --link-to="$pwd/dist"
cd "$build/$app"
cca plugin add $(< "$pwd/scripts/build/cca-plugins.txt")
patch < "$pwd/scripts/build/config.patch"
cca build

apk="platforms/android/ant-build/LoMIS-debug.apk"
[[ -f "$apk" ]] || error "$apk does not exist"

snapshot="snapshots/$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
mkdir -p "$snapshot" && ln -s "$apk" "$snaphot"
