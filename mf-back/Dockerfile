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

RUN groupadd -g 101 nodeapp && useradd -u 101 -g nodeapp -m nodeapp
USER nodeapp

EXPOSE 3000

ENTRYPOINT ["entrypoint.sh"]
CMD ["npm", "start"]
