## 26 octobre 2026, lot 3.1 : corrections après recette GitHub Pages

Voir `docs/LOT3_CORRECTIFS_RECETTE.md`. Stockage temporaire, ressources CSS et médias dynamiques, agrandissement, CSS à chaud, option YouTube sur consentement et diagnostic xAPI. Validation réelle en attente.

# Journal de développement de la refonte

## Lot 1, 23 octobre 2026, préparation du socle

### Ajouté
- Copie exacte et vérifiée SHA-256 de l'archive H5P2SCorm 1.0.1 dans `baseline/`.
- Référence Markdown du cahier des charges CDC-H5PC-001 et plan initial dans `docs/reference/`.
- Commande unique de tests (`python tests/run_all.py`) et rapport JSON exportable.
- Contrôle automatique d'intégrité de l'archive d'origine.
- Configuration de CI GitHub Actions (non exécutée sur un dépôt distant).
- Inventaire de la V1, registre de décisions, suivi de phase et scénarios manuels.
- Matrice des 75 exigences et des 24 scénarios de recette (aucune nouvelle exigence déclarée conforme).
- Historique Git local avec branche source `main` et branche `development/phase-0-socle`.

### Conservé strictement inchangé
- Version applicative 1.0.1 et profil de lecteur `h5p-standalone 3.8.2`.
- `app.js`, `index.html`, `styles.css`, les tests et les fixtures d'origine.
- Le fonctionnement et les limites du générateur SCORM 1.2.

### Non inclus dans ce lot
- Visionneuse H5P, refonte des moteurs Core, moteur de score composite, nouveaux exports HTML, traitement par lots et nouvelle interface.

## Lot 2, 26 octobre 2026, extraction du cœur d'analyse

### Ajouté
- Trois modules métiers : profils Core API, graphe de dépendances, analyse H5P.
- Tests de parité exacte avec le code V1.0.1 sur six archives H5P et tests de cas synthétiques.
- Contrôle Chromium simulant JSZip pour vérifier l'exécution des scripts et la réaction de l'interface.
- Documentation de l'architecture, des interfaces des modules et des limites de validation.

### Conservé
- Version 1.0.1, moteur H5P Standalone 3.8.2 et plafond déclaré Core API 1.28.
- Format du résultat d'analyse, parcours UI existant et génération SCORM actuelle.
- Archive originale de la V1, historique du lot 1 et traçabilité du CDC.

### Non réalisé
- Visionneuse, catalogage de plusieurs moteurs effectivement distribués, sécurité renforcée des ZIP,
  nouveaux exports, agrégation des scores, conversion par lots et recette LMS.

## Lot 3, 26 octobre 2026, prototype de visionneuse isolée

### Ajouté
- `src/preview-frame.js` et `src/h5p-preview.js` : iframe sandbox à origine opaque, CSP, accès en mémoire aux ressources, pilote de prévisualisation, cache de lecteur.
- Interface d'aperçu après diagnostic, agrandissement, redémarrage, CSS et événements xAPI simplifiés.
- Tests module et Chromium avec simulation du lecteur, protocole de recette utilisateur et dossier de preuves.

### Inchangé
- Moteur SCORM, profil H5P Standalone 3.8.2, comportement de notation et version publique 1.0.1.

### Limitations
- Pas de test d'un véritable moteur H5P dans un navigateur lors de ce lot (CDN inaccessible).
- Pas de certification de compatibilité des contenus composites ou de sécurité complète face aux scripts hostiles.

## Lot 3.3 (26/10/2026) : correctif expérimental en attente de recette

Ajustement proportionnel de la scène selon la hauteur disponible en plein écran, chargement CSS Blob en plus du pont d'injection, télémétrie CSS/plein écran/CSP et test Chromium spécifique. Lecture YouTube intégrée toujours non résolue ; génération SCORM inchangée.
