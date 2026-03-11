# syntax=docker/dockerfile:1
FROM node:20-slim AS base

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
COPY prisma ./prisma

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
RUN mkdir -p /home/nodeapp/.npm && chown -R nodeapp:nodeapp /home/nodeapp/.npm
RUN chown -R nodeapp:nodeapp /usr/src/app
USER nodeapp

EXPOSE 3000

ENTRYPOINT ["entrypoint.sh"]
CMD ["npm", "start"]
