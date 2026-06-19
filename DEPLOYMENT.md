# Deploiement sur VPS (Nginx + Docker)

Ce guide decrit le deploiement du frontend AcrediSpace (SPA Vite/React) sur un VPS.

## Architecture

```
Navigateur
   |  HTTPS 443
   v
Nginx systeme (VPS)  ── reverse-proxy frontal + TLS Let's Encrypt
   ├── /         -> conteneur Docker du front      (127.0.0.1:8081)
   ├── /api      -> backend                        (127.0.0.1:8080)
   └── /ws       -> backend (WebSocket STOMP/SockJS)(127.0.0.1:8080)
```

Le front utilise des chemins relatifs (`/api`, `/ws`) configures dans `.env.production`,
donc front et back partagent la meme origine : aucun probleme de CORS.

## Prerequis sur le VPS

- Docker installe et le service actif
- Nginx deja installe (reverse-proxy frontal)
- Certbot installe (`sudo apt install certbot python3-certbot-nginx`)
- Un nom de domaine pointant (enregistrement A/AAAA) vers l'IP du VPS

> Remplace partout `mondomaine.com` par ton domaine, `<dockerhub-user>` par ton
> identifiant Docker Hub, et `8080` par le port reel du backend.

## 1. Configurer le reverse-proxy Nginx systeme

Copier la conf fournie et l'activer :

```bash
sudo cp deploy/nginx/acredispace.conf /etc/nginx/sites-available/acredispace.conf
sudo ln -s /etc/nginx/sites-available/acredispace.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Editer `/etc/nginx/sites-available/acredispace.conf` pour renseigner ton domaine
et le port du backend si besoin.

## 2. Activer HTTPS (Let's Encrypt)

```bash
sudo certbot --nginx -d mondomaine.com -d www.mondomaine.com
```

Certbot ajoute automatiquement le bloc `listen 443 ssl` et la redirection 80 -> 443.
Le renouvellement est gere par un timer systemd (`certbot.timer`).

## 3. Deployer le frontend (Docker)

### Option A : via le pipeline GitHub Actions (recommande)

Un push sur `main` declenche `.github/workflows/deploy.yml` qui :

1. build l'image Docker du front,
2. la pousse sur Docker Hub (`<dockerhub-user>/acredispace-front:latest`),
3. se connecte au VPS en SSH, `pull` la nouvelle image et relance le conteneur.

Secrets a configurer dans le repo GitHub (Settings > Secrets and variables > Actions) :

| Secret               | Description                                              |
| -------------------- | -------------------------------------------------------- |
| `DOCKERHUB_USERNAME` | Identifiant Docker Hub                                   |
| `DOCKERHUB_TOKEN`    | Access token Docker Hub (Account Settings > Security)    |
| `VPS_HOST`           | IP ou domaine du VPS                                     |
| `VPS_USER`           | Utilisateur SSH                                          |
| `VPS_SSH_KEY`        | Cle privee SSH (format PEM) autorisee sur le VPS         |
| `VPS_SSH_PORT`       | (optionnel) port SSH, defaut 22                          |

### Option B : build et run manuels sur le VPS

```bash
# Sur la machine de dev : build + push
docker build -t <dockerhub-user>/acredispace-front:latest .
docker push <dockerhub-user>/acredispace-front:latest

# Sur le VPS : pull + run
docker pull <dockerhub-user>/acredispace-front:latest
docker stop acredispace-front 2>/dev/null || true
docker rm acredispace-front 2>/dev/null || true
docker run -d --name acredispace-front --restart unless-stopped \
  -p 127.0.0.1:8081:80 \
  <dockerhub-user>/acredispace-front:latest
```

Le conteneur ecoute uniquement sur `127.0.0.1:8081` (non expose publiquement) ;
c'est le Nginx systeme qui l'expose en HTTPS.

## 4. Deploiement sans Docker (alternative)

Si tu preferes servir le build statique directement par le Nginx systeme :

1. Dans `deploy/nginx/acredispace.conf`, commenter l'Option A et decommenter l'Option B.
2. Builder et synchroniser :

```bash
./deploy/deploy.sh mondomaine.com
```

Le script build le projet et copie `dist/` vers `/var/www/acredispace/dist`,
puis recharge Nginx.

## Verification

- `https://mondomaine.com` charge l'app.
- Le rafraichissement sur une route profonde (ex: `/dashboard`) ne renvoie pas de 404 (fallback SPA OK).
- Les appels `/api/...` repondent et le temps reel (`/ws`) se connecte (onglet Reseau > WS).

## Mise a jour

- Avec GitHub Actions : pousser sur `main`.
- Manuellement : refaire l'etape 3 Option B (`pull` + `run`), ou `./deploy/deploy.sh` en mode statique.
