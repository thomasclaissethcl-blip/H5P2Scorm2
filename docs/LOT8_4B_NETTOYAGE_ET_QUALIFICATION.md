# Lot 8.4b : suppression des parcours techniques obsolètes

Date : 30 octobre 2026. Base : 8.4a validée par l'utilisateur (10/10).

## Décision

Les boutons **Diagnostic HTML monofichier** et **Prototype ressources (non interactif)** étaient des étapes de recherche. Ils n'ont plus de fonction nécessaire dans le parcours courant. Les retirer simplifie l'étape Génération conformément à UX-01 à UX-06 du cahier des charges.

Leur code exclusif a été supprimé. La fonction `collect()` du module `src/html-singlefile-resources.js` est conservée, car elle assure la collecte, la validation des chemins et l'encodage des ressources du monofichier interactif. Le lecteur `src/html-singlefile-player.js` reste le générateur du document exécutable.

## Livrables de code

Modifiés : `app.js`, `index.html`, `src/html-singlefile-resources.js`, `src/html-singlefile-player.js`.

Supprimé : `src/html-singlefile-preflight.js`.

Tests obsolètes supprimés : `tests/html-singlefile-preflight81.mjs`, `tests/html-singlefile-resources82b.mjs`, `tests/singlefile-progress82c.mjs`, `tests/singlefile-progress82c-browser.py`, `tests/singlefile-prototype-browser.py`. Les bancs de test qui chargeaient le module abandonné ont été actualisés. Les garanties du collecteur ont été maintenues avec des tests indépendants du prototype.

## Interactive Video : nouvelle étape de qualification

Ajout de `inspectInteractiveVideo()` au module `src/html-singlefile-player.js` et d'un diagnostic informatif dans le journal de génération. L'inventaire vérifie statiquement le type, les sources vidéo, les interactions déclarées et les médias absents. Il ne remplace pas une lecture réelle avec des interactions déclenchées au bon moment.

La compatibilité d'un vrai H5P Interactive Video avec fichier MP4 local n'est **pas démontrée** par ce lot, faute de fixture de recette complète avec ses bibliothèques. Aucun correctif spéculatif n'a été apporté au lecteur H5P, aux exports SCORM, au HTML multifichier ou à la synchronisation vidéo.

## Vérifications

- 50/50 suites automatiques dans `tests/run_all.py` ;
- 3 scénarios Chromium d'interface simulée : contenu valide, Core API incompatible, dépendance manquante ;
- tests de présence des trois sorties, absence des anciens contrôles, protection des chemins, limites et progression du collecteur ;
- tests unitaires synthétiques de l'inventaire Interactive Video. Ils ne prouvent pas la lecture réelle.

## Limites

L'installation GitHub Pages, les exports réels après modification et la lecture d'Interactive Video restent à valider par l'utilisateur. Les anciennes fiches de recette sont conservées dans `docs/` comme références historiques seulement.
