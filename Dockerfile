FROM node:22-alpine

RUN apk add --no-cache python3 make g++ libc6-compat

WORKDIR /app

COPY package*.json ./

RUN npm install --include=optional \
  && npm cache clean --force \
  && npm install -g typescript ts-node \
  && npm install --save-dev webpack-dev-server \
  && [ -d node_modules/sass-embedded-linux-musl-x64 ] || npm install --save-dev sass-embedded-linux-musl-x64

COPY . .

EXPOSE 3000

USER node

CMD ["npm", "start"]