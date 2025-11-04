# =========================================================
# 1️⃣ BUILD STAGE
# =========================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install native build deps (for canvas)
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

# ✅ Build frontend & backend
RUN npm run build

# =========================================================
# 2️⃣ RUNTIME STAGE
# =========================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime deps for canvas
RUN apk add --no-cache \
  cairo \
  jpeg \
  pango \
  giflib \
  pixman

# Copy package files and install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Diagnostic log to confirm build result
RUN echo "=== DIST CONTENTS ===" && ls -R dist || true

# Expose port
EXPOSE 5000

# Environment variables
ENV NODE_ENV=production
ENV PORT=5000

# ✅ Add small delay to let Coolify proxy connect
CMD ["sh", "-c", "echo 'Starting in 3s...' && sleep 3 && ls dist/server && node dist/server/index.js"]
