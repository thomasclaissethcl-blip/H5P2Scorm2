# Réglages Moodle recommandés

Ce profil vise à favoriser la reprise de la même tentative avec les packages produits par H5P vers SCORM 1.2.

| Réglage | Valeur recommandée |
| --- | --- |
| Nombre de tentatives | 1 |
| Forcer une nouvelle tentative | Non |
| Verrouillage après la dernière tentative | Non |
| Forcer terminé | Non |
| Mode aperçu | Désactivé |
| Auto-commit | Oui |
| Mastery score overrides status | Non |
| Auto-continue | Non |
| Affichage | Fenêtre actuelle |
| Navigation Moodle | Masquée si le H5P fournit sa propre navigation |
| Méthode d'évaluation | Note la plus haute |
| Note maximale | 100 |

## Reprise stricte

Utiliser le profil `SCORM 1.2 strict, recommandé` dans le convertisseur. La limite opérationnelle est fixée à 4000 caractères pour `cmi.suspend_data`.

## Moodle étendu 64K

Ce profil n'est à utiliser que si l'administration Moodle autorise explicitement une capacité étendue de `cmi.suspend_data`. Il est fourni dans la V1 mais n'a pas été validé dans l'environnement de test du projet.
