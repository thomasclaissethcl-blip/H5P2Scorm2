# Développement de H5P Converter

**État du travail : lot 3 développé, visionneuse expérimentale ajoutée.**

L'aperçu repose sur un contexte isolé et un résolveur de ressources en mémoire ; son fonctionnement sur de véritables contenus H5P n'a pas encore été validé dans cet environnement. Le numéro de version applicative reste **1.0.1**. Documentation spécifique : `docs/LOT3.md` et `docs/PROTOCOLE_RECETTE_LOT3.md`.

## Démarrer

Depuis la racine du projet :

```bash
python tests/run_all.py
python tests/run_all.py --report artifacts/test-report.json
```

Prérequis pour les tests : **Python 3.10+** et **Node.js 18+**. Aucun `npm install` n'est requis. Sous Windows, `py -3 tests/run_all.py` peut être utilisé.

Les suites V1 et les nouveaux tests de parité modulaire restent utilisables séparément :

```bash
python tests/validate_fixtures.py
python tests/validate_release.py
python tests/validate_ui.py
node tests/runtime-smoke.mjs
node --check app.js
python tests/validate_modules.py
# Facultatif : Playwright + Chromium installé localement
python tests/browser_smoke.py
python tests/preview_browser.py  # nouveau : Chromium, lecteur H5P simulé
```

L'interface V1 peut être servie sur un serveur HTTP statique local, par exemple avec `python -m http.server 8000`, puis `http://localhost:8000`. La conversion V1 dépend d'un chargement de JSZip et H5P Standalone depuis un CDN, comme dans la version originale. Le lot 2 teste le raccordement de l'interface dans Chromium avec JSZip simulé, mais ne valide pas un véritable lecteur H5P dans le navigateur.

## Références et gouvernance

- **Normatif après approbation** : `docs/reference/CDC-H5PC-001-v1.0.md` (document encore marqué « proposition à valider » par son auteur).
- **Ordonnancement** : `docs/reference/PLAN-DEMARRAGE-v1.0.md`.
- **Provenance et preuve initiale** : `docs/BASELINE.md` et `baseline/H5P2SCorm-main-v1.0.1.zip`.
- **Inventaire des capacités héritées** : `docs/INVENTAIRE_V1.md`.
- **Matrice de traçabilité** : `docs/TRACEABILITE.csv`.
- **Décisions** : `docs/DECISIONS.md`.
- **Scénarios de recette manuelle** : `docs/RECETTE_MANUELLE.md`.
- **Rapports JSON des tests** : `docs/evidence/lot1-tests.json` et `docs/evidence/lot2-tests.json`.
- **Architecture modulaire** : `docs/ARCHITECTURE_LOT2.md`.
- **Compte rendu du lot** : `docs/LOT2.md`.

Une exigence ne passe au statut « vérifiée » qu'avec une preuve correspondant à son critère de recette. Les tests V1 ne certifient pas à eux seuls la conformité au CDC complet.

## Branche et développement

Le projet livré ici provient d'un dépôt Git créé **localement** : `main` contient uniquement la source originale ; `development/phase-0-socle` apporte l'outillage et la documentation ; `development/phase-1-modules` ajoute les modules d’analyse. Aucun dépôt GitHub n'a été modifié ou créé. Le bundle Git livré à part permet de récupérer cette histoire et les deux branches.

Prochain lot : visionneuse isolée, avec analyse préalable de la sécurité et des ressources. Ne pas relever artificiellement le plafond Core API 1.28 ni remplacer le runtime H5P Standalone 3.8.2 sans campagne de vérification.

## Extension lot 7 (28 octobre 2026)

L'export HTML multifichier est disponible via le module `src/html-multifile.js` ; le lecteur et le contenu portable restent partagés avec SCORM (`src/player-assets.js`, `src/portable-package.js`).

Vérifications : `node tests/html-multifile7.mjs`, `python tests/run_all.py`. Deux conversions réelles (Game Map 1.9.8, Interactive Book SST406) ont été effectuées dans Chromium avec JSZip réel et les ressources du lecteur 3.8.2 reprises d'archives de référence. La navigation HTTP(S) étant bloquée dans l'environnement de vérification, la lecture complète après déploiement et la ressource Moodle « Fichier » attendent la contre-recette utilisateur.

Respecter les quatre exigences HMF-01 à HMF-04 et les chemins relatifs au fichier `index.html`. Ne jamais introduire le pont SCORM dans cet export.
