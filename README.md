# space-prod-client

Un client front-end pour l'équipe Acredi (space-prod-client).

## Description

Application front-end écrite en TypeScript pour l'interface utilisateur du projet "space". Ce dépôt contient le code source, les styles et les scripts de build pour produire l'app en environnement de production.

## Prérequis

- Node.js >= 18
- npm ou yarn

## Installation

1. Clonez le dépôt et installez les dépendances:

```bash
git clone git@github.com:Acredi-Dev-Team/space-prod-client.git
cd space-prod-client
npm install
# ou
# yarn install
```

2. Copiez le fichier d'exemple d'environnement et modifiez-le selon vos variables:

```bash
cp .env.example .env
# éditez .env
```

## Scripts utiles

- npm run dev — démarre le serveur de dev (hot-reload)
- npm run build — construit les assets pour la production
- npm run start — lance l'application en production
- npm run lint — exécute les linter
- npm run test — lance les tests (si présents)

(Vérifiez le package.json pour la liste exacte des scripts.)

## Structure du dépôt

- src/ — code TypeScript de l'application
- public/ — assets statiques
- styles/ — fichiers CSS
- build/ ou dist/ — sortie de build

## Déploiement

Le projet utilise la branche `deploy` comme branche de déploiement par défaut. Adaptez votre pipeline CI/CD (GitHub Actions, autre) pour déclencher les builds et déploiements depuis cette branche.

## Contribuer

1. Forkez le dépôt
2. Créez une branche feature/bugfix: `feature/ma-fonctionnalite`
3. Faites une Pull Request vers `deploy` ou la branche indiquée par le mainteneur

Respectez les conventions de style et ajoutez des tests si possible.

## Licence

Ce projet est distribué sous la licence MIT. Voir le fichier LICENSE pour le texte complet.

---

Si vous voulez que j'ajuste ce README (ajout d'un badge CI, sections plus détaillées, ou traduction en anglais), dites-moi ce que vous souhaitez modifier.