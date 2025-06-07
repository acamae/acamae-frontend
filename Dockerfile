FROM node:22-alpine

# Instalamos dependencias necesarias para la compilación
RUN apk add --no-cache python3 make g++ libc6-compat

WORKDIR /app

COPY package*.json ./

# Instalamos dependencias
RUN npm install --include=optional \
  && npm cache clean --force \
  && npm install -g typescript ts-node \
  && npm install --save-dev webpack-dev-server

COPY . .

EXPOSE 3000

USER node

CMD ["npm", "start"]