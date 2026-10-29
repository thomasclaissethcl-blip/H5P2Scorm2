# Correctif 8.2b : diagnostic monofichier et étude de faisabilité

Date : 29 octobre 2026. Base : correctif 7d + lot 8.2. Référence H5P Standalone 3.8.2 préservée.

## Recette utilisateur précédente

- 7d : 8/8 contrôles conformes, accepté.
- 8.2 : contrôles 9, 12, 13 conformes ; contrôles 10 et 11 KO. Lot 8.2 non clôturé.
- L'export HTML monofichier interactif n'a **jamais** été livré à ce stade.

## Diagnostic du prototype original

1. Le prototype intégrait correctement les fichiers, mais la vérification décodait *synchroniquement* chacun des 1 021 enregistrements du H5P. Ce travail bloquant pouvait retarder le rendu. Le « 35 % » observé ne correspond à aucune jauge codée dans l'original ; l'origine exacte du pourcentage affiché sur le poste utilisateur n'est pas démontrée.
2. L'aperçu prenait la première ressource ayant une extension image dans l'ensemble des bibliothèques H5P, soit `h5p/FontAwesome-4.5/fontawesome-webfont.svg`, une police SVG. Ce choix expliquait l'absence d'aperçu d'une image pédagogique, malgré la présence de fichiers JPEG dans `h5p/content/images/`.

## Correctifs

- Sélection prioritaire de trois images raster réelles du dossier `h5p/content/`. Les icônes et polices SVG des bibliothèques sont ignorées par l'aperçu. Le nombre d'images découvertes est explicité.
- Vérification progressive par groupes de 10 fichiers avec cession régulière au navigateur ; progression affichée de 0 à 100 %, message d'erreur visible si échec.
- API d'inspection des ressources, limites, intégrité des enregistrements et refus d'exécuter du JS H5P préservés.
- Aucun changement à `app.js`, aux exports SCORM/HTML multifichier, aux CSS responsives ni au lecteur.

## Tests

- 45/45 suites automatisées réussies, y compris la nouvelle suite 8.2b.
- Chromium, petit prototype : image du contenu chargée, progression achevée, aucune erreur JS.
- Chromium, réelle Game Map : 1 021 fichiers, 12 241 019 octets vérifiés, 13 images de contenu trouvées, 3 images affichées et chargées, `RESSOURCES VERIFIEES`, progression à 100 %, aucune erreur JS.
- Le mode direct `file://` et les autres navigateurs restent à contrôler par la recette utilisateur ; il ne s'agit pas d'une validation générale du monofichier.

## Étude de Lumi et Logiquiz (sources publiques consultées)

- Lumi expose un export `createSingleBundle` dans `@lumieducation/h5p-html-exporter`. Le projet distingue le monofichier intégral et le fichier HTML accompagné de médias séparés.
- Sa documentation technique indique l'internalisation des scripts, des feuilles de styles, des polices et médias. Les ressources du contenu sont codées en base64, les références `url(...)` CSS doivent être résolues et les fichiers absolus externes ne sont pas nécessairement intégrés.
- Le logiciel Logiquiz dispose bien d'une fonctionnalité d'export autonome en HTML utilisable hors connexion, attestée par des tutoriels pédagogiques. Son algorithme interne d'export n'a pas été vérifié à partir de code source.
- Ces références confortent la stratégie de conception. La future architecture devra produire le modèle d'initialisation du H5P, intégrer les scripts et CSS dans l'ordre des dépendances, adapter les références des médias internes, gérer le chargement dynamique, et préserver `file://` ainsi que le fonctionnement HTTP(S).
- Les projets Lumi sont proposés sous licence GPL-3.0. Notre approche prévue consiste à étudier les concepts et à développer un module original, sans intégrer ni recopier leurs composants.

Sources documentaires :
- https://github.com/Lumieducation/Lumi/blob/master/src/ops/export-h5p.ts
- https://github.com/Lumieducation/H5P-Nodejs-library
- https://coveralls.io/builds/81717998/source?filename=packages%2Fh5p-html-exporter%2Fsrc%2FHtmlExporter.ts
- https://pedagogie.ac-montpellier.fr/sites/default/files/ressources/Tutoriel%20LogiQuiz%20DigiQuiz%20%28H5P%29.pdf

## Feuille de route 8.3 proposée

1. Générer un lanceur H5P monofichier *interactif*, d'abord pour une activité simple qualifiée.
2. Regrouper les scripts et styles dans le bon ordre, internaliser les ressources des bibliothèques (polices incluses) et du contenu, adapter les chemins dynamiques et le chargement dans l'iframe.
3. Tester `file://`, HTTP(S), sous-répertoire, Firefox et Chromium ; intégrer un mécanisme de refus explicite et repli sur HTML multifichier si impossible.
4. Étendre seulement après qualification aux contenus composites, dont Game Map et Interactive Book ; ne pas promettre la compatibilité universelle à ce stade.

**Statut** : correctif technique 8.2b livré pour contre-recette ; lot 8.2 reste ouvert jusqu'à votre validation des points 10 et 11 ; 7d est validé.
