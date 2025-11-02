# --- Stage 1: Builder (Compiles the app) ---
# This stage builds your app and installs all dependencies
FROM node:20-alpine AS builder

# --- THIS IS THE FIX (Part 1) ---
# Declare build arguments for BOTH keys (secret and public)
ARG PAYSTACK_SECRET_KEY_ARG
ARG VITE_PAYSTACK_PUBLIC_KEY_ARG

WORKDIR /app

# Install native dependencies needed for 'canvas'
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

# Install all npm dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your source code
COPY . .

# --- THIS IS THE FIX (Part 2) ---
# Set ENV for the build script, making BOTH keys available
ENV PAYSTACK_SECRET_KEY=$PAYSTACK_SECRET_KEY_ARG
ENV VITE_PAYSTACK_PUBLIC_KEY=$VITE_PAYSTACK_PUBLIC_KEY_ARG

# Run the build script
# - 'vite build' will now find VITE_PAYSTACK_PUBLIC_KEY and embed it in the frontend
# - 'esbuild' will run (but our server/routes.ts file will ignore the build-time key)
RUN npm run build


# --- Stage 2: Runner (This is what Dokploy actually runs) ---
# This stage is a small, clean image for production
FROM node:20-alpine AS runner

WORKDIR /app

# Install only the runtime libraries needed for 'canvas'
RUN apk add --no-cache \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman

# Copy the build artifacts from Stage 1
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist

# Set the runtime environment
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Start the server
# Dokploy injects the real secrets here at runtime
CMD ["node", "dist/server/index.js"]
