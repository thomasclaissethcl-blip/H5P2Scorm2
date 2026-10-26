# Compatibilité observée

Cette matrice décrit des tests réellement effectués ou automatisés. Elle ne constitue pas une garantie universelle pour toutes les versions de bibliothèques H5P.

| Contenu | Chargement | Localisation | Score/statut | Reprise | Niveau de validation |
| --- | --- | --- | --- | --- | --- |
| Fixture minimale V1 | Oui | Oui | Oui | Non applicable | Automatisé |
| Fixture de localisation | Oui | Oui | Non applicable | Non applicable | Automatisé |
| Fixture de reprise | Oui | Non applicable | Oui | Oui | Automatisé |
| Game Map | Oui | Oui | Oui | Oui | Test manuel sous Moodle |
| Package avec dépendance manquante | Bloqué comme attendu | Non applicable | Non applicable | Non applicable | Automatisé |
| Package invalide sans h5p.json | Bloqué comme attendu | Non applicable | Non applicable | Non applicable | Automatisé |
| Fixture Core API 1.29 | Bloquée comme attendu avec runtime déclaré 1.28 | Non applicable | Non applicable | Non applicable | Automatisé |

## Runtime de référence

- H5P Standalone : 3.8.2 ;
- plafond H5P Core API déclaré : 1.28 ;
- politique : blocage si une bibliothèque d'exécution requise demande une API supérieure.

Le plafond est une déclaration maintenue par le projet et doit être réévalué lors de toute mise à jour de H5P Standalone.

## À tester ensuite

- Interactive Book ;
- Course Presentation ;
- Interactive Video ;
- Branching Scenario ;
- Question Set ;
- Drag and Drop ;
- Fill in the Blanks ;
- un second LMS SCORM 1.2.
