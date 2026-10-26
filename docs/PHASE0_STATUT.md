# Suivi de la phase 0, gel du socle

**Référence :** CDC-H5PC-001, section 13 ; plan de démarrage, section B/C.  
**Lot 1 :** exécution technique terminée et vérifiée, sans changement fonctionnel.

| Action | Situation | Preuve |
| --- | --- | --- |
| Conserver une référence V1.0.1 immuable | Réalisé | `baseline/H5P2SCorm-main-v1.0.1.zip`, SHA-256 et `main` Git |
| Reproduire les tests de la V1 | Réalisé | `docs/evidence/lot1-tests.json`, six contrôles réussis |
| Vérifier l'identité du code initial | Réalisé | `docs/evidence/lot1-source-integrity.json`, 21 fichiers identiques |
| Séparer la branche de développement | Réalisé localement | `development/phase-0-socle`, bundle Git joint à la livraison |
| Établir un script de test unique | Réalisé | `tests/run_all.py` |
| Préparer CI GitHub Actions | Configurée, non exécutée à distance | `.github/workflows/regression.yml` |
| Documenter les fonctionnalités initiales | Inventaire technique rédigé | `docs/INVENTAIRE_V1.md` |
| Ajouter registre des décisions | Réalisé | `docs/DECISIONS.md` |
| Décliner les exigences et les recettes | Réalisé, verdicts non revendiqués | `docs/TRACEABILITE.csv` et `docs/RECETTES.csv` |
| Définir scénarios manuels | Rédigés, non exécutés | `docs/RECETTE_MANUELLE.md` |
| Tester de vrais H5P variés en navigateur | En attente du corpus et des essais | MAN-04 à MAN-09 |
| Valider des exports dans Moodle et un second LMS | Non effectué | REC-18 et REC-19 |
| Approuver le CDC et arbitrer licence | En attente de décision du responsable du projet | DEC-005 et DEC-006 |

La **phase 0 est techniquement préparée**, mais n'est pas déclarée intégralement réceptionnée tant que les vérifications manuelles applicables et les arbitrages d'acceptation ne sont pas réalisés. Le lot 2 peut débuter sur cette base, avec contrôle strict de la non-régression.
