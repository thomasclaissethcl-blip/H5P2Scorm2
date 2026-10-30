# Installation du correctif 8.3c via GitHub Web

Pré-requis : version 8.3b déjà installée.

1. Télécharger l'archive de fichiers modifiés 8.3c et la décompresser.
2. Dans le dépôt GitHub, remplacer **uniquement** `src/html-singlefile-player.js` pour la partie applicative.
3. Ajouter éventuellement `tests/html-singlefile-youtube83c.mjs` et remplacer `tests/run_all.py` pour conserver le test automatisé supplémentaire.
4. Ajouter éventuellement `docs/LOT8_3C_YOUTUBE_REFERRER.md`.
5. Publier, puis rafraîchir le convertisseur (`Ctrl + F5`).
6. Charger `3385280591.h5p` et générer « HTML monofichier interactif (essai) ».
7. Comparer l'ouverture du fichier sur disque avec la publication de ce même fichier sur un hébergement HTTPS.

**Aucune suppression.** Aucun changement dans `app.js`, `index.html`, `styles.css`, la génération SCORM ou HTML multifichier.

**Retour arrière :** restaurer uniquement `src/html-singlefile-player.js` depuis le lot 8.3b.
