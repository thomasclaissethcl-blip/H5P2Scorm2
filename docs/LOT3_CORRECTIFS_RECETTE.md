# Lot 3.1 : correctifs après recette sur GitHub Pages

**Date :** 26 octobre 2026
**Référence :** CDC-H5PC-001 v1.0 (VIS-01 à VIS-07, PER-01 à PER-03)
**Base :** Lot 3, branche `development/phase-1-preview`
**Statut :** correctif technique livré, recette H5P réelle encore à confirmer.

## Retour utilisateur initial

- 8 contrôles sur 10 déclarés réussis sur GitHub Pages avec Game Map ; événements xAPI et CSS non validés.
- Anomalies : erreur `localStorage` dans l'iframe à origine opaque ; fenêtre trop basse ; plein écran déformé ; images et vidéos manquantes ; CSS non appliqué dynamiquement.
- Contenu réel fourni : `fantasy-map-2-181 (1).h5p`, `H5P.GameMap` **1.9.8**, Core API **1.28**, 990 entrées ZIP, ~10,9 Mo décompressés. Les 27 ressources images/audio directement référencées dans `content.json` sont toutes présentes dans l'archive. Deux vidéos du contenu sont des liens YouTube, et ne sont donc pas intégrées à l'archive.

## Correctifs introduits

1. **Stockage** : API `localStorage` et `sessionStorage` simulées en mémoire dans l'iframe isolée, sans persistance après rechargement. `sandbox="allow-scripts"` reste inchangé, aucun `allow-same-origin` ajouté.
2. **Images dynamiques** : réécriture des chemins `url(...)` affectés par `backgroundImage`, `background`, `style.setProperty`, attributs `style`, `srcset`, et images insérées par `innerHTML`. Ne couvre pas encore toutes les API graphiques possibles (canvas, WebGL, composants tiers).
3. **CSS dynamique** : `postMessage` authentifié avec le jeton de l'aperçu et insertion d'une feuille de style en fin de document. Modifications dans le champ CSS ou import de fichier CSS sans réinitialiser la tentative ; la réinitialisation volontaire reste possible.
4. **Dimensions** : hauteur de base augmentée et responsive, mesure plafonnée du contenu, mode agrandi occupant l'écran sans forcer la transformation des proportions, fermeture dédiée et touche Échap. Autorisation du plein écran natif pour les contenus H5P qui le proposent (`allow="fullscreen"`, `fullScreen: true`).
5. **YouTube** : accès réseau **interdit par défaut**, avec une case facultative « Autoriser les vidéos YouTube externes ». Lorsque cochée, la visionneuse redémarre et les domaines requis pour les iframes/scripts YouTube sont autorisés de manière restreinte. Cette fonction est **expérimentale** : l'iframe demeure sandboxée à origine opaque ; certains lecteurs ou réglages de confidentialité peuvent encore empêcher la lecture. L'activation contacte potentiellement YouTube.
6. **Diagnostic xAPI** : indicateur visible pour signaler si le dispatcher xAPI est disponible, écoute avant ou après initialisation du lecteur, messages de verbes et de scores lorsqu'ils sont émis. La capture des événements des sous-contenus n'est pas garantie et doit être vérifiée sur les vrais H5P.

## Tests effectués sur le correctif

- 13/13 suites existantes : réussies.
- Test Chromium avec **lecteur simulé** : chargement, interactions, accès mémoire `localStorage`, images blob et images de fond, CSS mis à jour sans redémarrage, isolation de l'iframe, réinitialisation : réussis.
- 3 scénarios d'intégration de l'interface avec JSZip simulé : réussis.
- Profil de restriction réseau testé statiquement : YouTube interdit par défaut, profils CSP plus permissifs uniquement après consentement.
- Contrôle de présence des médias locaux directement référencés par le Game Map fourni : 27/27.

## Ce qui reste à vérifier chez l'utilisateur

- Disparition effective du message `localStorage` avec Game Map 1.9.8.
- Affichage de toutes les images et audio internes, y compris fonds de carte et illustrations des étapes.
- Lecture des deux vidéos YouTube après activation explicite, selon les restrictions du navigateur (résultat non garanti).
- Forme correcte du Game Map dans la fenêtre agrandie et en plein écran natif.
- CSS importé et CSS saisi, appliqués pendant que la carte est ouverte et sans effacer la progression.
- Événements xAPI sur au moins deux exercices notés.
- Non-régression de la génération SCORM 1.2 existante ; la qualité de la notation composite relève d'un autre lot.

## Limites importantes

La protection contre du JavaScript H5P intentionnellement hostile n'a pas fait l'objet d'un audit de sécurité complet. Le correctif ne rend pas les contenus YouTube autonomes et n'ajoute aucune bibliothèque H5P. L'absence de tests intégrés avec le vrai H5P Standalone 3.8.2 interdit de considérer la recette utilisateur comme acquise.
