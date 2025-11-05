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

# ✅ Pass VITE_ENV from Dokploy → Vite builder
ARG VITE_PAYSTACK_PUBLIC_KEY
ENV VITE_PAYSTACK_PUBLIC_KEY=$VITE_PAYSTACK_PUBLIC_KEY

RUN npm run build
