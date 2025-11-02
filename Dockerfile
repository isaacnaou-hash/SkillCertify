# --- Stage 1: Builder (Compiles the app) ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install native dependencies needed for compilation
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

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build everything (ESBuild will read secrets at runtime if not defined here)
RUN npm run build


# --- Stage 2: Runner (Injects Secrets at Runtime) ---
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime libraries
RUN apk add --no-cache \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman

# Copy necessary files from the build stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist

# Set runtime environment variables
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Start the server. Secrets are injected by Dokploy here.
CMD ["node", "dist/server/index.js"]
