FROM node:22.19.0-alpine3.22

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g npm@latest pnpm@latest typescript@latest
RUN pnpm install

COPY . .

RUN pnpm run build

EXPOSE 3000

CMD ["node", "dist/src/main"]