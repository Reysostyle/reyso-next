# Runs the store with its admin panel. The production build reads the
# catalogue from the database, so it happens when the container starts
# (after migrations), not while building the image.
FROM node:22-bookworm-slim

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN chmod +x docker/start.sh

ENV NODE_ENV=production PORT=3000 MEDIA_DIR=/app/media
EXPOSE 3000
CMD ["docker/start.sh"]
