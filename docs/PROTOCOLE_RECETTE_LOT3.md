# Protocole de recette utilisateur : première visionneuse H5P

**Objectif :** vérifier le prototype sur des fichiers H5P authentiques, sans valider prématurément la conformité complète.

## Préparation

1. Décompresser l'archive de livraison du lot 3.
2. Dans le dossier `H5P-Converter`, exécuter `python -m http.server 8000` (ou `py -3 -m http.server 8000` sous Windows).
3. Ouvrir `http://localhost:8000` dans Chrome, Edge ou Firefox, avec Internet accessible pour les bibliothèques téléchargées (JSZip et H5P Standalone version 3.8.2).
4. Préparer au moins trois vrais fichiers `.h5p` **avec leurs bibliothèques**, dont un exercice simple noté, un Interactive Book et un Game Map si disponibles. Ne pas utiliser de contenus confidentiels ou d'origine douteuse pour cette préversion.

## Scénarios et résultat attendu

| ID | Action | Résultat attendu | Résultat observé |
| --- | --- | --- | --- |
| V3-01 | Importer un H5P simple autonome | Diagnostic favorable ; aperçu affiché sans manipulation supplémentaire | À renseigner |
| V3-02 | Répondre à une question | Interaction utilisable ; état de l'exercice évolue | À renseigner |
| V3-03 | Cliquer sur « Recommencer » | Nouvelle tentative et interface H5P réinitialisée | À renseigner |
| V3-04 | Cliquer sur « Agrandir » | Aperçu utilisable en plein écran et sortie possible | À renseigner |
| V3-05 | Ajouter `body { background-color: #f0f0ff; }` au CSS saisi | Changement visible dans l'aperçu après actualisation | À renseigner |
| V3-06 | Importer un fichier CSS | Le CSS se combine avec les règles saisies | À renseigner |
| V3-07 | Importer un H5P déclaré incompatible | Export bloqué et aperçu non lancé ; message de diagnostic | À renseigner |
| V3-08 | Après un aperçu, générer un SCORM et l'ouvrir dans Moodle | Score et statut identiques à la V1, sous réserve du type H5P ; aucune donnée d'aperçu transférée | À renseigner |

## Compte rendu

Pour chaque anomalie, noter le nom et la version du navigateur, le type de bibliothèque H5P et sa version, l'ID du scénario, le comportement observé et le message indiqué sous « Visionneuse H5P ». Ajouter une capture si disponible.

**Important :** un échec de l'aperçu est une anomalie à analyser, pas une preuve que le package H5P est invalide. Un score observé dans le journal xAPI de l'aperçu ne prouve pas que Moodle recevra correctement ce score.
