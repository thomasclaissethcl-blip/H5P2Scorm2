# Contre-recette simplifiée : quatre marges (7c) et préparation HTML unique (8.1)

Pour chaque ligne : **OK / KO / Non testé**. Ne pas utiliser de console de développement.

## A. Apparence commune aux exports

1. Dans « Apparence », les champs **Marge haute, Marge basse, Marge gauche, Marge droite** sont visibles et vides par défaut, avec le champ **Largeur maximale** inchangé.
2. Les quatre marges vides : le HTML multifichier conserve l'affichage obtenu auparavant.
3. Les quatre marges vides : le SCORM conserve l'affichage obtenu auparavant.
4. Saisir **largeur 960, haut 12, bas 48, gauche 24, droite 36** : le HTML présente quatre espaces distincts et le contenu est centré dans la zone disponible.
5. Avec les mêmes valeurs, le SCORM dans Moodle affiche les quatre marges comme attendu.
6. Sur un écran étroit (par exemple téléphone), l'activité ne déborde pas horizontalement du seul fait de ces réglages.
7. Saisir **0** dans chaque champ : aucun espace n'est ajouté par ces réglages ; saisir une valeur invalide, comme -1 ou 2500, bloque la génération avec un message clair.
8. Le CSS importé ou saisi librement reste fonctionnel dans les deux sorties.
9. Game Map reste utilisable en HTML, notamment ses interactions et le plein écran.
10. SCORM Moodle : score, statut et reprise inchangés dans une activité usuelle.
11. Un HTML multifichier placé dans le sous-répertoire du site dummy fonctionne toujours.

## B. Préparation du format monofichier

12. Après import d'un H5P, le bouton **Diagnostic HTML monofichier** permet de télécharger un fichier `.json` (sans générer de HTML).
13. Le JSON indique `qualification.supported: false` et `qualification.recommendedFormat: "html-multifile"` : il ne présente pas la compatibilité monofichier comme acquise.
14. La génération HTML multifichier et la génération SCORM restent accessibles indépendamment du diagnostic.

**Le HTML monofichier exécutable n'est pas à tester dans le lot 8.1**, puisque le résolveur dédié et la qualification `file://` / HTTP(S) sont encore à construire.

Pour commencer la recette, utiliser par exemple un H5P Game Map déjà testé et, pour le SCORM, une tentative Moodle de test. L'HTML multifichier peut être placé dans le site dummy du lot 7.
