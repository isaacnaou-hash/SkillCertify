# ---------- Build Stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install build-time dependencies for C/C++ packages (like node-canvas/bcrypt)
# These are necessary to compile dependencies like node-canvas or bcryptjs
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

# Copy the full project
COPY . .

# Build frontend + backend bundle (compiling TypeScript/bundling assets)
RUN npm run build

# ---------- Production Stage (The one that runs) ----------
# Use a lean base image for production
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies for packages like node-canvas/bcrypt (required shared libraries)
# These are the dynamic libraries the compiled code needs to run.
RUN apk add --no-cache \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman

# 1. Copy package.json to the runtime image
# This is crucial for correctly installing production dependencies later
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# 2. Install only PRODUCTION dependencies in the final image
# This rebuilds the node_modules with maximum security and minimum size,
# ensuring the Node runtime environment is pristine and correct.
RUN npm install --only=production

# 3. Copy the compiled distribution files
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Start your backend
# Dokploy will automatically inject the PAYSTACK_SECRET_KEY variable here.
CMD ["node", "dist/server/index.js"]
