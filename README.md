# Marées — Carnet de Pêche

Publie chaque nuit un fichier `marees.json` (pleines mers, basses mers, hauteurs et
coefficients pour quelques ports) que l'app **Carnet de Pêche** télécharge et met en cache
pour pré-remplir la boîte marée d'une session, y compris hors-ligne.

Dépôt volontairement séparé de l'app : il ne contient que des données publiques (ports,
horaires de marée). L'app elle-même, ses données et ses coordonnées de pêche restent privées,
sur les appareils des utilisateurs.

## Fonctionnement

`marees.mjs` interroge [api-maree.fr](https://api-maree.fr) pour les ports listés dans
`ports.json`, sur la fenêtre autorisée par l'API (J-30 à J+30), et écrit `site/marees.json`.
Le workflow GitHub Actions ([.github/workflows/marees.yml](.github/workflows/marees.yml))
l'exécute tous les jours à 4h17 UTC et publie le résultat sur GitHub Pages.

La clé API vit dans le secret `API_MAREE_KEY` du dépôt — jamais dans le code, jamais dans
l'app installée sur les téléphones.

## Ajouter un port

Ajouter son identifiant à `ports.json`. La liste des identifiants valides :
<https://api-maree.fr/sites>.

## Licence des données

Données de marée fournies par api-maree.fr sous licence CC BY, calculées à partir de
composantes harmoniques Ifremer / PREVIMER. Attribution incluse dans `marees.json` publié.
