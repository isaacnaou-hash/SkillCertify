# --- Stage 1: Builder (Compiles the app) ---
# This stage builds your app and installs all dependencies
FROM node:20-alpine AS builder

# --- FIX: Declare build argument for the PUBLIC key ONLY ---
# The secret key should NEVER be in this stage.
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

# Install all npm dependencies (including devDependencies)
COPY package*.json ./
RUN npm install

# Copy the rest of your source code
COPY . .

# --- FIX: Set ENV for the build script, making the PUBLIC key available ---
ENV VITE_PAYSTACK_PUBLIC_KEY=$VITE_PAYSTACK_PUBLIC_KEY_ARG

# Run the build script
# - 'vite build' will embed the VITE_PAYSTACK_PUBLIC_KEY in the frontend
# - 'esbuild' will compile the server
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

# Copy package files
COPY --from=builder /app/package*.json ./

# --- FIX (Optimization): Install ONLY production dependencies ---
# This creates a smaller, more secure image.
RUN npm install --production

# Copy the compiled application code from Stage 1
COPY --from=builder /app/dist ./dist

# Set the runtime environment
ENV NODE_ENV=production
ENV PORT=5000

#
# ❗️❗️ THE CRITICAL FIX ❗️❗️
#
# You MUST declare the runtime environment variables here.
# Dokploy will see these and inject your secrets.
# Without this, process.env.PAYSTACK_SECRET_KEY will be UNDEFINED.
#
ENV PAYSTACK_SECRET_KEY="DOKPLOY_WILL_REPLACE_THIS_SECRET"
ENV VITE_PAYSTACK_PUBLIC_KEY="DOKPLOY_WILL_REPLACE_THIS_PUBLIC_KEY"
# Add any other secrets your server needs (e.g., DATABASE_URL)
# ENV DATABASE_URL="DOKPLOY_WILL_REPLACE_THIS_DB_URL"


EXPOSE 5000

# Start the server
CMD ["node", "dist/server/index.js"]
