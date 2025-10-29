# ---------- Build Stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install build-time dependencies for node-canvas
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

# Copy dependency manifests and install dependencies
COPY package*.json ./
RUN npm install

# Copy the full project
COPY . .

# Build frontend + backend bundle
RUN npm run build

# ---------- Production Stage ----------
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies for node-canvas
RUN apk add --no-cache \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman

# Copy only the necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Start your backend
CMD ["node", "dist/server/index.js"]

