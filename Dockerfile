# ---------- Build Stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install ALL build-time dependencies (like Python and C/C++ tools)
# These are necessary to compile native Node modules like 'canvas'.
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

# Copy dependency manifests and install ALL dependencies (including dev for building)
COPY package*.json ./
RUN npm install

# Copy the full project source code
COPY . .

# Build frontend + backend bundle (compiling TypeScript/bundling assets)
RUN npm run build

# ---------- Production Stage (The one that runs) ----------
# Use a lean base image for production
FROM node:20-alpine AS runner

WORKDIR /app

# Install only the runtime libraries required for compiled dependencies (like 'canvas')
RUN apk add --no-cache \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman

# 1. Copy the full, COMPILED node_modules and package.json from the builder stage.
# This avoids needing to install Python and recompile 'canvas' in this minimal image.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 2. Copy the compiled distribution files (your application code)
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Start your backend
# Dokploy will automatically inject your secret environment variables here.
CMD ["node", "dist/server/index.js"]
