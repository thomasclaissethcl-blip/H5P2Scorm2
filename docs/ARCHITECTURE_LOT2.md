# Architecture du socle modulaire, lot 2

**Date :** 26 octobre 2026  
**Référence :** CDC-H5PC-001 v1.0, phase 1, premier incrément.

## Modules désormais isolés

| Fichier | Responsabilité | Dépendance interne |
| --- | --- | --- |
| `src/runtime-profiles.js` | Profil H5P figé, version Player, plafond Core API déclaré, normalisation, comparaison et diagnostic des exigences Core API | Aucune |
| `src/h5p-dependencies.js` | Lecture des dépendances `preloaded` et `dynamic`, identifiants, graphe transitif, détection de dépendances absentes | Aucune |
| `src/h5p-analysis.js` | Lecture des métadonnées du ZIP via l'interface de JSZip, inventaire, validation héritée, langue, rattachement au profil et diagnostic structuré | Modules précédents |
| `app.js` | État et commandes UI, affichage du diagnostic, personnalisation/localisation existante et génération SCORM 1.2 existante | Trois modules précédents, JSZip lors de l'import |

Les trois modules sont des scripts JavaScript classiques (`globalThis.H5PConverterModules`) chargés dans l'ordre ci-dessus avant `app.js` : leur utilisation ne requiert ni bundler ni module ES, et reste compatible avec un hébergement statique. Aucun des trois modules n'a besoin de `document`, `navigator` ou du réseau pour fonctionner. Les paramètres dépendant de l'interface (langue forcée, langue du navigateur, catalogue de traductions) sont transmis explicitement à `analysis.analyzeH5P()`.

L'interface d'appel du nouvel analyseur est :

```js
H5PConverterModules.analysis.analyzeH5P(jszipInstance, {
  runtimeProfile: H5PConverterModules.compatibility.defaultProfile,
  languageOverride: 'fr',
  browserLanguage: 'fr-FR',
  coreTranslations: { fr: { H5P: {} } }
});
```

Le résultat garde la structure de la V1.0.1 (`ok`, `issues`, `warnings`, `libraries`, `inventory`, `missing`, `required`, `runtimeCompatibility`, etc.). Un contrat plus strict, immuable et versionné reste à définir avant la visionneuse et les traitements par lots.

## Contraintes et limites connues

- Un **seul** profil moteur est fourni : `h5p-standalone-3.8.2-core-1.28`. Le catalogue de données est extensible mais **aucun moteur supplémentaire n'est opérationnel** dans ce lot. Le plafond Core API 1.28 demeure une assertion conservatrice du projet, non une certification de compatibilité pour toutes les bibliothèques.
- Le diagnostic des dépendances et les garde-fous ZIP ont été **déplacés sans évolution de leur couverture**. Le contrôle de chemins, de duplications et de fichiers référencés reste à renforcer pour satisfaire intégralement IMP-03 et IMP-04.
- `app.js` conserve la génération SCORM héritée, la logique actuelle de score, la localisation, les styles et la partie interface. Il n'y a toujours **ni visionneuse, ni agrégation composite, ni export HTML, ni traitement batch**.
- Le navigateur charge encore JSZip et récupère H5P Standalone sur CDN lors de l'export, comme dans la V1. Les contraintes d'autonomie et de sécurité du CDC ne sont pas encore toutes satisfaites.
- La compatibilité est caractérisée au moyen du profil et d'une exigence déclarée, pas encore par une matrice de tests de H5P réels dans des moteurs différents.

## Contrôle de non-régression

`python tests/run_all.py` réalise 10 suites comprenant une comparaison de l'analyse V1 avec la nouvelle analyse **sur les six archives H5P de test réelles**. Le test construit la même interface ZIP en mémoire pour les deux moteurs, et compare toutes les propriétés sérialisables des résultats. Des cas synthétiques supplémentaires couvrent les dépendances cycliques/transitives et les Core API incompatibles ou invalides. Le runtime SCORM reste testé avec les scénarios automatisés de la V1.

`python tests/browser_smoke.py` (facultatif, requiert Playwright et Chromium installé) vérifie l'exécution des modules et l'état de l'interface dans Chromium avec **JSZip simulé**, sans navigation HTTP et sans produire de SCORM. Le chargement des scripts depuis un hébergement réel et la décompression ZIP complète restent à tester manuellement.
