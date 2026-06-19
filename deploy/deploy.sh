#!/usr/bin/env bash
# ============================================================================
# Deploiement statique (sans Docker) du frontend AcrediSpace.
# Build le projet et synchronise dist/ vers le webroot servi par Nginx.
#
# Usage :
#   ./deploy/deploy.sh                 # deploie en local (meme machine que Nginx)
#   ./deploy/deploy.sh user@vps        # deploie a distance via rsync/ssh
#
# Variables surchargables :
#   WEBROOT   chemin servi par Nginx (defaut: /var/www/acredispace/dist)
# ============================================================================
set -euo pipefail

REMOTE="${1:-}"
WEBROOT="${WEBROOT:-/var/www/acredispace/dist}"

# Racine du projet (dossier parent de ce script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

echo "==> Installation des dependances (npm ci)"
npm ci

echo "==> Build de production (npm run build)"
npm run build

if [ -z "$REMOTE" ]; then
  echo "==> Deploiement local vers $WEBROOT"
  sudo mkdir -p "$WEBROOT"
  sudo rsync -a --delete dist/ "$WEBROOT/"
  echo "==> Rechargement de Nginx"
  sudo nginx -t && sudo systemctl reload nginx
else
  echo "==> Deploiement distant vers $REMOTE:$WEBROOT"
  ssh "$REMOTE" "sudo mkdir -p '$WEBROOT'"
  rsync -a --delete --rsync-path="sudo rsync" dist/ "$REMOTE:$WEBROOT/"
  echo "==> Rechargement de Nginx sur $REMOTE"
  ssh "$REMOTE" "sudo nginx -t && sudo systemctl reload nginx"
fi

echo "==> Termine."
