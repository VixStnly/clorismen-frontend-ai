# Clorismen Landing Page — static site di Nginx (untuk Coolify)
FROM nginx:1.27-alpine

# Konfigurasi Nginx (gzip, cache aset, security headers)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# File website
COPY index.html /usr/share/nginx/html/index.html
COPY images/ /usr/share/nginx/html/images/
COPY logo.png /usr/share/nginx/html/logo.png

EXPOSE 80

# Healthcheck dipakai Coolify untuk menandai container "healthy"
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/healthz || exit 1
