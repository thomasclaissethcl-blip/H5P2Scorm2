# Installation manuelle sur GitHub Web : lot 8.4b

Version de départ obligatoire : lot 8.4a validé.

## Fichiers applicatifs à remplacer

- `app.js`
- `index.html`
- `src/html-singlefile-resources.js`
- `src/html-singlefile-player.js`

## Fichier applicatif à SUPPRIMER

- `src/html-singlefile-preflight.js` (ancien diagnostic non utilisé)

Dans GitHub Web, ouvrez le fichier `src/html-singlefile-preflight.js`, puis utilisez **Delete this file** / **Supprimer ce fichier** et validez le commit. Une simple extraction ZIP n'efface pas les fichiers présents dans GitHub.

## Tests et documentation

L'archive ciblée fournit tous les fichiers modifiés ou ajoutés, dans leurs chemins de dépôt. Pour conserver un banc de test cohérent, importez également ces changements, puis supprimez les cinq tests obsolètes listés dans `FICHIERS_A_SUPPRIMER.md`.

Les anciens documents de recettes dans `docs/` constituent un historique : ils peuvent mentionner les boutons supprimés, ce qui ne signifie pas qu'ils sont toujours présents dans l'interface courante.

## Contrôle de publication

1. Avant la mise à jour, sauvegardez votre version 8.4a.
2. Chargez les fichiers modifiés avec leurs chemins exacts.
3. Supprimez les fichiers listés.
4. Publiez sur GitHub Pages et actualisez la page (`Ctrl + F5`).
5. Vérifiez que **Générer le SCORM**, **Générer le HTML multifichier** et **HTML monofichier interactif (essai)** restent visibles et utilisables.
6. Vérifiez que les deux anciens boutons ont disparu.
7. Réessayez un H5P simple, la Game Map et, si possible, l'Interactive Book SST406.

Retour arrière : restaurer les quatre fichiers applicatifs précédents, puis rétablir `src/html-singlefile-preflight.js` depuis la sauvegarde 8.4a si vous souhaitez retrouver l'ancienne interface. Aucun paquet déjà généré n'est modifié.
