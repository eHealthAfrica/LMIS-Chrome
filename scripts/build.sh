#!/usr/bin/env bash
set -e

pwd="${PWD##}"
app="lomis"
build="$pwd/build"

have() { command -v "$1" >/dev/null; }
info() { echo "$0: $1"; }
error() { info "$1"; exit 1;}

info "Running grunt build"
grunt build

info "Building Mobile Chrome App"
have "cca" || npm install -g cca
have "android" || error "Android SDK required"

[[ -d "$build/$app" ]] && rm -rf "$build/$app"
mkdir -p "$build" && cd "$build"

cca create "$app" --android --link-to="$pwd/dist"
cd "$build/$app"
cca plugin add $(< "$pwd/scripts/build/cca-plugins.txt")
patch < "$pwd/scripts/build/config.patch"

android="$build/$app/platforms/android"
if [[ "$TRAVIS_TAG" ]]; then
  echo -n $id_rsa_{00..30} >> ~/.ssh/id_rsa_base64
  base64 --decode --ignore-garbage ~/.ssh/id_rsa_base64 > ~/.ssh/id_rsa
  chmod 600 ~/.ssh/id_rsa
  md5sum ~/.ssh/id_rsa
  eha="79.125.119.180"
  echo -e "Host $eha\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config
  scp -r travisci@$eha:android-keystore/\* "$android"
  cca build --release
  apk="$android/ant-build/LoMIS-release.apk"
  deployDir="releases"
  mkdir -p "$deployDir" && ln -s "$apk" "$deployDir/$app-$TRAVIS_TAG.apk"
else
  cca build
  apk="$android/ant-build/LoMIS-debug.apk"
  now="$(date -u +"%Y%m%d%H%M%S")"
  deployDir="snapshots"
  mkdir -p "$deployDir" && ln -s "$apk" "$deployDir/$app-$now.apk"
fi
