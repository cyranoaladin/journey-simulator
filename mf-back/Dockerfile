# syntax=docker/dockerfile:1
FROM node:20-slim AS base

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

ARG INSTALL_DEV=false
RUN npm set fund false \
 && npm set audit false \
 && if [ "$INSTALL_DEV" = "true" ]; then npm ci; else npm ci --omit=dev; fi

COPY . .

COPY docker-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENV NODE_ENV=production \
    PORT=3000

EXPOSE 3000

ENTRYPOINT ["entrypoint.sh"]
CMD ["npm", "start"]
