FROM node:22-alpine AS builder_worker

WORKDIR /app

COPY package.json /app/

RUN npm install

COPY . .

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

COPY package.json /app/

RUN npm install --only=production

COPY --from=builder_worker /app/dist ./dist

ENV NODE_ENV=production
ENV UV_THREADPOOL_SIZE=8

EXPOSE 3000

CMD ["node", "--no-experimental-fetch", "--no-deprecation", "--optimize_for_size", "--max_old_space_size=512", "dist/server.js"]