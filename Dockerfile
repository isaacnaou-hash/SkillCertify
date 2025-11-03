# --- Stage 1: Builder (Compiles the app) ---
# This stage builds your app and installs all dependencies
FROM node:20-alpine AS builder

# We NO LONGER need the VITE_PAYSTACK_PUBLIC_KEY_ARG here

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

# Install ALL npm dependencies (dev + prod)
COPY package*.json ./
RUN npm install

# Copy the rest of your source code
COPY . .

# We NO LONGER need to set the ENV for the build script

# Run the build script
RUN npm run build


# --- Stage 2: Runner (This is what Dokploy actually runs) ---
# This stage is a small, clean image for production
FROM node:20-alpine AS runner

WORKDIR /app

# Install only the RUNTIME libraries needed for 'canvas'
RUN apk add --no-cache \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman

# Copy package files (for reference)
COPY --from=builder /app/package*.json ./

# COPY the already-built node_modules from the builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy the compiled application code from Stage 1
COPY --from=builder /app/dist ./dist

# Set the runtime environment
ENV NODE_ENV=production
ENV PORT=5000

#
# ❗️ IMPORTANT ❗️
# We still declare BOTH keys here for your SERVER to use.
# The server will use the SECRET key for payments.
# The server will use the PUBLIC key for the new config endpoint.
#
ENV PAYSTACK_SECRET_KEY="DOKPLOY_WILL_REPLACE_THIS_SECRET"
ENV VITE_PAYSTACK_PUBLIC_KEY="DOKPLOY_WILL_REPLACE_THIS_PUBLIC_KEY"

EXPOSE 5000

# Start the server
CMD ["node", "dist/server/index.js"]
