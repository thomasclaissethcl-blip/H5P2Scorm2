# Lot 4.3 : instrumenter la qualification des moteurs H5P

Date : 27 octobre 2026. Référentiel : CDC-H5PC-001 v1.0. Base : lot 4.2 accepté (12 contrôles sur 12) sur Firefox / GitHub Pages.

## Fonctionnel livré

- Une fiche de qualification apparaît uniquement à l'intérieur de « Versions et moteurs H5P (diagnostic avancé) ».
- Pour le lecteur sélectionné, la fiche propose sept contrôles : chargement, rendu, interactions, médias locaux, plein écran, CSS et xAPI. Pour chaque contrôle : non testé, réussi, échoué ou sans objet.
- Les observations techniques locales dénombrent les démarrages confirmés du lecteur (`ready`), les émissions xAPI, les erreurs et les ressources bloquées. Les erreurs sont échantillonnées de façon bornée. Le texte complet des événements xAPI n'entre pas dans le rapport.
- Une zone de commentaires permet de consigner les anomalies observées. Le rapport JSON est téléchargé localement, sans envoi vers le serveur.
- Une fiche distincte est conservée pendant la session pour chacun des profils 3.8.2, 3.8.1 et 3.8.0, uniquement pour le fichier chargé. Un nouveau fichier efface les fiches antérieures.
- Une fiche remplie ne qualifie **jamais** le moteur et ne débloque **jamais** l'export SCORM. L'agrégation des résultats de plusieurs packages et la décision de qualification restent du ressort d'une recette documentée.

## Invariants non modifiés

- H5P Standalone **3.8.2** reste le seul moteur utilisable à l'export.
- H5P Standalone 3.8.1 et 3.8.0 sont accessibles uniquement en aperçu manuel.
- Les vérifications Core API, le mécanisme d'import et les règles de compatibilité de la V4.2 restent inchangés.
- L'ensemble du code des fichiers `src/preview-frame.js`, `src/h5p-preview.js`, `src/youtube-preview.js`, `src/h5p-analysis.js`, `src/engine-catalog.js`, `src/runtime-profiles.js`, `RUNTIME_PROFILE.json` est identique au lot 4.2.
- Le segment de `app.js` contenant le constructeur de l'API SCORM et le runtime de notation est strictement identique au lot 4.2.

## Tests réalisés

- `python tests/run_all.py` : 19 contrôles sur 19 réussis (17 contrôles antérieurs, plus 2 liés à la qualification).
- `python tests/engine_trials_browser.py` : réussi sous Chromium avec vrai Game Map pour l'analyse et lecteur simulé.
- `python tests/engine_qualification_browser.py` : réussi avec Game Map pour l'analyse, modification des critères, conservation par moteur et téléchargement JSON ; le lecteur est simulé.
- `python tests/browser_smoke.py` et `python tests/engine_catalog_browser.py` : réussis sur les scénarios existants.
- Aucune exécution réelle du lecteur H5P Standalone 3.8.1 ou 3.8.0 dans cet environnement, et aucun essai Moodle.

## Qualification non acquise

La qualification technique et pédagogique doit encore être établie sur un corpus de vrais H5P dans Firefox et, de préférence, dans un autre navigateur. Un test réussi sur un Game Map ne suffit pas à généraliser une version de lecteur. Les anomalies d'affichage rencontrées avec un ancien lecteur durant la recette 4.2 motivent précisément cette étape.

## Références à consulter

- Releases H5P Standalone : https://github.com/tunapanda/h5p-standalone/releases (3.8.1 mentionne un ajustement des ressources CSS du cœur H5P ; 3.8.0 a introduit une évolution de l'assemblage des CSS).
- Cahier des charges : `docs/reference/CDC-H5PC-001-v1.0.md`, exigences CMP-04 à CMP-09 et REC-04, REC-23, REC-24.

Aucune connexion ChatGPT vers GitHub n'est nécessaire. Installation manuelle prévue sur GitHub Web.
