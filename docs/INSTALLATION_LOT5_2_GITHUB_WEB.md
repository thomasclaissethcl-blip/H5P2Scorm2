# Installation manuelle du lot 5.2 avec GitHub Web

**Prérequis :** lot 5.1 installé, accepté et sauvegardé dans un commit Git.

## Fichiers requis pour l'application

| Chemin | Action |
|---|---|
| `app.js` | Remplacer |
| `index.html` | Remplacer |
| `src/scorm-scoring.js` | Remplacer |
| `src/scorm-score-plan.js` | Ajouter |

**Aucune suppression.** Les autres modifications concernent des tests et la documentation, qui peuvent aussi être déposés pour conserver les preuves.

Dans GitHub Web, transférer les fichiers dans leurs répertoires respectifs, valider le commit, attendre la publication de GitHub Pages, puis actualiser fortement la page. Si l'application affiche « Modules H5P absents », vérifier que `src/scorm-score-plan.js` est bien présent avec la même casse et que son script est chargé avant `app.js`.

L'option **Notation composite expérimentale (mode avancé)** est **décochée par défaut**. La laisser décochée pour reproduire le comportement du lot 5.1.

## Retour arrière

Restaurer `app.js`, `index.html` et `src/scorm-scoring.js` du commit 5.1. Le nouveau fichier `src/scorm-score-plan.js` peut rester inutilisé ; aucune suppression urgente n'est requise.

## Vérification

La commande facultative `python tests/run_all.py --report docs/evidence/lot5-2-tests.json` permet de relancer les contrôles automatisés. La conformité des scores Moodle exige une recette réelle distincte.
