# CROUS Réseau - Application de Gestion du Réseau

## Description

Application web moderne pour la gestion et le suivi du réseau CROUS, incluant la gestion des bâtiments, commutateurs, panneaux de brassage et points d'accès WiFi.

## Fonctionnalités

- **Tableau de bord** : Vue d'ensemble avec statistiques du réseau
- **Gestion des bâtiments** : Visualisation des équipements par bâtiment
- **Commutateurs** : Suivi des switches et leurs configurations
- **Panneaux de brassage** : Gestion des PDB et connexions
- **Points d'accès** : Suivi des AP WiFi et leur état
- **Rapports d'interventions** : Gestion des interventions techniques

## Technologies utilisées

- React 18
- Tailwind CSS
- Lucide React (icônes)
- Vite (build tool)

## Installation

1. **Cloner le projet** :
```bash
git clone [URL_DU_REPO]
cd crous-reseau-app
```

2. **Installer les dépendances** :
```bash
npm install
```

3. **Lancer l'application en mode développement** :
```bash
npm run dev
```

L'application sera accessible à l'adresse : `http://localhost:3000`

## Scripts disponibles

- `npm run dev` : Lance le serveur de développement
- `npm run build` : Construit l'application pour la production
- `npm run preview` : Prévisualise la version de production

## Structure du projet

```
crous-reseau-app/
├── src/
│   ├── App.jsx          # Composant principal
│   ├── main.jsx         # Point d'entrée
│   └── index.css        # Styles Tailwind CSS
├── index.html           # Page HTML principale
├── package.json         # Dépendances et scripts
├── vite.config.js       # Configuration Vite
├── tailwind.config.js   # Configuration Tailwind
└── postcss.config.js    # Configuration PostCSS
```

## Architecture des données

L'application génère automatiquement des données de démonstration pour :

- **7 bâtiments** avec une nomenclature standardisée
- **14 commutateurs** (2 par bâtiment)
- **14 panneaux de brassage** (2 par bâtiment)
- **168 points d'accès** (24 par bâtiment, 6 par niveau)

## Interface utilisateur

- **Design responsive** : S'adapte aux écrans mobiles et desktop
- **Mode sombre** : Support du thème sombre
- **Navigation intuitive** : Menu latéral avec icônes
- **Cartes interactives** : Affichage des informations en temps réel

## Développement

### Ajout de nouvelles fonctionnalités

1. Créer un nouveau composant dans `src/App.jsx`
2. Ajouter l'élément de navigation dans le composant `Layout`
3. Implémenter la logique dans le composant `App`

### Personnalisation des styles

- Utiliser les classes Tailwind CSS existantes
- Ajouter des styles personnalisés dans `src/index.css`
- Modifier `tailwind.config.js` pour étendre le thème

## Déploiement

### Build de production

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`.

### Déploiement sur serveur web

1. Copier le contenu du dossier `dist/` sur votre serveur web
2. Configurer le serveur pour servir les fichiers statiques
3. Configurer la réécriture d'URL pour le routage SPA

## Support

Pour toute question ou problème technique, contactez l'équipe de développement CROUS.

## Licence

MIT License - Voir le fichier LICENSE pour plus de détails.

