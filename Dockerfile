# Dockerfile
FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci || npm i
COPY . .
RUN npx prisma generate
EXPOSE 3000
# o comando final vem do docker-compose.yml
