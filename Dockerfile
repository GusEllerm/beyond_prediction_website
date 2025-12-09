# Multi-stage Dockerfile for production build

# Stage 1: Build stage
FROM node:22-alpine AS build

# Update packages to fix vulnerabilities and clean cache in single layer
RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files for dependency installation (optimize layer caching)
COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Runtime stage
FROM nginx:1.27-alpine

# Update packages to fix vulnerabilities, install wget for healthcheck, and clean cache
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache wget && \
    rm -rf /var/cache/apk/*

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
