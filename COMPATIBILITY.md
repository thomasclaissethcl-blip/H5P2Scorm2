## Réserve de compatibilité au lot 8.4b

- `H5P.InteractiveBook` SST406 : monofichier recetté par l'utilisateur au lot 8.4a dans le périmètre des contrôles effectués.
- `H5P.InteractiveVideo` avec MP4 local : **qualification non achevée**. Un inventaire statique est intégré au journal du générateur. Déclenchement horodaté des interactions et reprise de la lecture non testés sur un vrai fichier avec toutes ses bibliothèques.
- YouTube en monofichier : vidéo externe non embarquée ; lecture HTTPS confirmée par l'utilisateur ; `file://` peut échouer à cause de la politique de référent. Ne pas déclarer la vidéo consultable hors ligne.

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

## HTML monofichier expérimental, lot 8.4a

| Contenu | Résultat observé | Limite |
| --- | --- | --- |
| H5P.Video, MP4 local | Chargement vidéo démontré dans Chromium, hors réseau | Firefox et autres navigateurs à confirmer |
| H5P.Video, YouTube | Lecture rapportée par l'utilisateur sur Moodle en ligne | Ouverture locale `file://` non garantie, Internet indispensable |
| Game Map avec Memory | Images corrigées et recette utilisateur positive sur les scénarios testés | Tous les médias externes ne sont pas autonomes |
| Interactive Book SST406 | Chapitre 1 ouvert et interface initialisée dans Chromium hors réseau | Exercices, scores et fin du livre non entièrement testés |
| Interactive Video avec MP4 local | Non qualifié | Corpus de recette spécifique encore nécessaire |

Les avertissements techniques du monofichier sont uniquement dans le journal de génération. Les erreurs fatales restent visibles afin d'éviter une page blanche inexpliquée.
