# Contre-recette du lot 5.1, GitHub Pages + Moodle

Reference : CDC-H5PC-001. Navigateur de reference Firefox. Utiliser de preference un espace Moodle de test et un compte apprenant de test, sans donnees personnelles.

Les controles de score dans le carnet de notes doivent etre effectues avec une nouvelle tentative ou une activite SCORM distincte des tests precedents pour eviter les effets d'une ancienne note.

| Identifiant | Manipulation | Resultat attendu |
|---|---|---|
| L51-01 | Ouvrir le site GitHub Pages, importer Game Map 1.9.8 | Chargement et diagnostic inchanges |
| L51-02 | Tester plein ecran H5P et plein ecran du convertisseur | Hotspots, fenetres, defilement inchanges |
| L51-03 | Modifier puis retirer le CSS de l'aperçu | Effet immediat sans perte de progression |
| L51-04 | Ouvrir les videos YouTube via le lecteur de secours | Image et son toujours disponibles |
| L51-05 | Verifier l'emission des evenements xAPI dans la visionneuse | Evenements `answered`, `progressed` etc. selon le contenu |
| L51-06 | Generer un SCORM du Game Map avec profil 3.8.2 | ZIP produit, manifeste et contenu presentes |
| L51-07 | Importer le nouveau SCORM dans Moodle, demarrer sans terminer | Pas de reussite declaree a tort |
| L51-08 | Terminer Game Map par sa commande de fin ; consulter la note dans Moodle | Score normalise sur 100, statut final adapte a la politique et au seuil ; comparer au score reel H5P |
| L51-09 | Effectuer une seconde tentative Game Map en environnement de test | Score non double par des xAPI dupliques, et politique Moodle de tentatives respectee |
| L51-10 | Exporter une activite simple notee et la terminer dans Moodle | Score et statut conformes au contenu (non-regression) |
| L51-11 | Essayer Interactive Book avec plusieurs exercices et noter les evenements globaux | Score global utilise lorsqu'il existe ; sinon aucun score aggrege invente. Documenter le statut |
| L51-12 | Basculer vers les lecteurs 3.8.1 et 3.8.0 | Export toujours bloque ; 3.8.2 restaure l'export |
| L51-13 | Importer un fichier H5P Core API incompatible et un H5P avec dependance manquante | Export bloque avec un diagnostic comprehensible |

Consigner pour chaque cas : reussi / echoue / non teste, version Moodle et navigateur, nom et version H5P, note H5P attendue, note SCORM obtenue, statut Moodle obtenu, messages d'erreur.

Ne pas conclure a la fiabilite d'une agregation automatique des sous-exercices sur la base de ce lot : le comportement reste volontairement conservateur lorsque leur perimetre est inconnu.
