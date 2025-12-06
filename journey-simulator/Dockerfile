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

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
