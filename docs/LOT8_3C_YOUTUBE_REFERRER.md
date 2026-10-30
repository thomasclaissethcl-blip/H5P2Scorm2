# Lot 8.3c : vidéo YouTube dans le monofichier H5P

**Périmètre :** amélioration conditionnelle de la politique HTTP Referer et diagnostic explicite de l'ouverture locale. Aucune modification SCORM, HTML multifichier ou du lecteur H5P Standalone 3.8.2.

## Fichier reçu et observations

Le H5P transmis contient 117 entrées ZIP, `H5P.Column 1.22` et `H5P.Video 1.6`. La source de la vidéo est `https://youtu.be/5ju4rFTRi0s`, de type `video/YouTube`. Aucun MP4/WebM local n'est contenu dans le fichier. Le lecteur H5P sollicite le script YouTube `https://www.youtube.com/iframe_api`.

Le fichier HTML d'essai a été généré à partir de ce H5P, avec le lecteur H5P Standalone 3.8.2 embarqué (143 ressources, environ 2,3 Mo en HTML).

## Diagnostic

Selon la documentation officielle YouTube, l'erreur `153` peut se produire si l'intégration n'envoie pas un en-tête HTTP `Referer` ou une identification client équivalente. En `file://`, le navigateur n'a pas d'origine web HTTP(S) appropriée à transmettre. Le problème peut également apparaître sur certaines combinaisons site/navigateur, même sur HTTP(S).

Cela ne signifie pas que les bibliothèques H5P sont absentes du monofichier. Le test Chromium sous document intégré `about:blank` confirme l'initialisation du lecteur et une tentative de chargement de l'API YouTube ; l'accès externe a été bloqué dans le banc d'essai. La lecture YouTube n'est donc **pas validée**.

## Correctif 8.3c

- Pour un H5P contenant une source YouTube, le générateur injecte `<meta name="referrer" content="strict-origin-when-cross-origin">` dans l'en-tête du document exporté. La politique est absente pour les contenus sans YouTube.
- Si le document est ouvert via `file://`, un avertissement précise que l'intégration YouTube peut être refusée, et recommande de tester **le même HTML** depuis une adresse HTTPS.
- Le diagnostic `window.H5PConverterSinglefileAudit()` fournit `documentProtocol`, `youtubeRequiresHttpOrigin` et `youtubeLocalFileUnsupported`.
- Les autres exports et le lecteur 3.8.2 ne sont pas modifiés.

**Limites :** la balise meta ne fabrique aucun Referer sous `file://` et ne garantit pas l'acceptation par YouTube sur HTTPS. La vidéo reste externe et nécessite Internet. Pour un H5P totalement utilisable hors ligne, un fichier vidéo local légalement disponible (MP4/WebM) doit être intégré au H5P source.

## Recette utilisateur

1. Ouvrir `H5P_VIDEO_YOUTUBE_MONOFICHIER_TEST.html` directement depuis le disque : vérifier l'affichage H5P et le message sur l'ouverture locale. La lecture YouTube peut échouer, ce n'est pas un échec du correctif 8.3c.
2. Publier **ce même fichier, sans le modifier**, sur un site HTTPS (GitHub Pages, site web statique, ressource HTML autorisée).
3. Ouvrir l'adresse HTTPS, vérifier que la vidéo se lance *à l'intérieur de l'activité H5P*. Ne pas retenir un renvoi vers YouTube comme une réussite.
4. Refaire le contrôle des images Memory et la lecture d'un MP4 local monofichier : ces comportements doivent rester inchangés.
5. Si la vidéo échoue également sous HTTPS, relever le code d'erreur affiché, le navigateur, et l'adresse du site hôte (sans données personnelles).

## Vérifications réalisées

- 50 suites automatisées réussies (49 héritées + nouveau test conditionnel YouTube).
- Jeu de données réel H5P.Column/H5P.Video chargé, H5PStandalone initialisé dans Chromium via document `about:blank` ; tentative de requête YouTube constatée. Requête bloquée dans le banc d'essai.
- `file://` et `http://localhost` non accessibles dans ce Chromium administré (`ERR_BLOCKED_BY_ADMINISTRATOR`), ce qui ne permet pas de reproduire l'en-tête Referer réel.
- Aucune validation de lecture sur véritable HTTPS ou dans Firefox.

## Références

- YouTube, documentation officielle « Embed videos & playlists » : https://support.google.com/youtube/answer/171780
- YouTube IFrame Player API, erreur 153 : https://developers.google.com/youtube/iframe_api_reference
- H5P, plateformes externes : https://help.h5p.com/hc/en-us/articles/25222952007069-Supported-External-Video-Platforms
