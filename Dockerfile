---------- Stage 1: Time to Build the App! ----------

FROM node:20-alpine AS builder

1. Define a Build Argument for the secret key

We need the secret key to build the app! Make sure your deploy system passes this in (ARG).

ARG PAYSTACK_SECRET_KEY_ARG

WORKDIR /app

Gotta install all the extra stuff (like Python/C++ headers) needed to compile libraries like 'canvas'.

RUN apk add --no-cache 

python3 

make 

g++ 

pkgconf 

cairo-dev 

jpeg-dev 

pango-dev 

giflib-dev 

pixman-dev

Grab the package files and install everything (all dependencies, even dev ones)!

COPY package*.json ./
RUN npm install

Copy the whole project source code now.

COPY . .

2. Set the environment variable for the build script

We set the secret key here so the build script can actually see it (ENV). It's essential!

ENV PAYSTACK_SECRET_KEY=$PAYSTACK_SECRET_KEY_ARG

Build the whole thing—frontend, backend, all compiled!

This is where our secret key gets embedded by esbuild.

RUN npm run build

---------- Stage 2: The Tiny Runner (This is what actually runs the website!) ----------

Use a lean base image for production

FROM node:20-alpine AS runner

WORKDIR /app

Only install the absolute necessary libraries needed to run the compiled code (like 'canvas').

RUN apk add --no-cache 

cairo 

jpeg 

pango 

giflib 

pixman

1. Grab the compiled dependencies and package info from the build stage.

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

2. Copy the final compiled app code (the 'dist' folder).

COPY --from=builder /app/dist ./dist/

Set environment variables for the runtime container (Dokploy will inject secrets here).

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

Go time! Start the production server.

CMD ["node", "dist/server/index.js"]
