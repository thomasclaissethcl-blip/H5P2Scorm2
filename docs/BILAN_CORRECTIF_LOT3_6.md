# Lot 3.6 : tentative de délégation Fullscreen H5P et lecture YouTube de secours

Date : 26 octobre 2026. Référence : CDC-H5PC-001, exigences VIS-01, VIS-02, VIS-04, VIS-07 et NFR-02.

## État initial confirmé par la recette 3.5

La visionneuse Game Map, son ajustement géométrique, le défilement de ses fenêtres et les styles CSS personnalisés fonctionnent dans Firefox sur GitHub Pages. Le bouton de plein écran natif H5P et les vidéos YouTube intégrées au contenu ne fonctionnent pas dans cet environnement isolé.

## Changement n° 1 : permissions de plein écran internes

- Le cadre principal conserve **`sandbox="allow-scripts"`**, sans `allow-same-origin`.
- La délégation Fullscreen a été précisée dans `index.html` avec `allow="fullscreen *"`.
- Les sous-iframes H5P accessibles reçoivent `allowfullscreen` et `allow="fullscreen *"` lors de l'analyse du DOM.
- Un diagnostic supplémentaire affiche la valeur de `fullscreenEnabled` et `H5P.fullscreenSupported` dans un sous-document H5P qui dispose du pont interne.
- Les paramètres H5P ne sont pas forcés artificiellement : si `H5P.fullscreenSupported=false`, l'interface native peut demeurer absente, notamment dans Firefox.

Il s'agit d'une **tentative de restauration** de la capacité native, non d'une correction validée. L'API Fullscreen dépend aussi des politiques du navigateur, des cadres imbriqués et du contexte d'exécution.

## Changement n° 2 : lecteur YouTube alternatif dans l'interface

- Deux références YouTube sont extraites du fichier Game Map de recette ; seuls les hôtes `youtube.com`, `youtube-nocookie.com`, `youtu.be` explicitement autorisés et les ID au format de 11 caractères sont admis.
- Une nouvelle section est affichée après import si le H5P contient des vidéos YouTube.
- **Aucun lecteur externe n'est créé avant consentement et clic sur « Lire »**. Le lien vers youtube.com reste disponible comme option manuelle.
- Le lecteur est hébergé dans une iframe `youtube-nocookie.com` placée dans le DOM de l'application, donc en dehors du sandbox H5P. Il utilise `referrerpolicy="strict-origin-when-cross-origin"`, le référent HTTP étant exigé par YouTube pour les vidéos intégrées.
- Décochez l'autorisation ou cliquez « Fermer » pour retirer immédiatement l'URL de l'iframe.
- Aucun résultat, état de lecture ou événement xAPI de la vidéo de secours n'est ajouté à l'activité H5P. Cette solution **ne remplace pas la lecture native dans la fenêtre interne de Game Map**.
- Les restrictions d'intégration propres à une vidéo YouTube ou au navigateur peuvent encore empêcher sa lecture.

Le lecteur interne H5P reste soumis à son isolation d'origine. La suppression du sandbox n'a **pas** été retenue, car elle affaiblirait la protection du contenu importé sur GitHub Pages.

## Tests réalisés

- `python tests/run_all.py` : **14/14 réussis** ; anciennement 13, un test de contrôle strict des liens YouTube est ajouté.
- `node tests/youtube-preview.mjs` : extraction des ID, refus des URL dangereuses, structure HTML et sandbox.
- `python tests/youtube_preview_browser.py` : vérifications Chromium du consentement, de l'absence de chargement initial, du clic et de la fermeture. Navigation externe interceptée et bloquée volontairement pendant ce test.
- `node tests/preview-module.mjs` : contrôle CSP de l'aperçu conservé.
- Le générateur SCORM existant n'a pas été modifié.

## Non validé dans cet environnement

- Exécution du vrai lecteur H5P Standalone dans Firefox.
- Réapparition du bouton natif H5P et comportement en plein écran natif.
- Lecture réelle des vidéos YouTube depuis GitHub Pages.
- Intégration des vidéos YouTube dans la fenêtre H5P/Game Map (toujours ouverte).

## Décision proposée

Livrer ce correctif comme **3.6 expérimental à contre-recetter**. Maintenir le lot 3 ouvert si la lecture intégrée H5P et la commande native sont des conditions obligatoires. Une solution plus complète pourra nécessiter un environnement de lecture servi sur une **origine dédiée**, distincte de celle de l'application GitHub Pages. Cela demanderait une revue de sécurité supplémentaire et un mode de distribution approprié.

## Dépôt manuel sur GitHub Web

Fichiers applicatifs à remplacer : `app.js`, `index.html`, `styles.css`, `src/preview-frame.js`.

Nouveau fichier applicatif : `src/youtube-preview.js`.

Tests et documentation à ajouter : `tests/youtube-preview.mjs`, `tests/youtube_preview_browser.py`, `docs/BILAN_CORRECTIF_LOT3_6.md`, `docs/CONTRE_RECETTE_LOT3_6.md`, `docs/evidence/lot3-6-tests.json` ; `tests/run_all.py` à mettre à jour.

**Aucune suppression.** L'archive « fichiers modifiés » respecte les chemins du dépôt. Ne pas déplacer les fichiers depuis leurs sous-dossiers.
