# Installation manuelle GitHub Web : lot 8.4a

Base obligatoire : dépôt déjà mis à jour vers le correctif 8.3c.

## Application

1. Décompresser `H5P_Converter_8_4a_Fichiers_Modifies.zip`.
2. Dans le dépôt GitHub, **remplacer** `app.js` à la racine.
3. Dans `src/`, **remplacer** `html-singlefile-player.js`.
4. Ajouter si souhaité les tests et documents fournis dans `tests/` et `docs/`.
5. Conserver tous les autres fichiers, notamment `index.html`, `styles.css`, les modules SCORM, `src/html-multifile.js` et `src/html-singlefile-resources.js`.
6. Publier, actualiser avec `Ctrl + F5`, puis suivre la contre-recette.

Aucun fichier à supprimer. Si régression, restaurer uniquement les versions 8.3c de `app.js` et `src/html-singlefile-player.js`.

L'exemple `INTERACTIVE_BOOK_SST406_MONOFICHIER_ESSAI.html` est un **livrable de test**, pas un fichier à placer dans la racine de l'application.
