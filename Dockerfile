# =========================================================
# 1️⃣ BUILD STAGE
# =========================================================
FROM node:20-alpine AS builder

WORKDIR /app

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

COPY package*.json ./
RUN npm ci

COPY . .

# ✅ Accept Paystack VITE key from Dokploy Build Args
ARG VITE_PAYSTACK_PUBLIC_KEY
ENV VITE_PAYSTACK_PUBLIC_KEY=$VITE_PAYSTACK_PUBLIC_KEY

# Build client + server
RUN npm run build

# =========================================================
# 2️⃣ RUNTIME STAGE
# =========================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime-only canvas dependencies
RUN apk add --no-cache \
  cairo \
  jpeg \
  pango \
  giflib \
  pixman

# Copy only package files
COPY package*.json ./

# Install production deps (no dev deps)
RUN npm ci --omit=dev

# ✅ Copy built output from builder
COPY --from=builder /app/dist ./dist

EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

# ✅ Start the server
CMD ["node", "dist/server/index.js"]
