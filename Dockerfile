FROM node:18-alpine

WORKDIR /src/app

ENV NODE_ENV production

COPY package*.json ./

RUN npm ci

COPY  . .

RUN npm run build

CMD ["node", "dist/main.js"]

EXPOSE 8080