
FROM node:20-bookworm

RUN npm i -g pnpm

# Create app directory
WORKDIR /app

COPY . .

RUN pnpm install

RUN npx -y playwright@1.50.1 install --with-deps

RUN npm run build

EXPOSE 5510
CMD [ "npm", "run", "start" ]