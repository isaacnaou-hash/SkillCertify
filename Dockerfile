# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for canvas package
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

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application (builds Vite frontend and bundles backend)
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install runtime and build dependencies for canvas package
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    pkgconf \
    cairo \
    cairo-dev \
    jpeg \
    jpeg-dev \
    pango \
    pango-dev \
    giflib \
    giflib-dev \
    pixman \
    pixman-dev

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

# Expose port (Coolify will map this)
EXPOSE 5000

# Set NODE_ENV
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
CMD ["node", "dist/index.js"]
