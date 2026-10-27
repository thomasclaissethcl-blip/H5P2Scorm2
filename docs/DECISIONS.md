# Registre des décisions techniques et fonctionnelles

Les identifiants `DEC-nnn` sont permanents. Une décision proposée ou à valider n'est pas une approbation utilisateur.

| ID | État | Décision ou question | Motif / conséquence | Exigences |
| --- | --- | --- | --- | --- |
| DEC-001 | Technique appliquée | Travailler dans une branche locale séparée et garder `main` identique à l'archive V1 | Permet la comparaison et le retour arrière sans compromettre la V1 | NFR-04, REC-24 |
| DEC-002 | Technique appliquée | Conserver l'archive ZIP originale dans `baseline/`, contrôlée par SHA-256 | Traçabilité exacte de la source initiale | NFR-08, REC-23, REC-24 |
| DEC-003 | Technique appliquée | Lot 1 sans modification du runtime et de l'interface | Évite de confondre sécurisation du socle et évolution fonctionnelle | REC-24 |
| DEC-004 | Technique appliquée | CI locale et GitHub Actions couvrant les tests existants et l'archive source | Détecte les régressions visibles dans ces tests | REC-24 |
| DEC-005 | À valider | Approuver le CDC-H5PC-001 v1.0 comme référence normative | Version fournie initialement au statut de proposition | Gouvernance |
| DEC-006 | Ouverte | Choisir licence du code et contrôler les licences des moteurs redistribuables | Conditionne la diffusion publique | NFR-09 |
| DEC-007 | Ouverte | Identifier un corpus de H5P complets, dont Game Map et Interactive Book | Nécessaire pour la recette de compatibilité et de score | CMP-09, NOT-08 |
| DEC-008 | Ouverte | Définir l'accès Moodle et au second LMS SCORM 1.2 | Validation de bout en bout encore impossible | SCR-01, REC-18, REC-19 |
| DEC-009 | Ouverte | Choisir la stratégie d'isolation de la visionneuse après prototype de sécurité | H5P exécute du JavaScript tiers | VIS-04, NFR-01 |
| DEC-010 | Technique appliquée | Conserver des scripts classiques et un espace de noms `H5PConverterModules` | Rend l'analyse testable sans DOM et maintient le déploiement statique de l'interface actuelle | CMP-01, CMP-04, NFR-03 |
| DEC-011 | Technique appliquée | Un seul profil `h5p-standalone-3.8.2-core-1.28` jusqu'à validation de moteurs supplémentaires | Évite une revendication prématurée de compatibilité universelle ; la sélection multi-profils reste à développer | CMP-04, CMP-05, CMP-09 |
| DEC-012 | Technique appliquée | Comparer les résultats du nouvel analyseur à ceux de l'archive V1 immuable sur six fixtures | Prouve la non-régression sur le corpus actuel sans prétendre à une validation LMS | REC-01, REC-03, REC-04, REC-24 |

Tout nouvel arbitrage doit renseigner : date, responsable, version du CDC affectée, tests à revoir et justification. Les décisions appliquées ci-dessus concernent uniquement l'organisation du code local de ce lot.

| DEC-013 | Technique provisoire | Prototype d’aperçu via iframe `sandbox=allow-scripts`, origine opaque, ressources H5P transmises en mémoire, CSP restrictif | Limite l’accès de H5P à la page hôte et réutilise le lecteur de la V1 ; nécessite une validation avec des H5P réels et un audit spécifique des navigations et ressources dynamiques | VIS-01, VIS-04, NFR-01 |

| DEC-014 | Technique provisoire, lot 4.1 | Conserver 3.8.2 comme seul Player actif, tout en listant 3.8.1 et 3.8.0 comme candidats non qualifiés | La recette Game Map 3.6 est préservée ; une version publiée n'est pas une preuve de compatibilité. Conditions d'activation : assets exacts, versions Core API établies et tests réels. | CMP-03, CMP-04, CMP-05, CMP-09, REC-24 |

### DEC-L4.2-01 : expérimentation des lecteurs non qualifiés sans mise en danger du SCORM
- Date : 2026-10-27.
- Exigences : CMP-04, CMP-05, CMP-06, CMP-08, CMP-09, REC-24.
- Décision : présenter H5P Standalone 3.8.1 et 3.8.0 en mode avancé comme essais manuels de visionneuse uniquement. Le profil 3.8.2 reste l'unique sélection automatique et l'unique profil exportable. Bloquer l'export lorsque le lecteur d'essai est sélectionné ; retour explicite au profil 3.8.2 pour exporter.
- Justification : l'environnement de développement ne donne pas accès aux ressources CDN officielles pour certifier ces versions, et aucun test Firefox réel des candidats n'est encore disponible.
- Conséquences : fonctionnalité préparatoire de multi-moteur ; la qualification, la sélection automatique entre profils compatibles et les exports SCORM avec un autre moteur demeurent ouverts.
