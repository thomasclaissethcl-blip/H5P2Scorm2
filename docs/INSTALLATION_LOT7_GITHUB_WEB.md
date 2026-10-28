# Installer le lot 7 dans GitHub Web

**Base requise :** lot 6.1 dont la recette est acceptée. Sauvegarder l'état actuel du dépôt avant toute mise à jour.

## Installer les fichiers applicatifs

Dans le dépôt GitHub, à l'aide de l'interface web, mettre à jour **exactement** :

1. `app.js` : remplacer le contenu du fichier existant ;
2. `index.html` : remplacer le contenu du fichier existant ;
3. `src/html-multifile.js` : créer ce nouveau fichier avec son contenu.

Ces trois changements sont obligatoires et doivent être publiés **ensemble**. Si `src/html-multifile.js` manque, les deux fonctions de génération seront bloquées dès l'initialisation.

Les fichiers `README.md`, `README_DEV.md`, `CHANGELOG.md`, `docs/` et `tests/` fournis dans le ZIP ciblé sont de la documentation ou des contrôles à synchroniser si vous souhaitez conserver le projet et sa recette complets.

Ne rien supprimer. Ne pas remplacer `src/player-assets.js`, `src/portable-package.js`, le moteur SCORM, la visionneuse ou le CSS : ils sont conservés tels que validés au lot 6.1.

## Premier essai

Après publication GitHub Pages, rafraîchir la page pour charger `src/html-multifile.js` et `app.js`. Vérifier la présence des boutons **Générer le HTML multifichier** et **Générer le SCORM**. Importer un H5P valide, générer le ZIP HTML et suivre la checklist `docs/CONTRE_RECETTE_LOT7.md`.

### Publier un mini-site HTML

- Extraire **tous** les fichiers du ZIP exporté, sans déplacer `index.html` séparément.
- Copier l'ensemble sur un hébergement statique HTTP(S), y compris dans un sous-répertoire.
- Ouvrir `index.html` sur le site distant et tester les interactions H5P.
- Moodle : créer une ressource **Fichier**, y importer le ZIP, le décompresser et désigner `index.html` comme fichier principal. Le résultat dépend des autorisations JavaScript et iframe de Moodle.

## Retour arrière

Restaurer `app.js` et `index.html` du lot 6.1, puis retirer `src/html-multifile.js` si besoin. Le dépôt retrouve alors l'interface et les fonctions antérieures.
