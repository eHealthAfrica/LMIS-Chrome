#!/usr/bin/env bash
set -e

pwd="${PWD##}"
app="lomis"
cca="$pwd/node_modules/.bin/cca"
keys="$pwd/.android"
build="$pwd/build"
apks="$build/$app/platforms/android/build/outputs/apk"

have() { command -v "$1" >/dev/null; }
info() { echo "$0: $1"; }
error() { info "$1"; exit 1; }
usage() { echo "usage: $0 snapshot|release"; }

[[ "$1" ]] || { usage; exit 1; }
[[ "$1" == "--help" || "$1" == "-h" ]] && { usage; exit; }
[[ "$1" != "snapshot" && "$1" != "release" ]] && { usage; exit 1; }
type="$1"

[[ "$type" == "snapshot" ]] \
  && version="$(date -u +"%Y%m%d%H%M%S")" \
  || version="$(git describe --abbrev=0 --tags)"

info "Building $app $version $type build for Android"
have "android" || error "Android SDK required"

if [[ "$type" == "release" ]]; then
  [[ -d "$keys" ]] || error "Add android-release keys to $keys and try again"
fi

[[ -d "$build/$app" ]] && rm -rf "$build/$app"
mkdir -p "$build" && cd "$build"

grunt build:"$type"
"$cca" create "$app" --android --link-to="$pwd/dist"

[[ "$type" == "release" ]] && cp "$keys"/* "$build/$app"
cd "$build/$app"

cca plugin add $(< "$pwd/scripts/build/cca-plugins.txt")

ccabuild="$cca build android"
[[ $type == "release" ]] && ccabuild+=" --release"
$ccabuild

[[ "$type" == "snapshot" ]] && ccaname="debug" || ccaname="release"
for i in armv7 x86; do
  mv "$apks/android-$i-$ccaname.apk" "$build/$app-$version-$i-$type.apk"
done
info "apks are in $build"
