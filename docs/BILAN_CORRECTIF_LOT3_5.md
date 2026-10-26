# Correctif ciblé du lot 3.5 : défilement des fenêtres de Game Map

Date : 26 octobre 2026. Référence : CDC-H5PC-001, exigences VIS-01, VIS-02, VIS-04.

## Constat issu de la contre-recette 3.4

L'affichage en mode « Agrandir » et « Plein écran » est maintenant jugé satisfaisant pour le ratio de la carte. Toutefois, lorsque la fenêtre d'un exercice dépasse la hauteur disponible, son contenu ne peut plus être parcouru verticalement. Le diagnostic produit `Game Map : redimensionnement H5P natif sollicité`, tandis que `H5P.fullscreenSupported=false` et `document.fullscreenEnabled=false` dans l'iframe isolée. Les vidéos YouTube intégrées restent indisponibles.

## Cause documentée dans le Game Map 1.9.8 transmis

La feuille `H5P.GameMap-1.9/dist/h5p-game-map.css` de l'archive de référence ne rend scrollable `.h5p-game-map-overlay-dialog-instance-container` que lorsque cet élément se trouve sous un ancêtre `.h5p-fullscreen` :

```css
.h5p-fullscreen .h5p-game-map-overlay-dialog-instance-container {
  flex: 1;
  overflow-y: auto;
  padding-inline-end: var(--h5p-theme-spacing-s);
  scrollbar-gutter: stable;
}
```

Dans le parcours H5P natif, H5P Core met en place cet état lors du passage en plein écran. Le correctif 3.4 faisait appel à `main.setFullscreen()` pour la géométrie de la carte, mais sans rétablir l'état de présentation `h5p-fullscreen` attendu par sa feuille de style.

## Modifications

- `src/preview-frame.js` : activer et désactiver la classe `h5p-fullscreen` sur l'élément HTML de la visionneuse lorsque Game Map est en mode agrandi, et appliquer la même opération dans son éventuelle iframe interne.
- Conserver le redimensionnement propre à Game Map et l'isolation existante (`sandbox="allow-scripts"`). Aucune transformation `scale()` générale.
- Éviter la répétition des mêmes messages de violation CSP ; lorsqu'un chemin `preview.invalid` est refusé, en afficher également le chemin (tronqué), pour aider au diagnostic.
- `tests/preview_fit_height_browser.py` : ajouter la vérification que des fenêtres d'exercices dépassant la hauteur disponible sont réellement scrollables dans le document principal et dans un document H5P enfant, puis que le mode normal rétablit les styles initiaux.

## Tests réalisés

- 13/13 contrôles du `tests/run_all.py` réussis.
- Test ciblé Chromium `tests/preview_fit_height_browser.py` réussi avec un Game Map **simulé** : défilement actif dans les deux contextes, proportions inchangées des hotspots, restauration à la sortie, iframe toujours isolée.
- Non testé sur Firefox ni avec le vrai Game Map de l'utilisateur dans cette exécution ; contre-recette nécessaire.

## Problèmes non résolus

- Le bouton de plein écran natif de H5P reste indisponible dans cet environnement iframe ; les propriétés `fullscreenEnabled=false` et `H5P.fullscreenSupported=false` sont observées. Le présent correctif ne prétend pas les modifier.
- La lecture YouTube intégrée reste non fonctionnelle. Il faudra examiner séparément l'interaction entre sandbox opaque, chargements externes, règles CSP et l'API IFrame YouTube. Aucun assouplissement implicite de l'isolation n'a été introduit.
- Certains chemins virtuels sur `preview.invalid` demeurent bloqués par CSP. Le nouveau message aide à identifier ces ressources ; il ne les rend pas automatiquement accessibles.

## Déploiement manuel GitHub Web

Remplacer uniquement `src/preview-frame.js`. Mettre à jour facultativement `tests/preview_fit_height_browser.py`, puis ajouter ce bilan et le fichier de contre-recette dans `docs/`. Ne rien supprimer. Forcer l'actualisation du site publié avant d'effectuer la recette.

Statut : correctif développé et testé sous Chromium simulé ; validation fonctionnelle Firefox / Game Map réel en attente.
