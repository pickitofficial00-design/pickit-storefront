FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y curl ca-certificates python3 make g++ && rm -rf /var/lib/apt/lists/*
RUN curl -L https://github.com/meilisearch/meilisearch/releases/latest/download/meilisearch-linux-amd64 -o /usr/local/bin/meilisearch && chmod +x /usr/local/bin/meilisearch

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

COPY server ./server
COPY indexer ./indexer
COPY public ./public
COPY docker-entrypoint.sh ./docker-entrypoint.sh

EXPOSE 4000
CMD ["./docker-entrypoint.sh"]
