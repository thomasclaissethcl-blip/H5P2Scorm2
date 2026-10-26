# Gel technique du socle (phase 0, lot 1)

- **Référentiel** : `CDC-H5PC-001`, version 1.0, statut « proposition à valider ».
- **Source immuable jointe** : `baseline/H5P2SCorm-main-v1.0.1.zip`.
- **Source d'origine fournie** : `H5P2SCorm-main.zip`.
- **SHA-256 commun** : `eb40096d4bd5b977f1bec6efd8dd4f2ae14fe27345811bd51a22e0269aa7e1b2`.
- **Application initiale** : version `1.0.1`, H5P Standalone `3.8.2`, plafond H5P Core API déclaré `1.28`.
- **État initial** : commit Git `main`, puis branche `development/phase-0-socle` créée localement.

## Protocole de non-régression

Depuis la racine, lancer `python tests/run_all.py`. Le script exécute six contrôles : analyse des fixtures H5P, version de release, structure UI, runtime SCORM, syntaxe JavaScript et intégrité de l'archive d'origine.

La preuve du lot 1 figure dans `docs/evidence/lot1-tests.json`. Le contrôle `archive-source` porte uniquement sur l'archive d'origine. Il **n'interdit pas** de modifier le code lors des lots suivants ; il garantit la disponibilité d'un état de comparaison et de retour arrière.

La branche `main` du bundle Git restitue le code source original sans les ajouts du lot 1. La branche `development/phase-0-socle` ajoute les fichiers de gouvernance, la CI et l'outillage de tests, sans modifier `app.js`, `index.html`, `styles.css`, `VERSION` ou les anciens tests.

## Limites de la preuve

- Tests structurels et unitaires sur fixtures de démonstration uniquement.
- Pas d'essai contrôlé dans Firefox, Chrome, Safari ou Edge avec un H5P réel.
- Pas de vérification de l'exécution dans Moodle ou un second LMS.
- Absence de couverture des événements de sous-contenus composites dans les tests initiaux.
- Dépendances CDN utilisées par l'interface V1, aucun test d'autonomie hors ligne.
- Test de la visionneuse non applicable à ce lot : elle n'existe pas encore.

## Passage au lot 2

Au prochain lot, commencer par une première extraction de module à périmètre constant, ajouter ses tests propres, puis exécuter intégralement la suite et comparer le comportement à l'état présent. Une dépendance versionnée ne doit pas être augmentée sans preuve de compatibilité.
