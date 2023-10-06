FROM node:alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

FROM node:alpine AS production

# pass to ENV build process
ARG NODE_ENV = production
ENV NODE_ENV = ${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

# install only the needed dependencies (except devDependencies)

RUN yarn install --only=prod

COPY .. ./

COPY --from=development /usr/src/app/dist ./dist

CMD ['node',"dist/main"]
