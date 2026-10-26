# Composants tiers

Cette application s'appuie notamment sur les composants suivants.

## H5P Standalone 3.8.2

Projet : `tunapanda/h5p-standalone`  
Source : https://github.com/tunapanda/h5p-standalone  
Licence annoncée par le package : MIT.

Le convertisseur récupère une distribution figée de cette version pendant la génération et l'intègre au package SCORM produit. La version ne doit pas être remplacée par `latest` dans une release stable. Le profil correspondant est documenté dans `RUNTIME_PROFILE.json`.

## JSZip 3.10.1

Projet : `Stuk/jszip`  
Source : https://github.com/Stuk/jszip  
Licence annoncée par le package : MIT ou GPL-3.0-or-later.

JSZip est utilisé dans le navigateur pour lire les packages H5P et construire les archives SCORM.

## Bibliothèques H5P contenues dans les fichiers utilisateurs

Chaque fichier H5P peut embarquer ses propres bibliothèques, licences, médias et métadonnées. Le convertisseur les recopie dans le package SCORM. Il appartient au propriétaire du contenu de vérifier qu'il dispose des droits nécessaires pour leur réutilisation et leur diffusion.
