FROM node:20-alpine AS base

RUN apk add --no-cache python3 make g++ libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm i

COPY . .

RUN mkdir -p /app/data

RUN npm run build

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production
ENV DATABASE_PATH=./data/calculator.db

CMD ["npm", "start"]
