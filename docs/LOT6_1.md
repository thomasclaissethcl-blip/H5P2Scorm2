# Lot 6.1 : socle commun des ressources et non-régression

**Référentiel :** CDC-H5PC-001 v1.0. **Base :** lot 5.3, recette fonctionnelle acceptée, diagnostics L53-06 à L53-08 toujours ouverts.

## Objectif

Préparer le moteur commun nécessaire à l'export HTML multifichier tout en conservant, pour le périmètre validé, les mêmes ressources H5P et le même paquet SCORM 1.2. Le lot 6.1 est **technique** : aucun nouveau format d'export n'est livré et aucun moteur expérimental n'est promu.

## Modifications

- `src/player-assets.js` contient le manifeste figé des **25 fichiers** du lecteur H5P Standalone version **3.8.2**, dans le même ordre que le lot 5.3. Il centralise les chemins CDN et les chemins `player/` des exports. La présence sur le CDN, la licence et l'intégrité des octets téléchargés ne sont pas certifiées par ce module. Le téléchargement de ces fichiers demeure nécessaire lors de l'export SCORM.
- `src/portable-package.js` effectue la copie des ressources d'une archive H5P vers `h5p/` dans le paquet produit. Il réécrit `h5p.json` et `content/content.json` exactement comme le générateur préexistant. La vérification des chemins dangereux est déclenchée **avant** toute copie.
- `app.js` utilise ces deux modules sans changer le nom des ressources, la politique du lecteur, les profils expérimentaux, la construction du manifeste SCORM, le pont SCORM, les scores ou les statuts.
- `index.html` charge les deux modules avant `app.js`.

## Preuves de non-régression

- 30 contrôles historiques relancés et trois suites nouvelles, **33/33 réussis**.
- Les empreintes SHA-256 des modules protégés et du bloc de fonctions de l'API / du pont SCORM correspondent exactement à la version 5.3.
- Le manifeste de ressources exportées est strictement identique à la liste du lecteur 5.3.
- La copie de contenus H5P a été contrôlée sur un faux ZIP reproduisant les interfaces JSZip, y compris les métadonnées réécrites et les fichiers binaires ; aucun test nouveau ne constitue à lui seul une validation Moodle.
- Les tests d'interface Chromium simulés (chargement, versions candidates, qualification) ont été exécutés sans erreur JavaScript.

## Maintien des protections

- `3.8.2` reste le seul lecteur autorisé à exporter.
- Les moteurs `3.8.1` et `3.8.0` restent accessibles uniquement en essai d'aperçu.
- L'agrégation SCORM expérimentale reste désactivée par défaut et le score global natif reste prioritaire.
- La visionneuse, les CSS, le plein écran, YouTube de secours et le noyau de notation restent inchangés.

## Limitations

- Pas de lecture H5P réelle dans ces nouveaux tests automatisés ; la recette Firefox/GitHub Pages reste nécessaire.
- La génération réelle de ZIP SCORM avec récupération des ressources depuis le CDN reste à confirmer sur GitHub Pages après installation.
- Les vérifications de diagnostic L53-06 à L53-08 conservent leur statut « non testées » dans la recette utilisateur ; la disponibilité de la fonction est couverte par la simulation et non par le vrai navigateur Moodle.
- Ce lot ne fournit ni export HTML ni conversion par lots, ni sélection automatique d'un autre moteur qualifié.

## Suite

Lot 6.2 : approfondissement des contrats communs et des vérifications de compatibilité, puis lot 7 : **HTML multifichier** fondé sur `player-assets.js` et `portable-package.js`, sans pont SCORM. Les chemins des trois exportateurs devront partager les mêmes règles.
