# Dépôt manuel sur GitHub Web : correctif 3.6

Base requise : correctif 3.5 déjà déployé sur GitHub Pages.

## Remplacer à leur emplacement actuel

- `app.js`
- `index.html`
- `styles.css`
- `src/preview-frame.js`
- `tests/run_all.py` (uniquement pour la nouvelle suite de test ; ne joue aucun rôle dans GitHub Pages)
- `docs/CHANGELOG_DEV.md` (traçabilité)

## Ajouter

- `src/youtube-preview.js` **obligatoire** : le script est chargé dans `index.html` avant `app.js`.
- `tests/youtube-preview.mjs`
- `tests/youtube_preview_browser.py`
- `docs/BILAN_CORRECTIF_LOT3_6.md`
- `docs/CONTRE_RECETTE_LOT3_6.md`
- `docs/evidence/lot3-6-tests.json`
- ce fichier `docs/INSTALLATION_LOT3_6_GITHUB_WEB.md`

**Ne supprimer aucun fichier.** Les dossiers doivent être conservés. Aucune connexion GitHub avec ChatGPT n'est nécessaire.

## Vérification

1. Vérifier que la publication GitHub Pages du commit est terminée.
2. Forcer le rechargement (Ctrl+F5) ; rouvrir le Game Map.
3. Suivre `docs/CONTRE_RECETTE_LOT3_6.md`.
4. Ne pas considérer le plein écran natif ni la lecture YouTube *dans* le H5P comme validés avant essais sur Firefox.

En cas d'échec lors de l'import : vérifier en premier que `src/youtube-preview.js` figure au bon emplacement et que `index.html` le charge avant `app.js`.
