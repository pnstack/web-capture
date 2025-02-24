FROM node:20-bookworm AS base

RUN npx -y playwright@1.50.1 install --with-deps

FROM node:20-bookworm AS builder
RUN npm i -g pnpm

# Create app directory
WORKDIR /app

COPY package*.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .
RUN npm run build

FROM base
RUN npm i -g pnpm
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist


EXPOSE 5510
CMD [ "npm", "run", "start" ]