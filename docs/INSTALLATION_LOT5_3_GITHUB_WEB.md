# Installation du lot 5.3 via GitHub Web

**Point de départ attendu :** votre dépôt contient la version 5.2b acceptée. Préserver le commit précédent pour permettre un retour arrière.

## Application

Un seul fichier applicatif change : remplacer `app.js` à la racine du dépôt.

Aucun fichier applicatif à supprimer. Les fichiers `index.html`, `styles.css`, `src/scorm-scoring.js`, `src/scorm-score-plan.js`, `src/h5p-preview.js`, `src/preview-frame.js`, `src/youtube-preview.js` et le générateur SCORM préexistant restent inchangés, à l'exception de l'instrumentation et de la sauvegarde dans le pont produit par `app.js`.

## Tests et documentation

Ajouter ou modifier, si vous souhaitez conserver la traçabilité dans le dépôt :

- Remplacer `tests/run_all.py`.
- Ajouter `tests/scorm-fallback53.mjs` et `tests/generate_qa_scorm53.mjs`.
- Ajouter `tests/fixtures/interactive-book-score53.json`.
- Ajouter `tests/qa_scorm_browser53.py` (facultatif pour l'hébergement).
- Ajouter `docs/evidence/LOT5_3_SIMULATION.json` et les documents `docs/LOT5_3.md`, `docs/CONTRE_RECETTE_LOT5_3.md`, `docs/INSTALLATION_LOT5_3_GITHUB_WEB.md`.

**Aucune suppression.** L'archive ciblée utilise les chemins relatifs au projet. Ne pas ajouter les dossiers de travail temporaires au dépôt.

## Mise en production

1. Préparer une branche ou un commit distinct avant l'ajout ; déposer manuellement les fichiers à leur emplacement avec GitHub Web.
2. Après publication GitHub Pages, forcer l'actualisation de la page.
3. Vérifier le Game Map et le SCORM habituel avant d'essayer l'option expérimentale.
4. Pour Moodle, importer le ZIP technique de recette **séparément**. Il est destiné à un cours de test et ne doit jamais être affecté aux apprenants.
5. Effectuer la checklist et conserver les résultats de la recette.

En cas d'échec, revenir au commit 5.2b ; le format SCORM antérieur n'a pas été modifié et les paquets déjà exportés restent inchangés.
