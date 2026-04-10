#!/usr/bin/env bash
# Builds the plugin into release/anura-io.zip.
# Mirrors the build steps in .github/workflows/release.yml.

set -e

PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RELEASE_PLUGIN_DIR="$PLUGIN_DIR/release/anura-io"

echo "--- Building anura-script ---"
(cd "$PLUGIN_DIR/anura-script" && pnpm install --frozen-lockfile && pnpm build)

echo "--- Building front-end ---"
(cd "$PLUGIN_DIR/front-end" && pnpm install --frozen-lockfile && pnpm build)

echo "--- Installing production PHP dependencies ---"
# Use a temp dir so the local vendor/ (which includes dev deps) is not clobbered.
TEMP_DIR=$(mktemp -d)
cp "$PLUGIN_DIR/composer.json" "$TEMP_DIR/"
cp "$PLUGIN_DIR/composer.lock" "$TEMP_DIR/"
composer install --working-dir="$TEMP_DIR" --prefer-dist --no-progress --no-dev --optimize-autoloader

echo "--- Assembling release package ---"
rm -rf "$RELEASE_PLUGIN_DIR"
mkdir -p "$RELEASE_PLUGIN_DIR"

cp "$PLUGIN_DIR"/*.php "$RELEASE_PLUGIN_DIR/"
cp "$PLUGIN_DIR/LICENSE" "$RELEASE_PLUGIN_DIR/"
cp -r "$TEMP_DIR/vendor" "$RELEASE_PLUGIN_DIR/"
rm -rf "$TEMP_DIR"

mkdir -p "$RELEASE_PLUGIN_DIR/anura-script/dist"
cp "$PLUGIN_DIR/anura-script/dist/anura-includes.iife.js" "$RELEASE_PLUGIN_DIR/anura-script/dist/"

mkdir -p "$RELEASE_PLUGIN_DIR/front-end/dist"
cp "$PLUGIN_DIR/front-end/dist/index.js" "$RELEASE_PLUGIN_DIR/front-end/dist/"
cp "$PLUGIN_DIR/front-end/dist/index.css" "$RELEASE_PLUGIN_DIR/front-end/dist/"

if [ -d "$PLUGIN_DIR/assets" ]; then
    cp -r "$PLUGIN_DIR/assets" "$RELEASE_PLUGIN_DIR/"
fi

echo "--- Creating zip ---"
cd "$PLUGIN_DIR/release"
zip -r anura-io.zip anura-io/

echo ""
echo "Built: release/anura-io.zip"
