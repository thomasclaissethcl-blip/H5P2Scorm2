# Contre-recette du lot 4.3, GitHub Pages / Firefox

**Préparation :** conserver le commit accepté du lot 4.2 ; publier le lot 4.3 sur une branche de test ou conserver une possibilité de retour arrière ; recharger Firefox sans utiliser le cache ; importer le fichier `fantasy-map-2-181 (1).h5p` de référence.

## Fiche de qualification, contrôles spécifiques

- [ ] **L43-01**. La version 3.8.2 est toujours sélectionnée par défaut et la génération SCORM est autorisée pour le Game Map valide.
- [ ] **L43-02**. Dans « Versions et moteurs H5P », la nouvelle fiche affiche sept critères, tous initialement « Non testé ».
- [ ] **L43-03**. Avec 3.8.1, sélectionner « Réussi » pour le chargement, puis « Échoué » pour un critère présentant réellement un défaut ; saisir une observation et télécharger la fiche JSON.
- [ ] **L43-04**. Le JSON désigne 3.8.1, inclut le titre et la bibliothèque Game Map, les critères et l'observation ; il indique `qualification: non_qualifie` et `exportAllowedByThisReport: false`.
- [ ] **L43-05**. Sélectionner 3.8.0. Sa fiche est neuve. Saisir des résultats différents, puis revenir à 3.8.1 : les observations et choix précédents ont été conservés sans mélange.
- [ ] **L43-06**. Dans les moteurs 3.8.1 et 3.8.0, l'export SCORM reste interdit, y compris si tous les critères sont marqués « Réussi ».
- [ ] **L43-07**. Revenir à 3.8.2 : la génération SCORM est immédiatement réactivée. Un nouveau fichier H5P efface les fiches de qualification de l'ancien fichier.
- [ ] **L43-08**. Terminer un exercice émettant du xAPI dans la visionneuse 3.8.2 : le compteur xAPI de la fiche augmente. Si aucun événement n'est reçu, indiquer « Non testé » et noter le contexte, sans inventer un résultat.

## Non-régression du lot 3 et du lot 4.2

- [ ] **L43-09**. Game Map 1.9.8 : navigation, médias locaux, plein écran natif et mode Agrandir, hotspots et défilement conservent le comportement validé.
- [ ] **L43-10**. CSS importé ou saisi : modification visible dans l'aperçu sans perte de progression.
- [ ] **L43-11**. YouTube : les deux vidéos restent détectées et lisibles dans le lecteur de secours, avec image et son ; la lecture directe dans Game Map est toujours une réserve connue.
- [ ] **L43-12**. Génération SCORM 1.2 avec 3.8.2 : ZIP produit comme précédemment. Si Moodle est disponible, vérifier le lancement, sans considérer l'agrégation des scores composite comme déjà validée.
- [ ] **L43-13**. Importer un H5P nécessitant Core API au-delà de 1.28 et un H5P ayant une dépendance absente : le diagnostic bloque l'export comme en V4.1.

## Corpus recommandé pour qualifier un nouveau moteur au-delà de ce lot

- Un Game Map 1.9.8 comprenant plusieurs exercices et médias.
- Un Interactive Book avec des exercices notés.
- Un exercice simple noté (Multiple Choice, Fill in the Blanks).
- Si possible, une ancienne version de bibliothèque et un Course Presentation ou Interactive Video.

**Décision attendue :** la réussite de la contre-recette L43-01 à L43-13 valide l'outil de collecte de preuves ; elle n'autorise pas automatiquement 3.8.1 ni 3.8.0 à générer des SCORM. Les fiches téléchargées serviront à déterminer, dans un autre incrément, si un nouveau moteur peut être qualifié.

Pour toute anomalie : indiquer son numéro, la version du lecteur, le navigateur, le H5P testé, le comportement observé et celui attendu. Ne pas ajouter de données d'apprenants aux rapports.
