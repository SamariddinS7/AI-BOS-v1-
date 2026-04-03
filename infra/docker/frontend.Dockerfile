# --- Stage 1: Build ---
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build for production
RUN npm run build

# --- Stage 2: Runtime (NGINX) ---
FROM nginx:alpine

# Create non-root user (nginx image already has `nginx` user)
# We will run as `nginx` user, but need to adjust permissions.

# Copy build artifacts
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom NGINX config
COPY infra/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Adjust permissions for non-root execution
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Expose port
EXPOSE 80

# Run NGINX
CMD ["nginx", "-g", "daemon off;"]
