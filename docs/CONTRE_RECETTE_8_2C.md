# Contre-recette ciblée : correctif 8.2c

**Une seule anomalie à revérifier :** la barre de progression du convertisseur, qui restait à 35 % malgré le téléchargement.

1. Installer la mise à jour GitHub Web du correctif, puis actualiser le convertisseur avec **Ctrl + F5** pour recharger `app.js` et le module des ressources.
2. Importer le même fichier Game Map H5P que pour la recette précédente et cliquer sur **« Prototype ressources (non interactif) »**.
3. Vérifier que le fichier `.html` se télécharge, et que la barre **dans l'application** atteint **100 %** avec le libellé **« Terminé »**. L'ancienne position à 35 % ne doit plus persister.
4. Vérifier que les boutons « Générer le SCORM », « Générer le HTML multifichier » et « Prototype ressources » sont réactivés.
5. Contrôle facultatif : ouvrir le document `.html` obtenu et constater que son diagnostic interne atteint 100 % et que les aperçus d'images sont présents, comme en 8.2b.

**À communiquer :** « Barre 100 % : OK / KO » et, s'il y a lieu, l'étape affichée ou le message du journal.

Les quatre autres points de la recette 8.2b sont déjà déclarés OK. Les marges ordinateur/mobile et le fonctionnement SCORM/HTML multifichier sont conservés sans modifications.
