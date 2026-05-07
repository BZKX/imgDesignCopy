#!/usr/bin/env bash
# =============================================================================
# Local-build → docker save → scp → docker load deploy script.
#
# Run from monorepo root:    bash deploy/build-and-ship.sh ubuntu@VPS_IP
#
# Requirements (laptop):     Docker Desktop, ssh access to VPS
# Requirements (VPS):        Docker Engine, ~/promptlens/ folder with
#                            docker-compose.yml + Caddyfile + .env + cert/
# =============================================================================

set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <ssh-target>"
  echo "  e.g.  $0 ubuntu@172.182.197.87"
  exit 1
fi

SSH_TARGET="$1"
IMAGE_NAME="promptlens-website:latest"
TAR_PATH="/tmp/promptlens-website.tar.gz"
REMOTE_DIR="~/promptlens"

echo "→ Build image (linux/amd64)..."
docker buildx build \
  --platform linux/amd64 \
  -f apps/website/Dockerfile \
  -t "${IMAGE_NAME}" \
  --load \
  .

echo "→ Pack to tar.gz..."
docker save "${IMAGE_NAME}" | gzip -1 > "${TAR_PATH}"
SIZE_MB=$(du -m "${TAR_PATH}" | cut -f1)
echo "  size: ${SIZE_MB} MB"

echo "→ Upload to ${SSH_TARGET}..."
scp "${TAR_PATH}" "${SSH_TARGET}:/tmp/promptlens-website.tar.gz"

echo "→ Load image on VPS + restart..."
ssh "${SSH_TARGET}" bash <<'REMOTE'
set -e
cd ~/promptlens
docker load < /tmp/promptlens-website.tar.gz
rm /tmp/promptlens-website.tar.gz
docker compose up -d --force-recreate website
docker compose ps
echo ""
echo "→ Tail logs (Ctrl+C to detach):"
timeout 10 docker compose logs -f --tail=30 website || true
REMOTE

echo ""
echo "✓ Deployed. Visit https://promptlens.cc to verify."
rm -f "${TAR_PATH}"
