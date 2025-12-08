# Multi-stage Dockerfile for production build

# Stage 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Runtime stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

