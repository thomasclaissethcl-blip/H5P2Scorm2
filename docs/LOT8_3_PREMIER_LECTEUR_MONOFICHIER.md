# Lot 8.3a, premier HTML monofichier H5P interactif (essai)

**Référentiel :** CDC-H5PC-001 V1.0, HMO-01 à HMO-05.  
**Base de développement :** correctif 8.2c accepté.  
**Date :** 29 octobre 2026.  
**Statut :** prototype interactif développé, non qualifié pour un usage généralisé.

## Objet

Un nouveau bouton « HTML monofichier interactif (essai) » produit un document HTML unique comprenant les ressources d'un H5P et H5P Standalone 3.8.2. La lecture est réalisée par un résolveur de ressources propre au projet, qui intercepte `fetch`, les requêtes XHR, les liens de scripts/styles, des ressources multimédias et les références internes CSS. Aucun composant Lumi ou Logiquiz n'a été copié ou intégré.

L'export réutilise la copie du H5P, sa localisation, le CSS libre et les marges responsive de la version 7d. Les modules SCORM et HTML multifichier restent inchangés.

## Qualification effective

- **48/48 tests automatisés réussis**, incluant 2 nouvelles suites.
- **Chromium en page injectée (sans navigation)** : H5P.AdvancedText réel initialisé, son texte pédagogique affiché ; état `ready` et aucune erreur JS.
- **Chromium en page injectée** : Game Map 1.9.8 réelle, carte et commandes affichées ; clic sur l'étape « Welcome » puis texte d'étape visible. État `ready`, aucune exception JS. Trois requêtes `about://blank/h5p/content/images/*.jpeg` non résolues dans ce banc d'essai, même si la carte principale est visible.
- La génération de démonstration de la Game Map utilise 1 016 ressources (12 231 574 octets), pour environ 16,4 Mio de HTML.
- Le navigateur de qualification bloque toute navigation `file://`, `data:` ou `http(s)`, même interceptée. Par conséquent, la lecture du monofichier **après double-clic et en HTTP(S) n'a pas été testée** ici. La recette utilisateur reste nécessaire.

## Limites et décisions

- Le format est clairement étiqueté **ESSAI / non qualifié**, non présenté comme export HTML monofichier conforme à toutes les exigences HMO.
- Les ressources dépassant 32 Mio sont refusées avec un message et le repli « HTML multifichier » ; certaines activités complexes peuvent dépasser ce seuil.
- Des bibliothèques H5P peuvent employer des requêtes ou manipulations DOM hors du périmètre de ce résolveur ; les iframes et contenus externes, YouTube, les médias lourds et le stockage local dépendent des politiques de sécurité du navigateur/hôte.
- `file://` et HTTP(S) doivent faire l'objet de **recettes séparées**. Une réussite sous Chromium en page injectée n'est pas une preuve de portabilité universelle.
- Dans les contextes sans localStorage, un stockage uniquement en mémoire est utilisé pour éviter un crash ; aucune reprise persistante n'est garantie. Aucun pont SCORM ou LMS n'est présent.
- Les contenus H5P embarqués contiennent du JavaScript actif : ne convertir et ouvrir que des fichiers H5P de provenance fiable.
- Le prototype de ressources **non interactif** et les formats SCORM / HTML multifichier restent disponibles et fonctionnent indépendamment.

## Suites attendues

Recette 8.3a sur la Game Map et un contenu simple, directement sous `file://`, sous HTTP(S) et éventuellement via une ressource Moodle « Fichier ». Compléter ensuite la prise en charge des médias et des contenus composites (Interactive Book), puis seulement envisager de déclarer HMO-01 à HMO-05 satisfaits.
