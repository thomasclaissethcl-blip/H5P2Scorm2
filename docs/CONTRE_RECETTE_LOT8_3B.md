# Contre-recette 8.3b : mémoire et médias du HTML monofichier

**Objectif :** confirmer les deux corrections et préserver le comportement validé. Les résultats sont à indiquer « OK », « KO » ou « non testé ». Aucune console de développement n'est nécessaire.

## Groupe A : H5P.MemoryGame dans Game Map

1. Après mise à jour de GitHub Pages, importer votre Game Map d'origine et cliquer sur **HTML monofichier interactif (essai)**. Vérifier que le fichier se télécharge et que la barre se termine.
2. Ouvrir le HTML téléchargé dans Firefox et accéder à l'étape Memory. Vérifier que les images des cartes (recto et verso si configurés) sont visibles.
3. Révéler les cartes, jouer et vérifier que les interactions Memory fonctionnent normalement.
4. Désactiver le réseau puis rouvrir le HTML local. Vérifier l'affichage des images Memory et les interactions qui ne dépendent pas d'un service distant.

## Groupe B : médias vidéos

5. Ouvrir l'exemple `H5P_VIDEO_MP4_LOCAL_MONOFICHIER_8_3B.html`, de préférence après téléchargement sur le disque, puis vérifier que la courte vidéo colorée se lit **sans connexion Internet**. Elle est synthétique et ne contient aucun contenu pédagogique.
6. Facultatif : importer `H5P_VIDEO_MP4_LOCAL_RECETTE_8_3B.h5p` dans le convertisseur, générer un monofichier, vérifier que la même vidéo est lisible hors ligne.
7. À partir de Game Map, vérifier que le journal de génération **avertit de deux vidéos YouTube externes**. Leur lecture hors ligne n'est pas attendue : les vidéos ne sont pas présentes dans l'archive H5P. Ne pas juger ce contrôle en fonction d'un lecteur YouTube qui refuserait `file://`.
8. Si vous disposez d'un H5P.InteractiveVideo avec MP4 intégré dans le H5P : tester la lecture, la pause et les interactions synchronisées. Sinon indiquer « non testé ». Ce scénario n'est pas encore qualifié.

## Groupe C : non-régression

9. Vérifier qu'un HTML multifichier Game Map s'ouvre et reste interactif depuis le site dummy ou votre hébergement.
10. Vérifier qu'un SCORM 1.2 existant conserve son score et son statut dans Moodle, et que les marges ordinateur/mobile sont conservées.

**Règle de décision :** les contrôles 1 à 7, 9 et 10 sont attendus dans votre environnement. Le contrôle 8 est une réserve explicitement ouverte tant qu'un vrai H5P.InteractiveVideo avec vidéo locale n'a pas été testé. L'autonomie des vidéos YouTube n'est pas revendiquée.
