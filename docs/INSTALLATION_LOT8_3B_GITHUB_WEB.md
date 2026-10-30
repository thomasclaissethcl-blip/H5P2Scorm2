# Installation GitHub Web : correctif 8.3b

**Base exigée :** version 8.3a du convertisseur, après application des correctifs précédents.

1. Télécharger l'archive « Fichiers modifiés du lot 8.3b ».
2. Dans votre dépôt GitHub, ouvrir `app.js`, utiliser l'interface Web GitHub pour remplacer son contenu par la version du ZIP, puis valider la modification.
3. Ouvrir `src/html-singlefile-player.js` et remplacer ce fichier par celui du ZIP, puis valider.
4. En option, ajouter les tests et les fichiers `docs/` ; mettre à jour `README.md` et `CHANGELOG.md`.
5. Ne pas supprimer les autres fichiers. `index.html`, la visionneuse, les exportateurs SCORM/HTML multifichier et `src/html-singlefile-resources.js` restent inchangés.
6. Après publication GitHub Pages, actualiser la page en forçant le rafraîchissement (`Ctrl + F5`), puis effectuer la contre-recette.

**Retour arrière :** restaurer uniquement `app.js` et `src/html-singlefile-player.js` depuis la sauvegarde source 8.3a. Les documents et les tests supplémentaires peuvent rester présents.

**Attention :** les vidéos YouTube externes ne sont pas transformées en fichiers vidéo locaux. Pour un usage réellement hors ligne, le H5P doit contenir les fichiers vidéo sous une licence permettant leur intégration.
