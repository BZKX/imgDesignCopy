# syntax=docker/dockerfile:1.7

# ============================================================================
# PromptLens website — multi-stage Docker build for pnpm monorepo
#
# Build context: monorepo root (so pnpm-workspace.yaml + packages/* are reachable)
#   docker build -f apps/website/Dockerfile -t promptlens-website:latest .
# ============================================================================

ARG NODE_VERSION=20-alpine

# ----------------------------------------------------------------------------
# Stage 1: deps — install pnpm and resolve workspace dependencies (cached)
# ----------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS deps

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

WORKDIR /repo

# Copy workspace manifest files only (max cache-friendliness)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/website/package.json ./apps/website/package.json
COPY packages/core/package.json ./packages/core/package.json

# Force public npm registry inside container (override any host .npmrc)
RUN echo "registry=https://registry.npmjs.org/" > .npmrc

# Install only the website's dep tree
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --filter @promptlens/website... --frozen-lockfile

# ----------------------------------------------------------------------------
# Stage 2: builder — copy source, build Next.js standalone bundle
# ----------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS builder

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

WORKDIR /repo

# Bring in the resolved deps from stage 1
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/website/node_modules ./apps/website/node_modules
COPY --from=deps /repo/packages/core/node_modules ./packages/core/node_modules

# Copy full source
COPY . .

# Public env vars must be present at build time so they get inlined into the bundle
ARG NEXT_PUBLIC_SITE_URL=https://promptlens.cc
ARG NEXT_PUBLIC_CF_ANALYTICS_TOKEN=
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_CF_ANALYTICS_TOKEN=${NEXT_PUBLIC_CF_ANALYTICS_TOKEN}

# Build (next.config.mjs has output: 'standalone' → produces .next/standalone/)
RUN pnpm --filter @promptlens/website build

# ----------------------------------------------------------------------------
# Stage 3: runner — minimal runtime image (~150 MB)
# ----------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as non-root for safety
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Standalone bundle: includes minimal node_modules + server.js
COPY --from=builder --chown=nextjs:nodejs /repo/apps/website/.next/standalone ./
# Static assets (CSS, images, JS chunks) — Next.js serves them via /_next/static/*
COPY --from=builder --chown=nextjs:nodejs /repo/apps/website/.next/static ./apps/website/.next/static
# Public folder (icons, downloads/promptlens-chrome-0.2.0.zip, stage assets)
COPY --from=builder --chown=nextjs:nodejs /repo/apps/website/public ./apps/website/public

USER nextjs

EXPOSE 3000

# Standalone server entrypoint — emitted by Next.js at .next/standalone/apps/website/server.js
CMD ["node", "apps/website/server.js"]
