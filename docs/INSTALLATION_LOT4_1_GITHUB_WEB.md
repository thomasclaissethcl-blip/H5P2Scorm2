# Installation manuelle GitHub Web : lot 4.1

**Point de départ obligatoire : version 3.6 installée, validée.** Ne pas appliquer
cette livraison à une ancienne 3.2 ou à la version historique 1.0.1.

1. Préserver l'état du dépôt 3.6 dans GitHub (branche ou commit identifié).
2. Ouvrir l'archive des seuls fichiers modifiés et y prendre les chemins
   relatifs sous `H5P-Converter/` ; ne pas créer un dossier `H5P-Converter`
   supplémentaire si votre dépôt sert déjà ce répertoire à sa racine.
3. **Remplacer** les fichiers :
   - `app.js`
   - `index.html`
   - `styles.css`
   - `tests/run_all.py`
   - `tests/runtime-smoke.mjs`
   - `tests/browser_smoke.py`
   - `tests/validate_release.py`
   - `docs/DECISIONS.md` (registre des décisions, facultatif pour l’exécution)
4. **Ajouter** les fichiers :
   - `src/engine-catalog.js` (indispensable à l'application)
   - `tests/engine-catalog.mjs`
   - `tests/engine_catalog_browser.py` (test facultatif utilisant le Game Map joint, non inclus)
   - `docs/LOT4_INCR1.md`
   - `docs/ENGINE_COMPATIBILITY_MATRIX.csv`
   - `docs/CONTRE_RECETTE_LOT4_1.md`
   - `docs/INSTALLATION_LOT4_1_GITHUB_WEB.md`
   - `docs/BILAN_LOT4_1.md`
   - `docs/evidence/LOT4_1_TESTS.json`
5. Aucun fichier ancien à supprimer. Enregistrer les modifications sur une
   branche, lancer si possible le workflow de régression, puis publier sur
   GitHub Pages après vérification du diff.
6. Attendre la fin de la publication GitHub Pages, recharger sans cache, puis
   renseigner le protocole `docs/CONTRE_RECETTE_LOT4_1.md`.

**Vérification immédiate :** si `src/engine-catalog.js` est oublié, l'application
refuse de démarrer pour éviter un état incohérent. Son inclusion dans `index.html`
doit précéder `src/h5p-analysis.js` et `app.js`.

**Revenir à 3.6 :** restaurer `app.js`, `index.html` et `styles.css` depuis
le commit sauvegardé ; retirer `src/engine-catalog.js` si souhaité. Les fichiers
de documentation et de tests du lot 4.1 n'affectent pas l'application publiée.
