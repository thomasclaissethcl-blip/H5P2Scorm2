# Lot 8.3b : images H5P Memory et médias monofichier

Date : 30 octobre 2026. Base : lot 8.3a, accepté avec réserves.

## Objet et périmètre

- Corriger les images non affichées par H5P.MemoryGame dans le document HTML unique. Le composant fabrique des chaînes HTML (`<img src="...">`, `style="background-image:..."`) ; un parseur DOM peut déclencher le chargement avant l'insertion de ces éléments dans la page.
- Compléter la résolution des attributs d'images/styles et des ressources locales audio/vidéo déjà embarquées dans le H5P.
- Distinguer explicitement, à l'export et à la lecture, les fichiers réellement présents et les références vidéo externes, notamment YouTube. Refuser l'export expérimental si un média local référencé par le contenu est absent de l'archive.
- Préserver les formats SCORM et HTML multifichier ainsi que la mise en page responsive du lot 7d.

## Modifications

- `src/html-singlefile-player.js` : réécriture préalable des URL lors de l'affectation de `innerHTML` ou `insertAdjacentHTML`, complétée par les interceptions `setAttribute`, `style`, les propriétés médias et un observateur DOM. Le résolveur ne convertit que les ressources présentes dans le conteneur.
- `src/html-singlefile-player.js` : `inspectOfflineMedia(bundle)` examine les références audio/vidéo du JSON du contenu, leurs fichiers locaux et les URLs tierces ; rapport intégré dans l'audit de lecture et avertissement dans la page.
- `app.js` : message clair dans le journal pour les médias externes ; refus explicite lorsque le H5P référence un média local absent.

## Preuves réalisées

- 49/49 tests automatisés sur le code source final.
- Chromium (contexte `about:blank` injecté, sans réseau) avec le vrai Game Map 1.9.8 : 3 requêtes d'images échouaient avant le correctif et 0 après, sans erreur JavaScript, lecteur `ready`.
- Chromium (sans réseau) avec un H5P.Video 1.6 réel, et un fichier MP4 local synthétique : lecteur `ready`, `videoWidth:160`, `readyState:4`, `error:null`, ressource via `blob:`, aucune requête de ressource échouée.
- Game Map : les deux sources YouTube sont signalées en tant que médias distants, 0 fichier vidéo local décelé.
- `file://` n'a pas pu être testé dans l'environnement de contrôle : navigation locale bloquée par l'administrateur Chromium. Moodle, Firefox et l'hébergement utilisateur restent à qualifier.

## Réserves importantes

- Une URL YouTube stockée dans `content.json` ne constitue pas une vidéo MP4/WebM intégrée. Hors réseau, elle ne peut pas être lue. Le contrôle de l'erreur YouTube `153` ou des restrictions d'intégration reste dépendant du navigateur, de l'origine et du fournisseur. Le lecteur de secours hors du H5P ne remplace pas les interactions synchronisées de H5P.InteractiveVideo.
- La vidéo locale MP4 a été testée sur H5P.Video, pas sur H5P.InteractiveVideo. Aucun paquet H5P.InteractiveVideo incluant un MP4 local n'était disponible pour cette campagne. Le fonctionnement de ses marqueurs, questionnaires et synchronisations reste à vérifier.
- La présence d'aucun média externe détecté dans `inspectOfflineMedia()` n'est pas une certification générale de fonctionnement hors ligne : certaines bibliothèques peuvent charger des ressources dynamiques supplémentaires.
- Le format monofichier est toujours un essai non qualifié pour tous les contenus ; plafond à 32 Mio de ressources décompressées. Le HTML multifichier reste la solution recommandée pour les cas incompatibles.

## Non-régression

Aucun changement dans `src/html-multifile.js`, `src/scorm-scoring.js`, `src/scorm-score-plan.js`, `src/export-layout.js`, le lecteur de référence ou les styles. `app.js` change uniquement dans le traitement de génération monofichier expérimental. Les tests du socle continuent de réussir.
