# Installation du lot 5.1 via GitHub Web

Base obligatoire : lot 4.3 deja installe et valide. Faire d'abord un commit ou une copie de sauvegarde de cette version.

## Application

| Chemin | Operation |
|---|---|
| `app.js` | Remplacer |
| `index.html` | Remplacer |
| `src/scorm-scoring.js` | Ajouter (obligatoire) |

Les fichiers `tests/`, `docs/` sont recommandes pour conserver les preuves et disposer de la CI, mais ne sont pas requis pour lancer l'application.

**Aucune suppression de fichier.** Conserver les chemins et la casse. Le nouveau script doit etre present avant le chargement de `app.js`.

Sur GitHub Web : deplacer les fichiers extraits dans les dossiers existants, enregistrer le commit, attendre la fin du deploiement GitHub Pages, puis effectuer une actualisation forcee de la page.

Si la page indique « Modules H5P absents », verifier d'abord la presence de `src/scorm-scoring.js`, l'ordre des scripts dans `index.html` et le cache navigateur.

## Retour arriere

Restaurer `app.js` et `index.html` du commit 4.3. `src/scorm-scoring.js` devenu inutilise peut etre laisse temporairement dans le depot ou retire lors d'un nettoyage versionne ulterieur.

## Tests

`python tests/run_all.py --report artifacts/regression.json`

Le test manuel essentiel est L51-08 dans Moodle : constater le score et le statut apres l'action de fin de Game Map.
