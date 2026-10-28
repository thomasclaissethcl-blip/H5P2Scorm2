# Contre-recette utilisateur : lot 7 HTML multifichier

**Statut :** à exécuter sur la version publiée, avec les contenus H5P réels.

Cocher « OK », « KO » ou « Non testé ». Ne pas déduire « OK » d'un résultat obtenu uniquement sur SCORM.

| ID | Test réalisable sans console | Résultat |
|---|---|---|
| L7-01 | Depuis GitHub Pages, importer un H5P valide ; les deux boutons d'export sont proposés. | À tester |
| L7-02 | Générer le HTML multifichier ; un ZIP est téléchargé. | À tester |
| L7-03 | Décompresser le ZIP ; `index.html`, `player/`, `h5p/`, `custom/` sont présents. | À tester |
| L7-04 | Publier tous les fichiers sur un hébergement statique HTTP(S) : activité visible, navigation et interactions actives. | À tester |
| L7-05 | Déplacer le même mini-site dans un sous-répertoire et ouvrir son `index.html` : images, sons, styles, bibliothèques et actions se chargent. | À tester |
| L7-06 | Depuis une page web du site, ouvrir le mini-site dans un lien ou une iframe autorisant JavaScript : interaction vérifiée. | À tester |
| L7-07 | Moodle, ressource **Fichier** : importer, décompresser, définir `index.html` principal ; l'activité fonctionne sous les réglages de sécurité du site. | À tester |
| L7-08 | Game Map 1.9.8 : rendu de la carte, clics, navigation, plein écran lorsque l'hôte le permet. | À tester |
| L7-09 | Interactive Book SST406 : chapitres, Question Sets, réponses et boutons de finalisation fonctionnent. | À tester |
| L7-10 | Avec CSS importé et CSS saisi, le rendu HTML suit les mêmes règles que l'aperçu et le SCORM. | À tester |
| L7-11 | Le HTML ne cherche pas à envoyer une note ni une progression à Moodle ; aucun résultat LMS n'est attendu. | À tester |
| L7-12 | Exporter un SCORM comme auparavant et vérifier score, statut, reprise dans Moodle. | À tester |
| L7-13 | Sélectionner un moteur expérimental 3.8.0 ou 3.8.1 : les deux boutons d'export sont indisponibles, puis réactivés avec 3.8.2. | À tester |

**Information pratique :** pour L7-07, certains sites Moodle refusent volontairement le JavaScript dans les ressources Fichier. Si cela se produit, indiquer « KO - limitation de l'hébergement » avec le message affiché. Ce résultat ne prouve pas à lui seul un défaut de l'export HTML. Tester aussi sur un hébergement web statique classique.

**Important :** le fichier `index.html` ne doit jamais être extrait seul du ZIP. Toutes ses dépendances doivent rester dans leurs dossiers. La procédure du futur HTML monofichier sera différente.
