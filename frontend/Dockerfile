# Multi-stage build for the React frontend served by nginx
# Stage 1: Build the static assets
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .

# Build-time API configuration (override with --build-arg)
ARG VITE_API_URL=http://localhost:5000
ARG VITE_API_BASE_PATH=/api/v1
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_BASE_PATH=$VITE_API_BASE_PATH

RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:1.27-alpine

# SPA-aware nginx configuration (history fallback + gzip + caching)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the compiled assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --spider -q http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
