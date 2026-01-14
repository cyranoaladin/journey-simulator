# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests separately to leverage Docker layer caching
COPY package*.json ./

# Install dependencies (cached unless package files change)
RUN npm ci

# Copy source code
COPY . .

# Inject API URL at build time
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build artifacts from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config as a template (envsubst at container start)
# nginx official entrypoint will render /etc/nginx/templates/*.template -> /etc/nginx/conf.d/*.conf
COPY nginx.conf /etc/nginx/templates/default.conf.template

RUN apk add --no-cache libcap \
    && addgroup -g 101 app \
    && adduser -S -G app -u 101 app \
    && setcap 'cap_net_bind_service=+ep' /usr/sbin/nginx \
    && chown -R app:app /usr/share/nginx/html /var/cache/nginx /var/run

USER 101

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
