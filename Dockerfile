FROM node:20-bookworm as base

RUN npx -y playwright@1.50.1 install --with-deps

FROM node:20-bookworm AS builder
RUN apk add --no-cache libc6-compat
RUN npm i -g pnpm@8.2.0

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
RUN pnpm install

COPY . .
RUN npm run build

FROM base
RUN apk add --no-cache libc6-compat
RUN npm i -g pnpm@8.2.0
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist


EXPOSE 4000
CMD [ "npm", "run", "start" ]