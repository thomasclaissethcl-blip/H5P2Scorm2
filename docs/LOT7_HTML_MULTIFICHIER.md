# Lot 7 : export HTML multifichier portable

**Référence :** CDC-H5PC-001 v1.0, exigences HMF-01 à HMF-04, REC-07.
**Base :** lot 6.1 accepté (10/10), acquis des lots 1 à 5.3 préservés.
**Statut :** développé et vérifié techniquement, recette HTTP(S) / Moodle utilisateur ouverte.

## Périmètre

Un nouveau bouton **Générer le HTML multifichier** produit un ZIP contenant, à sa racine :

- `index.html` : point d'entrée de l'activité ;
- `html/player-init.js` : initialisation du lecteur autonome sans API SCORM ;
- `player/` : 25 fichiers du lecteur H5P Standalone **3.8.2**, même manifeste que SCORM ;
- `h5p/` : `h5p.json`, `content/content.json`, bibliothèques, médias et ressources ;
- `custom/custom.css` : styles importés et styles saisis, concaténés dans cet ordre ;
- `localization-report.json` : rapport de localisation ;
- `generation-report.json` : moteur, bibliothèque principale, dépendances, paramètres, restrictions ;
- `README.txt` : consignes de déploiement.

**Absents intentionnellement :** `imsmanifest.xml`, `scorm/scorm12.js`, `scorm/h5p-scorm-bridge.js`, `score-plan-report.json`.

### Exécution portable

Le ZIP doit être décompressé en conservant son arborescence. L'URL du fichier `index.html` doit être servie par un hébergement web statique HTTP(S). Tous les chemins construits par le lanceur sont relatifs au fichier d'entrée ; l'utilisation d'un sous-répertoire est prévue. Le lecteur, les bibliothèques et les médias H5P sont localisés dans le ZIP. **Aucun CDN ou backend n'est sollicité par le lanceur pendant la lecture.**

Les bibliothèques H5P peuvent elles-mêmes référencer des services distants, notamment YouTube. Dans ce cas, la connexion et les permissions réseau restent nécessaires pour ces ressources particulières. Le lancement `file://` est hors périmètre de cette recette et ne doit pas être assimilé au futur monofichier.

### Moodle, ressource « Fichier »

1. Dans un cours de recette, ajouter une ressource Moodle **Fichier**.
2. Importer le ZIP HTML, le décompresser dans la zone de fichiers et choisir `index.html` comme **fichier principal**.
3. Vérifier que Moodle restitue les autres fichiers du dossier dans les mêmes chemins relatifs.
4. Afficher la ressource et tester le H5P, notamment les ressources, les interactions, le CSS et le plein écran lorsque l'affichage le permet.

Moodle peut bloquer l'exécution des scripts JavaScript, appliquer un sandbox à l'iframe ou empêcher certaines requêtes locales. La fonctionnalité doit être **validée sur le Moodle cible**. En cas de blocage, déployer le mini-site sur un hébergement statique autorisé et le lier depuis le cours.

La ressource HTML ne transmet **aucune note** et ne persiste **aucune progression dans Moodle**. L'export SCORM reste le format pour les notes et la reprise LMS.

### Paramètres et décisions

- Source et analyse : mêmes mécanismes H5P que SCORM.
- Localisation : même transformation que SCORM, en respectant les textes auteur.
- CSS : même ordre et même emplacement que SCORM.
- Moteur : **3.8.2 uniquement**, les versions expérimentales restent interdites pour l'export.
- Le bouton HTML et le bouton SCORM sont indépendants ; un seul export à la fois est autorisé.
- Le titre de l'activité s'applique aux deux formats ; les paramètres de notation, de statut et de reprise ne s'appliquent qu'à SCORM.

## Preuves techniques

- 35/35 suites automatiques réussies avec le nouveau module et les garde-fous SCORM.
- Chromium : Game Map 1.9.8 importé depuis un `.h5p` réel, ZIP de 6 892 090 octets produit, 1 135 entrées, 25 ressources de lecteur comparées octet par octet à la référence, sans fichier SCORM et sans erreur JavaScript de la conversion.
- Chromium : H5P.InteractiveBook 1.11 reconstitué **pour le test** depuis une archive SCORM fournie, ZIP de 16 949 512 octets produit, 852 entrées, même vérification structurelle, aucune erreur JavaScript de la conversion.
- L'environnement Chromium interdit la navigation vers un serveur HTTP(S) même local. **Aucune lecture réelle de ces ZIPs sur un hébergement HTTP(S), dans une iframe de site web ou dans Moodle n'a été vérifiée ici.** La contre-recette est donc requise.

## Non-régression

Les modules `src/scorm-scoring.js`, `src/scorm-score-plan.js`, la visionneuse, les styles et la logique du pont SCORM restent protégés par les tests existants. Le lecteur embarqué et la structure `h5p/` sont partagés avec le format SCORM. Le lot 7 ne modifie pas les algorithmes de score.

## Prochain lot

Le monofichier HTML (HMO) et les traitements par lots (LOT) ne sont pas développés. Aucun support `file://` universel n'est revendiqué pour le multifichier.
