#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

pnpm --filter @promptlens/chrome build

VERSION=$(node -p "require('./apps/chrome/package.json').version")
OUT_DIR="store-assets"
mkdir -p "$OUT_DIR"
OUT="$OUT_DIR/promptlens-chrome-${VERSION}.zip"
rm -f "$OUT"

cd apps/chrome/dist
zip -r "../../../$OUT" .
cd - >/dev/null

echo "Chrome artifact: $OUT"
