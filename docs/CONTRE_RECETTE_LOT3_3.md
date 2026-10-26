# Contre-recette ciblée, lot 3.3

Navigateur : Firefox récent, ordinateur. Application : GitHub Pages.

| Test | Manipulation | Attendu | Résultat |
|---|---|---|---|
| CR3.3-01 | Agrandir Game Map puis passer en plein écran sans cliquer la carte | Carte entièrement visible en hauteur, pas de déformation ni de défilement vertical imposé par sa taille | À tester |
| CR3.3-02 | Utiliser deux hotspots puis réduire et agrandir | Alignement inchangé, clics et progression fonctionnels | À tester |
| CR3.3-03 | Appliquer `.h5p-game-map-map { outline: 8px solid magenta !important; }` | Bordure visible sans réinitialisation | À tester |
| CR3.3-04 | Effacer cette règle CSS | Bordure disparaît immédiatement, progression conservée | À tester |
| CR3.3-05 | Importer un CSS local contenant la même règle | Même effet que le CSS saisi | À tester |
| CR3.3-06 | Vérifier les messages `CSS`, `css-child-ready`, `fullscreen-info` dans le diagnostic | Messages présents et valeurs relevées sans ambiguïté | À tester |
| CR3.3-07 | Rechercher le bouton natif Game Map | Relever présent/absent ; noter `H5P.fullscreenSupported` | À tester |
| CR3.3-08 | Autoriser YouTube puis lancer une vidéo dans la carte | Si refus, relever les lignes `CSP` et conserver « échoué » | À tester |
| CR3.3-09 | Générer un SCORM | Génération inchangée, paquet produit | À tester |

Le lot 3 reste ouvert tant que CSS et vidéo intégrée ne sont pas validés ou qu'une limitation explicitement acceptée n'est pas documentée.
