# --- Stage 1: Builder (Compiles the app and embeds the secret) ---
FROM node:20-alpine AS builder

# Argument for the secret key (passed from your deploy system)
ARG PAYSTACK_SECRET_KEY_ARG

WORKDIR /app

# Install native dependencies needed for packages like 'canvas'
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

# Grab package files and install all dependencies
COPY package*.json ./
RUN npm install

# Copy all source code
COPY . .

# Set the environment key for the build script to access
ENV PAYSTACK_SECRET_KEY=$PAYSTACK_SECRET_KEY_ARG

# Build everything (frontend, backend, embedding the secret key)
RUN npm run build


# --- Stage 2: Runner (Minimal Image for Production) ---
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime libraries for native modules
RUN apk add --no-cache \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman

# Copy necessary files from the build stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy the compiled application code
COPY --from=builder /app/dist ./dist

# Set runtime environment variables
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Go time! Start the server
CMD ["node", "dist/server/index.js"]
