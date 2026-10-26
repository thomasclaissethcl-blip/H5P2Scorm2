# Plan de démarrage du développement H5P Converter

**Date :** 23 octobre 2026  
**Base fonctionnelle :** CDC-H5PC-001, version 1.0, statut « proposition de référentiel initial à valider »  
**Base logicielle :** `H5P2SCorm-main.zip`, application 1.0.1  
**Objet :** tracer le gel technique du socle et ordonner le premier incrément, sans modifier le périmètre contractuel.

## A. Constat initial vérifié

Archive source : `H5P2SCorm-main.zip`  
SHA-256 de l'archive : `eb40096d4bd5b977f1bec6efd8dd4f2ae14fe27345811bd51a22e0269aa7e1b2`

Environnement de contrôle : Python 3.13.5 et Node.js 22.16.0.

Commandes exécutées depuis la racine de l'application et résultats :

```text
python tests/validate_fixtures.py
  OK poc-valid.h5p
  OK poc-language.h5p
  OK poc-resume.h5p
  OK poc-missing-dependency.h5p
  OK poc-invalid.h5p
  OK poc-coreapi-future.h5p (blocage Core API attendu)
python tests/validate_release.py
  Release 1.0.1 cohérente : OK
python tests/validate_ui.py
  Interface V1 : OK
node tests/runtime-smoke.mjs
  Runtime SCORM généré : OK
```

**Portée :** tests automatisés de la base, insuffisants à eux seuls pour garantir la lecture de H5P variés, la sécurité d'une visionneuse ou les résultats dans des LMS réels.

Observations de la base : interface statique, `app.js` monolithique, JSZip 3.10.1 chargé via CDN, lecteur H5P Standalone 3.8.2 choisi pendant la génération SCORM, plafond Core API déclaré 1.28 dans `RUNTIME_PROFILE.json`. Les tests de non-régression doivent être conservés.

## B. Statut de la phase 0 (CDC section 13)

| Travail | État au 23/10/2026 |
| --- | --- |
| Identifier l'archive initiale et son empreinte | Fait |
| Lancer les tests automatisés initiaux | Fait |
| Préserver une copie immuable de l'archive | Source initiale conservée ; intégration dans dépôt à réaliser |
| Consigner un inventaire exhaustif des fonctionnalités de la V1 | À compléter en dépôt à partir du CDC et des fichiers source |
| Définir des scénarios manuels reproductibles avec vrais H5P | À faire |
| Décider du dépôt et de la branche de développement | À faire |

La phase 0 n'est donc pas intégralement achevée.

## C. Premier incrément de développement : architecture et visionneuse

### Lot 1 : branche de référence et garde-fous

- Conserver l'archive originale et son SHA-256 dans le registre des sources.
- Créer une branche de travail ou un clone de développement séparé.
- Ajouter des scripts reproductibles pour lancer les quatre familles de tests.
- Ajouter le cahier des charges, le registre des décisions et une matrice de traçabilité exigences/tests.

**Sortie attendue :** mêmes résultats de test sur le nouveau dépôt ; aucun changement fonctionnel.

### Lot 2 : extraction prudente des modules

- Séparer analyse ZIP, analyse H5P et résolution des dépendances du contrôle UI.
- Créer les contrats de données de l'analyse et du choix de moteur.
- Isoler localisation et personnalisation CSS pour les réutiliser dans l'aperçu.
- Extraire progressivement le traitement des ressources et le profil moteur, sans changer les valeurs par défaut de la V1.

**Exigences concernées :** IMP-01 à IMP-06, CMP-01 à CMP-07, PER-01 à PER-04, NFR-04, REC-24.

**Sortie attendue :** non-régression des tests existants ; nouveaux tests unitaires sur les modules extraits.

### Lot 3 : premier prototype de visionneuse

- Proposer un rendu H5P interactif utilisant, initialement, le profil H5P Standalone 3.8.2 de la base.
- Concevoir l'isolement du JavaScript tiers avant toute exécution ; tester les frontières d'origine et de communication.
- Ajouter l'aperçu, le réinitialiser et permettre de l'agrandir.
- Afficher les erreurs de lecture sans masquer l'analyse statique.
- Appliquer le CSS importé et le CSS saisi, ainsi que la localisation conservatrice déjà disponible.
- Ne transmettre aucun événement de prévisualisation à un LMS réel.

**Exigences concernées :** VIS-01 à VIS-05, VIS-07, CMP-06, PER-01 à PER-04, NFR-01 et NFR-02.

**Sortie attendue :** prévisualisation démontrée sur au moins un fichier H5P complet et compatible, avec preuve des tests d'isolation et de non-régression.

### Lot 4 : validation de l'incrément

- Exécuter toutes les vérifications automatisées et ajouter les nouveaux tests dédiés à la visionneuse.
- Tester des H5P réels et consigner bibliothèque/version/moteur/navigateur et résultat.
- Contrôler que le SCORM préexistant n'a pas changé de comportement.
- Marquer les cas non testés comme « non testés », jamais comme « compatibles ».

**Critères de validation :** REC-01 à REC-06, REC-21 et REC-24 dans la mesure de leur périmètre ; exigences de sécurité VIS-04 et NFR-01 satisfaites ; traces de test publiées.

## D. Suite, après validation du premier incrément

1. Moteur de notation indépendant et reproductible, priorité au score global natif, agrégation conditionnelle, reprise, pont LMS. Scénarios Game Map et Interactive Book, recette Moodle et second LMS (phase 2).
2. Exports HTML multifichier puis monofichier, traitement en lot et rapports (phase 3).
3. Simplification de l'interface, mode avancé, accessibilité, stabilisation et recette finale (phase 4).

## E. Informations nécessaires avant la recette finale, sans bloquer le début

- Corpus représentatif de vrais fichiers H5P, notamment Game Map et Interactive Book, avec versions et paramètres de notation.
- Environnement Moodle de recette et second LMS SCORM 1.2 à déterminer.
- Décision sur la licence du projet, les moteurs redistribuables et les configurations matérielles de référence.
- Validation explicite du CDC version 1.0 ou ouverture des arbitrages de la section 19.

## F. Discipline de développement

Chaque modification doit préciser les identifiants d'exigence couverts, les tests ajoutés ou mis à jour, les limitations connues et l'état de recette. Un composant « implémenté » n'est pas automatiquement « vérifié ». Une défaillance bloquante du lecteur ou de la sécurité interdit de déclarer la visionneuse prête.
