# Correctif du lot 3.4 : mise en page native Game Map

**Référence :** CDC-H5PC-001. **Base :** lot 3.3. **Statut :** correctif à valider par recette réelle.

## Problème observé

En plein écran et en mode agrandi, le lot 3.3 appliquait à l'ensemble du H5P `transform: scale(...)`. Les diagnostics remontés par l'utilisateur indiquaient des facteurs de 53 % et 64 %. Cette méthode réduisait les dialogues, textes et éléments interactifs et provoquait des anomalies de rendu des hotspots. Le ratio global était conservé, mais l'expérience d'utilisation ne reproduisait pas le mode natif de Game Map.

## Solution

1. Supprimer toute transformation globale `scale()` appliquée à `#h5p-container`.
2. Reconnaître le type principal `H5P.GameMap` à partir de `h5p.json`.
3. Transmettre le mode « agrandi/normal » à l'iframe enfant de H5P via le pont existant, protégé par une clé de session.
4. Pour l'instance Game Map, solliciter sa méthode de mise en page `main.setFullscreen(enabled)` dans le contexte où elle est chargée. La bibliothèque gère alors les dimensions de la carte, de la barre d'outils et des hotspots ; son API générale de plein écran reste distincte.
5. Préserver un repli sans réduction globale pour les autres bibliothèques H5P.
6. Dédupliquer les messages de diagnostic et les changements de géométrie inutiles.
7. Dans les sous-documents éventuellement hors champ, utiliser une temporisation explicite à la place d'un double `requestAnimationFrame` qui peut être suspendu par le navigateur.

## Fichiers modifiés

- `src/preview-frame.js`
- `tests/preview_fit_height_browser.py` (test remplacé : l'ancien test imposait désormais à tort une transformation globale).

Nouveaux documents : `docs/CONTRE_RECETTE_LOT3_4.md` et `docs/BILAN_CORRECTIF_LOT3_4.md`, plus les traces de tests.

**Aucune suppression.** Les fichiers `app.js`, `index.html`, `styles.css` et les mécanismes CSS fonctionnels du lot 3.3 sont conservés sans modification.

## Tests et limites

- 13 contrôles de non-régression exécutés ; rapport conservé dans `docs/evidence/tests-lot3-4.json`.
- Test Chromium avec faux lecteur et iframe enfant isolée : redimensionnement Game Map, retour normal, tailles de hotspots non transformées et sandbox inchangée.
- Vérification CSS dans l'iframe enfant et contrôle navigateur général de l'aperçu.
- **Non validé sur le vrai lecteur H5P Standalone / Firefox / GitHub Pages** : utiliser le protocole de contre-recette.
- Plein écran natif de Game Map et vidéo YouTube intégrée : problèmes encore ouverts.
