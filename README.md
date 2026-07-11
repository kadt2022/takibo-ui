# TAKIBO UI

**TAKIBO Administration Console** — Identity, Access and Context.

TAKIBO UI est l'interface web officielle d'administration de la plateforme TAKIBO.
Ce dépôt contient le socle frontend et la page de connexion (récit TAKIBO UI 01).

> Une identité souveraine. Un accès situé. Une confiance vérifiable.

## Stack

| Technologie     | Responsabilité                        |
| --------------- | ------------------------------------- |
| React 19        | Construction des pages et composants  |
| TypeScript      | Typage strict des modèles et contrats |
| Vite            | Développement et build                |
| React Router    | Navigation entre les pages            |
| TanStack Query  | Gestion des données serveur           |
| React Hook Form | Gestion des formulaires               |
| Zod             | Validation des données frontend       |
| Tailwind CSS 4  | Langage visuel piloté par tokens      |
| Radix UI        | Primitives accessibles                |
| Vitest + RTL    | Tests unitaires et de composants      |
| Playwright      | Tests fonctionnels dans le navigateur |

## Démarrage

```bash
npm install
npm run dev
```

L'application démarre sur `http://localhost:5173` et redirige vers `/login`.

## Commandes

```bash
npm run dev          # serveur de développement
npm run lint         # ESLint
npm run format       # Prettier (écriture)
npm run test         # tests unitaires Vitest
npm run test:e2e     # tests fonctionnels Playwright (npx playwright install chromium au premier lancement)
npm run build        # vérification TypeScript stricte + build de production
npm run preview      # prévisualisation du build
```

## Architecture

```text
src/
├── app/              # démarrage, routeur, providers globaux
├── design-system/    # composants visuels génériques TAKIBO (sans logique métier)
├── features/         # capacités fonctionnelles par domaine (authentication…)
├── layouts/          # structures visuelles de pages
├── shared/           # éléments techniques partagés
└── styles/           # tokens de design et styles globaux
```

Les couleurs, espacements, rayons, ombres et typographies sont définis comme
tokens dans [src/styles/tokens.css](src/styles/tokens.css) : aucun composant
n'introduit de valeur brute.

## Sécurité

Le frontend n'est jamais la frontière finale de sécurité.

- Aucun secret dans le dépôt ni dans les variables `VITE_*` (embarquées dans le bundle).
- Le mot de passe n'apparaît jamais dans les logs, l'URL, le stockage navigateur ou un message d'erreur.
- Les erreurs affichées ne révèlent ni l'existence d'un compte ni un détail technique du backend.
- Architecture cible : le navigateur ne conserve aucun token ; la session web sera portée
  par un cookie sécurisé émis par le BFF Spring Boot (récit TAKIBO UI 02), qui dialoguera
  en OAuth2/OIDC avec le TAKIBO Authorization Server.

## Périmètre du récit 01

La page de connexion est complète (validation, accessibilité, responsive, états de
chargement) mais n'est **pas encore connectée** au service d'authentification : toute
soumission l'indique honnêtement et aucune session n'est créée. La connexion réelle,
le MFA, la fédération et la récupération du mot de passe arrivent dans les récits suivants.
