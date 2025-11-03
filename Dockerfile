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
RUN npm run build

# =========================================================
# 2️⃣ RUNTIME STAGE
# =========================================================
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache \
  cairo \
  jpeg \
  pango \
  giflib \
  pixman

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "dist/server/index.js"]
