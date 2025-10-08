# ------------------------------
# Base (shared)
# ------------------------------
FROM node:22-alpine AS base

# Some native deps (e.g., Prisma) benefit from this on Alpine
RUN apk add --no-cache libc6-compat

# Use pnpm that matches your repo's packageManager (pnpm@10.18.1)
ENV COREPACK_ENABLE_STRICT=0
RUN corepack enable && corepack prepare pnpm@10.18.1 --activate

# Silence turbo telemetry in CI/build logs (optional)
ENV TURBO_TELEMETRY_DISABLED=1

WORKDIR /repo


# ------------------------------
# Builder (turbo prune)
# ------------------------------
FROM base AS builder

# Copy the repo (ensure you have a proper .dockerignore)
# Note: This Dockerfile should be run from the monorepo root, not from apps/api
COPY . .

# Set the path to your app inside the monorepo
ARG APP_DIR=apps/api
ARG APP_NAME=api

# Install dependencies first to get turbo locally
RUN pnpm install --frozen-lockfile

# Prune the workspace to just what's needed to build/run the target app
# NOTE: Use the package name, not the folder path
RUN pnpm turbo prune "${APP_NAME}" --docker


# ------------------------------
# Installer (install deps + build)
# ------------------------------
FROM base AS installer
WORKDIR /repo

# 1) Copy pruned manifests first, then install (better cache behavior)
COPY --from=builder /repo/out/json/ ./
COPY --from=builder /repo/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 2) Copy pruned sources next
COPY --from=builder /repo/out/full/ ./

# If Prisma is used, generate client for the app (path filter)
ARG APP_NAME=api

# Build only what's needed for the app (path filter again)
RUN pnpm turbo run build --filter "${APP_NAME}"


# ------------------------------
# Runner (production)
# ------------------------------
FROM node:22-alpine AS runner

# curl for healthcheck and libc6-compat for native deps
RUN apk add --no-cache curl libc6-compat

ENV NODE_ENV=production
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S -D -H -u 1001 -G nodejs nodejs
USER nodejs

# Copy the built/pruned workspace
COPY --chown=nodejs:nodejs --from=installer /repo .

# Runtime config
ARG APP_DIR=apps/api
ENV PORT=3000
EXPOSE ${PORT}

# Healthcheck (adjust path if your readiness endpoint differs)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/ || exit 1

# Start NestJS (adjust entry if different)
CMD ["node", "apps/api/dist/main.js"]
