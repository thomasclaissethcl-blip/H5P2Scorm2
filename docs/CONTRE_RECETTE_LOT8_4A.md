# Contre-recette lot 8.4a

## A. Présentation et journal de génération

1. Avec un H5P Video YouTube, générer « HTML monofichier interactif (essai) ». Vérifier que le fichier se télécharge.
2. Vérifier que le journal du convertisseur indique explicitement qu'une vidéo YouTube externe nécessite Internet et que `file://` peut échouer.
3. Ouvrir le HTML depuis le poste : aucun avertissement technique du convertisseur ne doit recouvrir ou précéder l'activité H5P. Le lecteur YouTube peut toujours afficher **son propre** message d'erreur (limitation fournisseur).
4. Publier exactement le même fichier sur une URL HTTPS : vérifier que la vidéo fonctionne dans le lecteur H5P, comme dans l'essai Moodle antérieur, sans nouvelle bannière technique.

## B. Livre interactif monofichier

5. Ouvrir le fichier `INTERACTIVE_BOOK_SST406_MONOFICHIER_ESSAI.html` directement depuis votre poste dans Firefox. Vérifier l'ouverture du livre.
6. Cliquer sur « Commencer », parcourir deux chapitres et vérifier images, accordéons et questions. Signaler toute ressource manquante.
7. Réaliser quelques exercices et vérifier le comportement de navigation, sans attendre de remontée de note à Moodle (l'HTML n'est pas un SCORM).
8. Sur un hébergement HTTP(S), vérifier le même document dans son intégralité, y compris les chapitres suivants, et confirmer l'absence de requête visible vers une bibliothèque H5P externe.

## C. Non-régression

9. Générer un SCORM habituel, vérifier l'ouverture et les scores dans Moodle.
10. Générer un HTML multifichier, vérifier l'ouverture de Game Map ou d'un contenu simple.

Les contrôles 5 à 8 sont ouverts : les tests automatisés ne remplacent pas une recette Firefox ni une qualification exhaustive du livre.
