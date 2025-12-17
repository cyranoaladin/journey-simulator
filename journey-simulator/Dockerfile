# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy dependency manifests separately to leverage Docker layer caching
COPY package*.json ./

# Install dependencies (cached unless package files change)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build artifacts from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config as a template (envsubst at container start)
# nginx official entrypoint will render /etc/nginx/templates/*.template -> /etc/nginx/conf.d/*.conf
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
