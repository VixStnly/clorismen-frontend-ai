# Clorismen Landing Page (React + Vite) + BFF PHP untuk checkout Midtrans
# Tahap 1: build React. Tahap 2: Apache + PHP (bff.php menandatangani request ke ERP).
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

FROM php:8.4-apache
RUN a2enmod rewrite headers

WORKDIR /var/www/html
COPY --from=build /app/dist ./dist
COPY server ./server
COPY docker/apache.conf /etc/apache2/conf-available/clorismen.conf
RUN a2enconf clorismen \
 && sed -ri -e 's!/var/www/html!/var/www/html/dist!g' /etc/apache2/sites-available/000-default.conf \
 && mkdir -p server/cache && chown -R www-data:www-data server/cache dist

EXPOSE 80

# Healthcheck dipakai Coolify untuk menandai container "healthy"
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -fsS http://127.0.0.1/healthz >/dev/null || exit 1
