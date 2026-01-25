FROM node:24

WORKDIR /app

COPY package*.json ./
RUN npm install

# For development, source files will be mounted as volumes
# No need to copy or compile at build time

EXPOSE 3000

# Default command (can be overridden in docker-compose.yml)
CMD ["npx", "nodemon", "server.ts"]

