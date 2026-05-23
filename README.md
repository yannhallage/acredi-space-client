# Acredi Space Client

Frontend React de la plateforme collaborative interne Acredi Space.

## Stack

- React + TypeScript + Vite
- Frappe UI React (`@rtcamp/frappe-ui-react`)
- Tailwind CSS v4
- Lucide React pour les icones
- React Router
- TanStack Query

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
  shared/     Composants, hooks et utilitaires reutilisables
```

## UI

L'identite visuelle reprend une interface type Frappe/CRM : sidebar claire, tables denses, controles compacts, boutons sobres, badges discrets et icones Lucide.

Le theme Frappe UI React est importe dans `src/index.css` :

```css
@import '@rtcamp/frappe-ui-react/theme';
@source "../node_modules/@rtcamp/frappe-ui-react/dist";
```
