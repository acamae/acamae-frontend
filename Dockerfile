FROM node:22-alpine

# Install necessary dependencies for compilation
RUN apk add --no-cache curl g++ libc6-compat make python3

WORKDIR /app

# Copy package files first
COPY package*.json ./
COPY ./src /app/src
COPY .env.${NODE_ENV:-development} /app/.env.${NODE_ENV:-development}


# Install dependencies without running postinstall scripts
RUN npm install --include=optional --ignore-scripts \
  && npm cache clean --force \
  && npm install -g typescript ts-node lerna \
  && npm install --save-dev webpack-dev-server

# Copy the rest of the files
COPY . .

EXPOSE 3000

USER node
