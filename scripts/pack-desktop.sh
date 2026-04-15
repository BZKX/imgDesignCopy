#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

pnpm --filter @promptlens/desktop tauri build

BUNDLE_DIR="apps/desktop/src-tauri/target/release/bundle"
echo "Desktop artifacts: $BUNDLE_DIR"
if [ -d "$BUNDLE_DIR" ]; then
  ls "$BUNDLE_DIR"
fi
