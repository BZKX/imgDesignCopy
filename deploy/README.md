# PromptLens — VPS deployment

Self-hosted Docker Compose stack: Caddy (reverse proxy + TLS) → Next.js standalone container.

```
internet → Cloudflare proxy → VPS :443 (caddy) → website :3000
```

---

## One-time server prep

SSH into the VPS as a sudo-able user, then:

### 1. Install Docker (Ubuntu 22.04+)

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
exit                                # log out + back in to pick up the group
```

### 2. Make a deploy folder

```bash
mkdir -p ~/promptlens && cd ~/promptlens
```

### 3. Get the Cloudflare Origin Certificate (free, 15-year)

In the Cloudflare dashboard:
1. Site `promptlens.cc` → **SSL/TLS** → **Origin Server** → **Create Certificate**
2. Hostnames: `promptlens.cc, *.promptlens.cc` (defaults are fine)
3. Validity: 15 years (default)
4. Save the two text blocks:
   - "Origin Certificate" → `cert.pem`
   - "Private key" → `key.pem`
5. Set the Cloudflare SSL/TLS encryption mode (top of SSL/TLS page) to **Full (strict)**

On the VPS:

```bash
mkdir -p ~/promptlens/cert
nano ~/promptlens/cert/cert.pem      # paste the Origin Certificate, save
nano ~/promptlens/cert/key.pem       # paste the Private Key, save
chmod 600 ~/promptlens/cert/key.pem
```

### 4. Drop the compose + Caddy + env files

Copy these three files from `deploy/` in the repo to `~/promptlens/` on the server:
- `docker-compose.yml`
- `.env`  (start from `.env.example`, fill in real secrets)

Quickest way: `scp` from your laptop:

```bash
scp deploy/docker-compose.yml deploy/.env.example ubuntu@VPS_IP:~/promptlens/
ssh ubuntu@VPS_IP "cd ~/promptlens && mv .env.example .env && nano .env"
```

---

## Build + push the image (from your laptop)

### 1. Authenticate with GHCR

```bash
# Create a GitHub Personal Access Token: github.com/settings/tokens
#   - scope: write:packages, read:packages
echo $GHCR_PAT | docker login ghcr.io -u bzkx --password-stdin
```

### 2. Build (from monorepo root, NOT apps/website/)

```bash
docker buildx build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_SITE_URL=https://promptlens.cc \
  -f apps/website/Dockerfile \
  -t ghcr.io/bzkx/promptlens-website:latest \
  -t ghcr.io/bzkx/promptlens-website:0.2.0 \
  --push .
```

> `--platform linux/amd64` is required if you build on Apple Silicon Mac and your VPS is x86_64. Skip the flag if the VPS is also arm64.

### 3. Make the GHCR package private (default is private, just verify)

`github.com/BZKX?tab=packages` → click `promptlens-website` → Package settings → Visibility = Private.

---

## Deploy on the VPS

```bash
ssh ubuntu@VPS_IP
cd ~/promptlens

# First time only — auth GHCR on the server
echo $GHCR_PAT | docker login ghcr.io -u bzkx --password-stdin

docker compose pull
docker compose up -d
docker compose logs -f          # watch startup; Ctrl+C to detach
```

Verify:

```bash
curl -sf -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000          # website container
curl -ksf -o /dev/null -w "HTTP %{http_code}\n" https://localhost              # caddy
```

In a browser: `https://promptlens.cc` should load.

---

## Updates (from laptop)

After making changes locally + bumping `package.json` version:

```bash
# 1. Build & push from monorepo root
docker buildx build --platform linux/amd64 \
  -f apps/website/Dockerfile \
  -t ghcr.io/bzkx/promptlens-website:latest \
  --push .

# 2. SSH and roll
ssh ubuntu@VPS_IP "cd ~/promptlens && docker compose pull && docker compose up -d"
```

Zero downtime: Compose recreates the website container after the new image is pulled; Caddy keeps serving until the new container is healthy.

---

## Troubleshooting

```bash
# Container logs
docker compose logs website
docker compose logs caddy

# Live tail
docker compose logs -f --tail=200

# Shell into the website container
docker compose exec website sh

# Restart just one service
docker compose restart website

# Full nuke + restart
docker compose down && docker compose up -d
```

### Common gotchas

- **`502 Bad Gateway` from Caddy** → website container hasn't finished boot. `docker compose logs website` to see why.
- **`SSL_ERROR_NO_CYPHER_OVERLAP`** → cert.pem / key.pem swapped, or Cloudflare SSL mode is "Off" / "Flexible". Set it to **Full (strict)**.
- **`429` rate limit on /api/waitlist** → expected; in-memory limit is 5/IP/hour. Restart container to reset (or wire Vercel KV / Redis later).
- **CF proxy returning 502 even when origin is healthy** → CF SSL mode mismatch. Make sure CF is **Full (strict)** AND your cert is valid for `promptlens.cc`.

---

## Hardening (do later, not now)

- [ ] Move `RESEND_API_KEY` to Docker secrets instead of env var
- [ ] Add `fail2ban` on the host for SSH brute-force protection
- [ ] Restrict the VPS firewall to only accept :80 / :443 from Cloudflare's published IP ranges (https://www.cloudflare.com/ips/)
- [ ] Set up `watchtower` for automated rolling updates of the caddy image
