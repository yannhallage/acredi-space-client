# ============================================================================
# Stage 1 : build de la SPA Vite/React
# ============================================================================
FROM node:20-alpine AS build

WORKDIR /app

# Installer les dependances (cache optimise)
COPY package.json package-lock.json ./
RUN npm ci

# Copier le reste du code et builder
COPY . .
# .env.production fournit VITE_API_BASE_URL=/api et VITE_WS_URL=/ws (embarques au build)
RUN npm run build

# ============================================================================
# Stage 2 : image finale Nginx servant le build statique
# ============================================================================
FROM nginx:alpine AS runtime

# Conf Nginx interne au conteneur (SPA fallback)
COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf

# Build statique
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
