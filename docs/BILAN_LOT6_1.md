# Bilan de livraison, lot 6.1

**Statut :** développement terminé et tests techniques positifs ; recette utilisateur GitHub Pages/Moodle en attente.

**Référence contractuelle :** CDC-H5PC-001 v1.0, architecture (§ 7), compatibilité moteur CMP-04/CMP-06, robustesse NFR-04/NFR-05, non-régression REC-24 et préparation de HMF-01. Les exigences ne sont pas toutes closes par ce lot.

## Réalisé

1. Manifeste unique des 25 fichiers du lecteur H5P Standalone 3.8.2, réutilisable pour les exports futurs.
2. Copie H5P mutualisée vers le répertoire `h5p/` d'un paquet portable ; comportement historique conservé.
3. Tests de parité des chemins, de la copie, du refus des archives à chemins dangereux et des protections 5.3.
4. Contrôles du navigateur Chromium sur l'interface et les candidats expérimentaux.

**Aucun nouveau format d'export et aucun changement intentionnel de comportement côté utilisateur**. L'objectif est de réduire le risque des prochains lots.

## Tests réalisés

- 33/33 tests du lanceur automatisé.
- 4 essais navigateur ciblés (avec lecteur ou décompresseur simulé, sans garantie de lecture réelle).
- Exactitude des composants sensibles à partir des empreintes de 5.3.

## Restent ouverts

- L53-06 à L53-08 : vérifications techniques du diagnostic dans un véritable SCO Moodle.
- Contenus H5P complexes non représentés dans la campagne de tests automatisés.
- Qualification des versions alternatives de lecteur, HTML mono et multi, lots et second LMS.

**Décision recommandée :** recette courte sur Game Map, Interactive Book et export SCORM, puis poursuite du développement du moteur commun et de l'export HTML multifichier.
