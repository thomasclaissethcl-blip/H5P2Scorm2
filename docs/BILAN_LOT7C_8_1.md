# Bilan technique : correctif 7c et préparation du lot 8.1

Date : 29 octobre 2026. Référence fonctionnelle : lot 7b (recette utilisateur du correctif 7b encore à compléter). Cahier des charges : CDC-H5PC-001 v1.0, HMF-01 à HMF-04, HMO-01 à HMO-05, REC-08 et REC-09.

## Correctif 7c : quatre marges indépendantes

Dans l'étape **Apparence**, le champ unique « Marges autour du contenu » est remplacé par quatre champs facultatifs : **Marge haute**, **Marge basse**, **Marge gauche**, **Marge droite**, chacun exprimé en pixels, entier de **0 à 2000**. La largeur maximale existante de 1 à 10000 px et son centrage automatique sont conservés.

- Champ vide : aucun espace ajouté pour ce côté ; `0` : ajout nul. Les quatre champs sont indépendants.
- Les marges sont matérialisées par des `padding-*` sur la page hôte, pas par une modification du DOM H5P.
- Les marges gauche/droite utilisent `min(valeur_px,49vw)` pour éviter un débordement imputable aux seuls réglages sur un très petit écran. Ainsi une valeur de 2000 px peut être réduite sur mobile.
- `max-width` reste responsive et le conteneur est centré dans l'espace disponible **après application des marges**. Si gauche et droite sont différentes, le centre de la zone disponible diffère du centre de la fenêtre : c'est attendu.
- Les champs vides n'ajoutent aucune règle CSS. L'ancienne forme interne `marginPx` reste acceptée par `src/export-layout.js` pour éviter toute régression logicielle des outils 7b.
- Le plein écran natif et le CSS personnalisé restent indépendants. La visionneuse dans le convertisseur conserve sa propre mise en page.
- La configuration est reportée dans `generation-report.json` pour SCORM et HTML multifichier.

## Lot 8.1 : pré-diagnostic HTML monofichier

Un module `src/html-singlefile-preflight.js` inventorie, sans les exécuter : fichiers H5P, fichiers JS et CSS, poids décompressé connu, estimation minimale du volume après encodage base64, et échantillon de références HTTP(S) sans paramètres d'URL. Il signale les volumes importants. L'estimation exclut le lecteur H5P, les structures supplémentaires et les coûts de mémoire JavaScript ; elle n'est pas une mesure fiable du poids final.

Le bouton **Diagnostic HTML monofichier** de l'étape Génération télécharge un JSON, **sans fabriquer de HTML**. Les références HTTP(S) peuvent être des liens de crédits, non des dépendances de lecture ; le rapport ne les assimile pas systématiquement à des ressources indispensables.

**État de qualification : `supported:false`, `status:non-qualifie`.** L'exécution des bibliothèques H5P et des chargements dynamiques dans un fichier HTML unique, sous `file://` comme HTTP(S), n'a pas été qualifiée. Conformément à HMO-04, l'application n'émet pas de monofichier potentiellement inutilisable : l'HTML multifichier est le repli proposé. Le lot 8 n'est donc **pas encore achevé**.

Étape future 8.2 : résolveur des ressources et chargements dynamiques, prototype sur contenu simple, tests `file://` et HTTP(S) avec vrai navigateur, qualification/rejet explicite, gestion des tailles. Il n'est pas question de déclarer l'ensemble des bibliothèques compatibles sans essais.

## Essais effectués

- **41/41 tests automatisés** réussis (37 hérités, 4 contrôles ajoutés : quatre marges, diagnostic, syntaxe et delta CSS autorisé).
- Chromium : rendu des valeurs 960 px, haut 12 px, bas 48 px, gauche 24 px, droite 36 px à 1440 et 375 px ; limitation de débordement à 320 px.
- Chromium et vrai JSZip : Game Map 1.9.8 d'origine, lecteur 3.8.2 réel issu de l'archive lot 7, génération d'un vrai ZIP HTML multifichier et d'un vrai ZIP SCORM, vérification des règles CSS et des métadonnées, conservation du pont SCORM dans l'un seulement.
- Pré-diagnostic JSON téléchargé depuis Chromium sur cette Game Map réelle : 990 fichiers H5P recensés ; références externes répertoriées avec échantillonnage limité.
- Smoke navigateur : trois scénarios de diagnostic/importation avec simulateur JSZip, aucune erreur JS.
- Les modules de notation, le moteur H5P 3.8.2 et la visionneuse ne sont pas modifiés par ce correctif.

## Limites et risques

- Aucune exécution interactive de la Game Map générée dans Moodle ou sur un hébergement HTTP(S) n'a été vérifiée dans cette livraison : recette utilisateur requise.
- Le plein écran H5P réel et la notation Moodle doivent être vérifiés après publication.
- L'export HTML monofichier n'est **pas** disponible : seulement son pré-diagnostic statique.
- Les valeurs peuvent être modifiées par un CSS personnalisé plus spécifique ; les contraintes de la plateforme Moodle (iframe, JavaScript, CSP) restent externes.

## Décision proposée

**7c développé et testé techniquement, contre-recette utilisateur ouverte. 8.1 socle de qualification livré, monofichier non qualifié.**
