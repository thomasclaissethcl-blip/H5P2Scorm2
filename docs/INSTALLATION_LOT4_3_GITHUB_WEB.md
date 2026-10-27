# Installation manuelle du lot 4.3 sur GitHub Web

1. Conserver le commit **validé du lot 4.2** et utiliser de préférence une branche dédiée pour la mise à jour.
2. Décompresser `H5P_Converter_Lot4_3_Fichiers_Modifies.zip`.
3. À la racine du dépôt, remplacer `app.js`, `index.html`, `styles.css`.
4. Dans le dossier `src/`, **ajouter** `engine-qualification.js`. Le chargement du nouveau script dans `index.html` est obligatoire : sans lui, le convertisseur signalera des modules manquants.
5. Facultatif pour le site : remplacer `tests/run_all.py`, `tests/runtime-smoke.mjs`, `tests/browser_smoke.py`, `tests/engine_catalog_browser.py`, `tests/engine_trials_browser.py`; ajouter `tests/engine-qualification.mjs` et `tests/engine_qualification_browser.py`. Ajouter les nouveaux fichiers du dossier `docs/`.
6. Ne supprimer aucun fichier existant. Publier le commit, vérifier GitHub Pages puis recharger Firefox avec le cache actualisé.
7. Appliquer `docs/CONTRE_RECETTE_LOT4_3.md`. Si une fonction précédemment validée régresse, rétablir le commit 4.2 et conserver le fichier JSON de qualification comme diagnostic.

GitHub Pages reste un hébergement statique. Aucun compte GitHub n'est connecté à ChatGPT.
