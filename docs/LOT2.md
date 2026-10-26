# Lot 2 : extraction des modules H5P

**Livraison :** 26 octobre 2026  
**Base :** bundle Git et fichiers sources livrés au lot 1  
**Branche :** `development/phase-1-modules`  
**Version publique de l'application :** 1.0.1 conservée, évolution interne non publiée.

## Réalisé

1. Création de `src/runtime-profiles.js` : profil par défaut partagé et fonctions de contrôle Core API, sans modifier le lecteur retenu.
2. Création de `src/h5p-dependencies.js` : dépendances H5P déclarées, transitivité et absence de bibliothèque.
3. Création de `src/h5p-analysis.js` : lecture, inventaire, langue et diagnostic H5P indépendants du DOM.
4. Adaptation de `app.js` : les paramètres issus de l'interface sont transmis explicitement à l'analyseur ; l'export SCORM utilise toujours le même résultat d'analyse.
5. Ajout des scripts au HTML dans l'ordre requis, sans introduire de serveur applicatif ou d'outillage de compilation.
6. Mise à jour des tests de version, de l'interface et du runtime SCORM ; nouveaux tests de parité avec le code de l'archive V1 immuable.
7. Test complémentaire dans Chromium avec simulateur de chargement ZIP, sans prétendre valider la décompression réelle ou l'exécution d'un H5P.

## Résultats

- Dix suites automatisées sur dix réussies.
- Parité de résultat sur les six fixtures H5P existantes (valides, invalides, dépendances manquantes, Core API future, localisation et reprise).
- Cas supplémentaires vérifiés : cycles de dépendances, dépendances transitives absentes, exigence Core API supérieure et invalide.
- Trois scénarios d'interface Chromium avec décompresseur simulé, tous réussis.
- Aucun changement de format d'export SCORM ou de stratégie de score n'a été effectué dans ce lot.

## Restant à valider

Le test navigateur utilise un substitut de JSZip. Il ne valide ni le chargement réel de ressources depuis un serveur, ni l'ouverture de médias H5P, ni l'export SCORM dans Moodle. L'environnement a refusé la navigation navigateur vers `file://` et localhost ; l'essai Chromium documenté utilise donc l'injection locale des scripts. Aucun test de visionneuse n'est revendiqué.

La phase 0 conserve ses vérifications manuelles et arbitrages non effectués. Les exigences IMP-03, CMP-01, CMP-02, CMP-04 et CMP-05 sont **en développement**, et non intégralement vérifiées. Le cahier des charges n'a pas été modifié.

## Suite

**Lot 3 : première visionneuse H5P isolée**, avec un document préalable validant son modèle de sécurité et un prototype de résolution locale des ressources. Prévoir les vrais H5P représentatifs (notamment Game Map et Interactive Book) pour la recette ultérieure.
