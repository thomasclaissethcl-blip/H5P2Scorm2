# Bilan de livraison : lot 4, incrément 1

Date : 26 octobre 2026. Base : code source validé lot 3.6.

## Périmètre développé

- Catalogue de profils documenté et versionné, avec moteur 3.8.2 actif.
- Versions 3.8.1 et 3.8.0 visibles uniquement comme candidates non qualifiées.
- Panneau de compatibilité ouvert à la demande, comprenant les versions exactes
  des bibliothèques embarquées et les exigences Core API déclarées.
- Rapport JSON local de compatibilité et matrice CSV initiale.

## Non-régression

- 16/16 tests automatisés réussis, rapport dans `docs/evidence/LOT4_1_TESTS.json`.
- Simulation navigateur de l'interface sur trois cas : accepté, API trop récente,
  dépendance manquante, réussie.
- Simulation Chromium avec analyse des métadonnées du Game Map réellement fourni :
  identification de H5P.GameMap 1.9.8, 37 bibliothèques et export JSON réussi.
- Comparaison du code 3.6 : les fichiers sources du Player, de la visionneuse,
  des vidéos YouTube, de l'analyse H5P, des dépendances et du profil `RUNTIME_PROFILE.json`
  sont identiques ; la logique de génération SCORM et son pont restent inchangés.

**Limites :** ce lot ne met pas en service d'autre version de moteur, ne certifie
pas tous les H5P, et n'ajoute pas de score composite. Pas de recette de lecture
réelle avec le nouveau panneau dans Firefox/GitHub Pages, ni de test Moodle.

## Décision avant diffusion

Recette manuelle demandée conformément à `docs/CONTRE_RECETTE_LOT4_1.md`.
La version 3.6 demeure le repli en cas de régression.
