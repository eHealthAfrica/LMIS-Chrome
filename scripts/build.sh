#!/usr/bin/env bash
set -e

pwd="${PWD##}"
app="lomis"
cca="./node_modules/.bin/cca"
build="$pwd/build"

have() { command -v "$1" >/dev/null; }
info() { echo "$0: $1"; }
error() { info "$1"; exit 1; }

[[ "$TAVIS_TAG" ]] && type="release" || type="snapshot"
info "Performing $type build"

[[ "$TRAVIS_TAG" ]] && grunt build:release || grunt build

info "Building Mobile Chrome App"
have "android" || error "Android SDK required"

[[ -d "$build/$app" ]] && rm -rf "$build/$app"
mkdir -p "$build" && cd "$build"

cca create "$app" --android --link-to="$pwd/dist"
cd "$build/$app"
cca plugin add $(< "$pwd/scripts/build/cca-plugins.txt")
patch < "$pwd/scripts/build/config.patch"

android="$build/$app/platforms/android"
releases="build/releases"
snapshots="build/snapshots"

echo -n $id_rsa_{00..30} >> ~/.ssh/id_rsa_base64
base64 --decode --ignore-garbage ~/.ssh/id_rsa_base64 > ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa
eha="79.125.119.180"
echo -e "Host $eha\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config

if [[ "$TRAVIS_TAG" ]]; then
  scp -r travisci@$eha:android-keystore/release/\* "$android"
  cca build --release
  apk="$android/bin/LoMIS-release.apk"
  out="$releases/$app-$TRAVIS_TAG.apk"
else
  mkdir -p ~/.android
  scp -r travisci@$eha:android-keystore/debug/\* ~/.android
  cca build
  apk="$android/bin/LoMIS-debug.apk"
  now="$(date -u +"%Y%m%d%H%M%S")"
  out="$snapshots/$app-$now.apk"
fi

mkdir -p "$releases" "$snapshots"
ln -s "$apk" "$out"
