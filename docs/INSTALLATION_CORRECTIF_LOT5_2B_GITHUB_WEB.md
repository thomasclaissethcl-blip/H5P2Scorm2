# Installation manuelle du correctif 5.2b dans GitHub Web

**Prérequis :** lot 5.2 présent sur GitHub Pages. Conserver le dernier commit validé avant de déposer les fichiers. Préférer une branche de correction puis fusionner après recette.

## Fichiers applicatifs à remplacer

| Chemin à la racine de la publication | Opération |
| --- | --- |
| `app.js` | Remplacer |
| `src/scorm-score-plan.js` | Remplacer |
| `src/scorm-scoring.js` | Remplacer |

**Aucun fichier applicatif à ajouter ou supprimer.** Les fichiers `tests/` et `docs/` de l'archive ciblée peuvent être ajoutés ou mis à jour pour conserver la traçabilité.

Dans GitHub Web, déposer les fichiers dans les répertoires indiqués, vérifier leur nom et la casse, valider le commit et attendre la fin du déploiement GitHub Pages. Actualiser ensuite fortement la page (Ctrl+F5).

## Vérification immédiate

1. Ouvrir le convertisseur et vérifier le lecteur H5P 3.8.2 et la lecture du Game Map de référence.
2. Charger l'Interactive Book « SST406 Dossier1 ».
3. Exporter sans cocher l'option expérimentale ; dans le ZIP obtenu, `score-plan-report.json` doit indiquer `experimentalAggregation:false` et `activePlan.enabled:false`.
4. Exporter en cochant l'option ; le rapport doit indiquer `experimentalAggregation:true`, `candidateScorePlan.enabled:true`, `activePlan.enabled:true`, `expectedSubContentIds` de longueur 7 et `ignoredNestedSubContentIds` de longueur 35.
5. Tester les scénarios de la contre-recette, notamment la remontée effective du score global natif dans Moodle.

## Retour arrière

Restaurer les trois fichiers applicatifs listés ci-dessus depuis le commit de référence du lot 5.2. Aucun fichier à supprimer pour le retour arrière.
