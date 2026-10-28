# Installation manuelle, lot 6.1, GitHub Web

Base obligatoire : le dépôt doit déjà contenir le lot **5.3** validé. Ce correctif n'est pas conçu pour être appliqué sur un ancien lot.

1. Dans GitHub Web, enregistrer le commit actuel de `main` pour faciliter le retour arrière. Vous pouvez réaliser la modification dans une branche temporaire.
2. Télécharger et extraire `H5P_Converter_Lot6_1_Fichiers_Modifies.zip`.
3. À la **racine du dépôt**, remplacer `app.js` et `index.html`.
4. Dans le dossier `src/`, **ajouter** `player-assets.js` et `portable-package.js`.
5. Dans `tests/`, ajouter ou remplacer les tests concernés, et ajouter les JSON de `tests/fixtures/`.
6. Dans `docs/`, ajouter `LOT6_1.md` et `evidence/LOT6_1_TESTS.json`. Les fichiers de tests et de documentation sont recommandés pour la traçabilité, mais les quatre fichiers applicatifs précédents suffisent au fonctionnement.
7. Aucun fichier à supprimer. Vérifier les chemins dans le dépôt GitHub : tous sont **sensibles à la casse**.
8. Attendre la fin de la publication GitHub Pages, recharger la page sans cache, exécuter `CONTRE_RECETTE_LOT6_1.md`.

**Si la page reste vide**, contrôler en premier la présence et les noms exacts de `src/player-assets.js` et de `src/portable-package.js` : ces scripts doivent être chargés **avant** `app.js`.

**Si une anomalie majeure apparaît**, revenir au commit du lot 5.3. Ne pas modifier à la main le pont SCORM pour corriger une erreur de chargement des modules.
