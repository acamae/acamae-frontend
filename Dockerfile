FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Set environment variables
ENV NODE_ENV=$NODE_ENV
ENV PORT=$PORT

# Copy all project files to the container
COPY package*.json ./

# Install all project dependencies
RUN npm install \
  && npm cache clean --force \
  && npm install -g typescript ts-node \
  && npm install --save-dev webpack-dev-server

# Copy the rest of your application files
COPY . .

# Expose the port your app runs on
EXPOSE $PORT

# Set the user to node
USER node

# Define the command to run your app
CMD ["npm", "start"]
