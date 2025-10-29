# ---------- Build Stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install build-time dependencies for node-canvas (if used)
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

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build frontend + bundle backend (use your package.json build script)
RUN npm run build

# ---------- Production Stage ----------
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime libs for canvas
RUN apk add --no-cache \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman

# Copy package files and install production deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy the built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/package.json ./package.json

# Environment
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Start the compiled server entry (esbuild output to dist/server/index.js)
CMD ["node", "dist/server/index.js"]
