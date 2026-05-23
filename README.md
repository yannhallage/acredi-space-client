# Acredi Space Client

Frontend React de la plateforme collaborative interne Acredi Space.

## Stack

- React + TypeScript + Vite
- Frappe UI React (`@rtcamp/frappe-ui-react`)
- Tailwind CSS v4
- Lucide React pour les icones
- React Router
- TanStack Query
- Zustand
- React Hook Form + Zod
- STOMP WebSocket client

## Commandes

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Structure

```text
src/
  app/        Providers, router, layouts, configuration
  entities/   Types metier transverses
  features/   Modules fonctionnels par domaine
  services/   Clients API REST, temps reel, upload/download, Jitsi
  shared/     Composants, hooks et utilitaires reutilisables
```

## Modules scaffoldes

- Authentification et session
- Dashboard
- Fichiers, dossiers, versions et permissions
- Partage
- Chat, canaux et messages directs
- Reunions, calendrier, salle Jitsi et enregistrements
- Equipes
- Notifications et presence
- Profil et parametres
- Administration, utilisateurs, equipes, fichiers et audit

Le routing est lazy-loade par page pour garder un bundle initial raisonnable.

## UI

L'identite visuelle reprend une interface type Frappe/CRM : sidebar claire, tables denses, controles compacts, boutons sobres, badges discrets et icones Lucide.

Le theme Frappe UI React est importe dans `src/index.css` :

```css
@import '@rtcamp/frappe-ui-react/theme';
@source "../node_modules/@rtcamp/frappe-ui-react/dist";
```
