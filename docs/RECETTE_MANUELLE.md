# Scénarios de recette manuelle pour les prochaines étapes

**Statut général : non exécutés dans le lot 1.** Les fixtures POC intégrées dans le dépôt sont utiles pour l'analyse, mais ne constituent pas un corpus H5P réel représentatif. Les tests ci-dessous ne doivent jamais être déclarés réussis sur la seule base des vérifications structurelles.

## V1, essais de non-régression à reproduire avant la refonte

**MAN-01, import simple.** Ouvrir l'application via un serveur HTTP local ; importer `test-fixtures/poc-valid.h5p`. Vérifier le diagnostic et la disponibilité du bouton de génération. Conserver capture, navigateur et résultat.

**MAN-02, dépendance absente.** Importer `test-fixtures/poc-missing-dependency.h5p`. Vérifier un message explicite et le blocage de la génération.

**MAN-03, version Core API hors profil.** Importer `test-fixtures/poc-coreapi-future.h5p`. Vérifier le blocage pour exigence API 1.29 > 1.28.

**MAN-04, personnalisation.** Avec un vrai H5P exécutable, importer une feuille CSS et compléter par du CSS saisi. Vérifier que ces styles sont intégrés dans le SCORM après génération.

**MAN-05, LMS.** Installer un SCORM généré à partir d'un vrai H5P noté dans Moodle. Relever le score xAPI observé, le score Moodle, le statut et la reprise après fermeture/réouverture. Renseigner versions LMS/navigateur/H5P et captures. *En attente d'un LMS accessible et de contenus réels.*

## Lot 3, visionneuse

**MAN-06, aperçu réel.** Importer un H5P autonome (bibliothèques et ressources incluses). Vérifier démarrage, interaction, audio/vidéo et absence d'accès réseau externe imprévu.

**MAN-07, remise à zéro.** Effectuer plusieurs interactions, réinitialiser et vérifier que l'état de la tentative affichée est initial.

**MAN-08, CSS de l'aperçu.** Comparer le rendu CSS dans la visionneuse et dans le fichier exporté à versions de moteur égales.

**MAN-09, isolation.** Importer une fixture hostile réservée aux tests de sécurité. Vérifier l'impossibilité d'accéder aux données des autres fichiers, au DOM principal et aux capacités non autorisées. Ne lancer que dans un environnement isolé et contrôlé.

## Convention de compte rendu

Pour chaque essai : `id`, date, fichier SHA-256, bibliothèque/version, lecteur/version, navigateur/version, LMS/version si applicable, procédure, résultat attendu/observé, capture ou journal, verdict `réussi/échoué/non testé`, limitation constatée. La matrice des 24 critères figure dans `RECETTES.csv`.
