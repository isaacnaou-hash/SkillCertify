# =========================================================
# 1️⃣ BUILD STAGE
# =========================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for canvas
RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  pkgconf \
  cairo-dev \
  jpeg-dev \
  pango-dev \
  giflib-dev \
  pixman-dev

# Copy package files
COPY package*.json ./

# Install all deps (including dev) for build
RUN npm ci

# Copy source code
COPY . .

# Build frontend & backend
RUN npm run build

# =========================================================
# 2️⃣ RUNTIME STAGE
# =========================================================
FROM node:20-alpine AS runner

WORKDIR /app

# ✅ Include Python so node-gyp can rebuild native modules (like canvas)
RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  pkgconf \
  cairo \
  jpeg \
  pango \
  giflib \
  pixman

# Copy package files
COPY package*.json ./

# ✅ Copy prebuilt node_modules from builder (avoid rebuilding canvas)
COPY --from=builder /app/node_modules ./node_modules

# ✅ Copy built files
COPY --from=builder /app/dist ./dist

# Diagnostic output to confirm files
RUN echo "=== DIST CONTENTS ===" && ls -R dist || true

# Expose port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# ✅ Delay for Dokploy proxy sync + start app
CMD ["sh", "-c", "echo 'Starting in 3s...' && sleep 3 && node dist/server/index.js"]
