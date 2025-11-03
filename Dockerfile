# =========================================================
# 1️⃣ BUILD STAGE
# =========================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for canvas build
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

# ✅ Build frontend & backend separately
RUN npm run build

# =========================================================
# 2️⃣ RUNTIME STAGE
# =========================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Runtime deps for canvas (lighter than dev libs)
RUN apk add --no-cache \
  cairo \
  jpeg \
  pango \
  giflib \
  pixman

# Copy only package files
COPY package*.json ./

# Install *production-only* dependencies
RUN npm ci --omit=dev

# ✅ Copy built files from builder
COPY --from=builder /app/dist ./dist

# ✅ Ensure static assets are present
RUN mkdir -p ./dist/public

# Expose port
EXPOSE 5000

# Env setup
ENV NODE_ENV=production
ENV PORT=5000

# ✅ Start the app
CMD ["node", "dist/server/index.js"]
