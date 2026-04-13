#!/usr/bin/env bash
# Build and package img2prompt for Chrome Web Store submission.
# Produces:
#   dist/                     — unpacked extension (load as developer build)
#   store-assets/img2prompt-<version>.zip — the uploadable bundle
set -euo pipefail

cd "$(dirname "$0")/.."

VERSION=$(node -p "require('./package.json').version")
OUT_DIR="store-assets"
ZIP_NAME="img2prompt-${VERSION}.zip"

echo "[pack] building version ${VERSION}"
pnpm install --frozen-lockfile
pnpm build

if [ ! -f "dist/manifest.json" ]; then
  echo "[pack] ERROR: dist/manifest.json not found after build" >&2
  exit 1
fi

# Permission sanity check: MVP must ship with exactly these three permissions.
EXPECTED_PERMS='["activeTab","storage","scripting"]'
ACTUAL_PERMS=$(node -e "console.log(JSON.stringify(require('./dist/manifest.json').permissions||[]))")
if [ "$ACTUAL_PERMS" != "$EXPECTED_PERMS" ]; then
  echo "[pack] ERROR: manifest permissions changed" >&2
  echo "  expected: ${EXPECTED_PERMS}" >&2
  echo "  actual:   ${ACTUAL_PERMS}" >&2
  exit 1
fi

# Size guard: listing must be <= 2MB per plan AC7.
SIZE_BYTES=$(du -sk dist | awk '{print $1 * 1024}')
MAX_BYTES=$((2 * 1024 * 1024))
if [ "$SIZE_BYTES" -gt "$MAX_BYTES" ]; then
  echo "[pack] ERROR: dist/ is ${SIZE_BYTES} bytes (> ${MAX_BYTES})" >&2
  exit 1
fi
printf "[pack] dist/ size OK: %s bytes\n" "$SIZE_BYTES"

mkdir -p "${OUT_DIR}"
rm -f "${OUT_DIR}/${ZIP_NAME}"

(cd dist && zip -qr "../${OUT_DIR}/${ZIP_NAME}" .)

echo "[pack] wrote ${OUT_DIR}/${ZIP_NAME}"
ls -lh "${OUT_DIR}/${ZIP_NAME}"
