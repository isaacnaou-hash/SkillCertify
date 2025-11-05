# =========================================================
# 1️⃣ BUILD STAGE
# =========================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies required to build canvas
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

# ✅ Pass public key from Dokploy build args to Vite
ARG VITE_PAYSTACK_PUBLIC_KEY
ENV VITE_PAYSTACK_PUBLIC_KEY=$VITE_PAYSTACK_PUBLIC_KEY

RUN npm run build

# =========================================================
# 2️⃣ RUNTIME STAGE
# =========================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Runtime-only dependencies for canvas
RUN apk add --no-cache \
  cairo \
  jpeg \
  pango \
  giflib \
  pixman \
  python3 \
  make \
  g++ \
  pkgconf

# ✅ Copy ONLY package.json files
COPY package*.json ./

# ✅ Copy pre-built node_modules from builder (NO REBUILDING)
COPY --from=builder /app/node_modules ./node_modules

# ✅ Copy built output
COPY --from=builder /app/dist ./dist

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "dist/server/index.js"]
