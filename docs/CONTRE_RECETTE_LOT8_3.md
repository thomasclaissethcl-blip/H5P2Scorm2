# Contre-recette 8.3a : monofichier interactif expérimental

**Préparation** : installer le correctif 8.3a sur la base 8.2c, actualiser GitHub Pages avec Ctrl+F5. Utiliser de préférence le fichier H5P Game Map déjà testé, puis un H5P simple. Ne pas publier les essais dans un cours de production.

Indiquer **OK**, **KO** ou **Non testé** pour chaque contrôle. Aucun outil de développement n'est requis.

1. Le convertisseur conserve les boutons SCORM, HTML multifichier, diagnostic et prototype de ressources.
2. Un nouveau bouton « HTML monofichier interactif (essai) » apparaît après analyse d'un H5P valide.
3. Le clic génère un unique fichier `.html` portant le suffixe `-html-monofichier-ESSAI.html`.
4. La barre de progression atteint 100 %, les boutons deviennent à nouveau disponibles.
5. En ouvrant directement le fichier par double-clic (`file://`), l'activité H5P s'affiche, ou une impossibilité explicite recommande l'HTML multifichier. Préciser lequel.
6. Dans ce fichier, la carte Game Map est visible avec ses étapes et images.
7. Le clic sur l'étape « Welcome » ouvre le panneau d'introduction et son texte.
8. Une autre étape avec image ou question s'ouvre correctement. Tester les commandes essentielles.
9. Les marges ordinateur/mobile, le CSS et le plein écran se comportent comme prévu.
10. Publier **le seul fichier HTML** sur un site HTTP(S) dans un sous-répertoire ; vérifier la lecture et les images.
11. Un export HTML multifichier de la même Game Map continue à fonctionner.
12. Un export SCORM de la même Game Map continue à transmettre score et statut dans Moodle.
13. Les médias externes (ex. YouTube) sont identifiés comme dépendants du réseau ; ne pas assimiler leur échec à un défaut de ressource locale.
14. Si une activité ne fonctionne pas ou dépasse la limite de 32 Mio, le message d'erreur ou de refus invite à utiliser l'HTML multifichier.

**Réserves connues** : l'essai Chromium interne a montré trois requêtes d'images `about://blank/...` non résolues. `file://` et HTTP(S) ne sont pas certifiés. La reprise LMS n'existe pas en HTML simple.

**Décision attendue** : accepter ou refuser le prototype pour les H5P et les environnements réellement testés. Ne pas clôturer l'ensemble du lot 8 sur cette seule recette.
