FROM node:22-alpine

# Install curl for health checks
RUN apk add --no-cache curl libc6-compat

# Use pnpm that matches your repo's packageManager (pnpm@10.18.1)
ENV COREPACK_ENABLE_STRICT=0
RUN corepack enable && corepack prepare pnpm@10.18.1 --activate

WORKDIR /usr/src/app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/blockchain/package.json ./apps/blockchain/
COPY packages ./packages

# Install dependencies
RUN pnpm install --frozen-lockfile --filter blockchain

# Copy blockchain app source
COPY apps/blockchain ./apps/blockchain

# Copy entrypoint script
COPY apps/blockchain/docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /usr/src/app/apps/blockchain

EXPOSE 8545

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

