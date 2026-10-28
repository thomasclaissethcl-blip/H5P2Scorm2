# Bilan du lot 7 : HTML multifichier portable

Date : 28 octobre 2026
Référence : CDC-H5PC-001, HMF-01 à HMF-04, REC-07.
Base : lot 6.1, accepté sur 10/10 contrôles.

## Livré

Nouvelle génération HTML multifichier en ZIP autonome pour une diffusion sur un hébergement HTTP(S) statique compatible, y compris en sous-répertoire. Le format n'utilise aucune API SCORM. Le lecteur figé H5P Standalone 3.8.2, le contenu H5P, les médias, les dépendances et la surcouche CSS sont embarqués. Les rapports de génération et de localisation sont joints.

Le HTML peut être importé comme mini-site dans Moodle via la ressource « Fichier » lorsque l'environnement permet l'exécution des scripts et les requêtes relatives. Cette compatibilité fait partie de la contre-recette et n'a pas encore été validée dans Moodle pour cet export.

## Vérifications réalisées

- Tests automatisés : **35/35** succès ; aucune anomalie dans les suites de non-régression SCORM.
- Génération réelle Chromium : Game Map 1.9.8 depuis un vrai H5P, 1 135 entrées, ZIP de **6 892 090 octets** ; lecture et compression des fichiers via le vrai JSZip, ressources lecteur 3.8.2 intégrées (25/25, identiques octet par octet à celles de référence).
- Génération réelle Chromium : Interactive Book SST406 depuis le H5P reconstitué à partir du SCORM fourni, 852 entrées, ZIP de **16 949 512 octets** ; même lecteur 3.8.2, aucune erreur JavaScript de génération.
- Les deux ZIP contiennent `index.html`, `html/player-init.js`, `h5p/`, `player/`, `custom/`, `generation-report.json` et `localization-report.json`. Aucun manifeste ni pont SCORM.
- Les contrôles de syntaxe, de relative paths, de traductions et de l'initialisation simulée du lecteur HTML passent.

**Limite technique :** le Chromium du présent environnement refuse toute navigation HTTP(S), même vers un serveur statique local. Le rendu H5P effectif sur un hébergement web et la publication en ressource Moodle Fichier n'ont donc pas été exécutés ici. Ces étapes sont prévues dans `CONTRE_RECETTE_LOT7.md`.

## Impact applicatif

- Modifier : `app.js`, `index.html`.
- Ajouter : `src/html-multifile.js`.
- Aucun fichier applicatif à supprimer.
- Tous les modules sensibles validés en lot 6.1, notamment `src/scorm-scoring.js`, `src/scorm-score-plan.js`, `src/preview-frame.js`, `src/h5p-preview.js`, `src/youtube-preview.js`, `src/player-assets.js`, `src/portable-package.js`, `styles.css`, restent inchangés.
- Les tests d'exécution SCORM existants ont été adaptés uniquement pour charger le nouveau module dans leur environnement simulé ; le pont SCORM interne reste couvert par la vérification des empreintes du lot 5.3.

## Restrictions

1. L'archive doit être décompressée et accessible avec la même arborescence ; `index.html` seul ne suffit pas.
2. Les contenus H5P utilisant des services externes peuvent exiger une connexion Internet et des autorisations spécifiques ; aucune garantie de lecture YouTube intégrée n'est donnée par ce lot.
3. Moodle peut imposer des limites JavaScript, iframe et de chemin des ressources. Une impossibilité propre aux règles de l'hôte doit être identifiée distinctement d'une anomalie du paquet.
4. Aucun score LMS ni reprise LMS dans le HTML simple. Le SCORM conserve ces responsabilités.
5. Pas d'exécution `file://` garantie pour le multifichier ; l'HTML monofichier relève du lot suivant.
6. Les moteurs expérimentaux 3.8.0 et 3.8.1 restent interdits à l'export.

**Décision :** développé et testé techniquement ; recette fonctionnelle sur les hébergements cibles ouverte.
