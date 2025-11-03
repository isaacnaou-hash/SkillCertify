# --- Stage 1: Builder (Compiles the app) ---
FROM node:20-alpine AS builder

#
# ❗️ THIS IS THE FIX ❗️
# The ARG name now EXACTLY matches your Dokploy Environment Variable name.
#
ARG VITE_PAYSTACK_PUBLIC_KEY

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

#
# ❗️ THIS IS THE OTHER FIX ❗️
# Pass the variable (now with the correct name) to the build script.
#
ENV VITE_PAYSTACK_PUBLIC_KEY=$VITE_PAYSTACK_PUBLIC_KEY

# Run the build script
RUN npm run build


# --- Stage 2: Runner (This is what Dokploy actually runs) ---
FROM node:20-alpine AS runner

WORKDIR /app

# Install only the RUNTIME libraries needed for 'canvas'
RUN apk add --no-cache \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman

# Copy package files
COPY --from=builder /app/package*.json ./

# Copy the already-built node_modules from the builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy the compiled application code from Stage 1
COPY --from=builder /app/dist ./dist

# Set the runtime environment
ENV NODE_ENV=production
ENV PORT=5000

# Declare the runtime environment variables for Dokploy
ENV PAYSTACK_SECRET_KEY="DOKPLOY_WILL_REPLACE_THIS_SECRET"
ENV VITE_PAYSTACK_PUBLIC_KEY="DOKPLOY_WILL_REPLACE_THIS_PUBLIC_KEY"

EXPOSE 5000

# Start the server
CMD ["node", "dist/server/index.js"]
