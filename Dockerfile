# =========================================================
# ✅ SINGLE-STAGE PRODUCTION BUILD (full-size, stable)
# =========================================================
FROM node:20-alpine

WORKDIR /app

# Install full build toolchain for node-canvas and Vite
RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  pkgconf \
  cairo-dev \
  jpeg-dev \
  pango-dev \
  giflib-dev \
  pixman-dev \
  bash

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build frontend + backend
RUN npm run build

# Expose your app’s port (Dokploy auto-detects this)
EXPOSE 5000

# Environment configuration
ENV NODE_ENV=production
ENV PORT=5000

# Optional healthcheck for Dokploy (auto waits until live)
HEALTHCHECK --interval=30s --timeout=10s --retries=5 \
  CMD wget -qO- http://localhost:5000/health || exit 1

# Run your compiled server
CMD ["node", "dist/server/index.js"]
