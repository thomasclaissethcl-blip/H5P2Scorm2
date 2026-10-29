# Lot 7d / 8.2, compte rendu technique

Date : 29 octobre 2026. Base : version 7c + 8.1 validée par l'utilisateur (14/14).
Références : CDC-H5PC-001 v1.0, HMO-01 à HMO-05, HMF-01 à HMF-04.

## Correctif 7d, responsive

- Ordinateur : `min-width:769px`, marges haut/bas/gauche/droite indépendantes, 0 à 2 000 px.
- Mobile et tablettes étroites : `max-width:768px`, marges distinctes haut/bas/gauche/droite, 0 à 2 000 px.
- Les valeurs mobiles vides deviennent 0 px, annulant automatiquement les marges ordinateur dans ce mode.
- La largeur maximale reste unique et centrée, des garde-fous `min(Npx,49vw)` protègent contre le débordement horizontal imputable aux marges.
- Les réglages s'appliquent aux pages hôtes des ZIP SCORM et HTML multifichier ; aucune modification du DOM ou des scripts H5P. Le contenu CSS libre et les réglages SCORM existants restent inchangés.
- Les fonctions `normalize`/`css` conservent les contrats 7b/7c lorsqu'aucun champ mobile n'est fourni par les anciens clients.
- Les rapports de génération comportent les 8 marges (les 4 mobiles sont nulles si vides).

## Lot 8.2, preuve technique monofichier

- Fichier nouveau : `src/html-singlefile-resources.js`.
- Le module prend les fichiers locaux du H5P et les ressources du lecteur 3.8.2, les contrôle, refuse les chemins dangereux et intègre leurs octets en base64 dans un seul HTML.
- Le document contient un vérificateur autonome et une interface d'inspection en lecture seule `H5PResourcePrototype`. Il vérifie le nombre et le volume de fichiers, lit les JSON et une image embarquée, expose la résolution des chemins relatifs et les URL locales encodées. Les URL simples dans les CSS peuvent être converties en data URL.
- Limite conservatrice : 5 000 fichiers et 32 Mio de ressources non compressées. Dépassement : refus explicite et maintien du repli HTML multifichier.
- Ce document **N'EXÉCUTE PAS H5P**. Les chargements dynamiques du runtime et l'exécution interactive ne sont ni implémentés ni qualifiés ; le bouton est explicitement nommé « Prototype ressources (non interactif) ». Le diagnostic 8.1 reste disponible.
- Les scripts importés restent représentés comme données, sans exécution dans le prototype.
- Un exemple réel Game Map a embarqué 1 021 fichiers / 12 241 019 octets dans un seul HTML (~16,4 Mo). Contrôle des octets, des JSON, des ressources du lecteur et d'une image réussi dans Chromium (page injectée en mémoire).
- Navigation directe `file://` bloquée par le navigateur administré de l'environnement de test (`ERR_BLOCKED_BY_ADMINISTRATOR`). Il n'y a donc **pas** de validation réelle de `file://`. Le lancement en HTTP(S) n'a pas non plus été validé ici.

## Protections et recette

- 44/44 tests automatisés. Essais supplémentaires dans Chromium : breakpoint 769/768 px, personnalisation mobile, annulation des marges ordinateur, largeur responsive, démonstration de ressources réelles.
- `tests/verify_lot53_nonregression.py` vérifie le pont SCORM et les composants sensibles inchangés. `styles.css` reste identique à 7c.
- **Recette utilisateur encore ouverte**, particulièrement Firefox, GitHub Pages/mini-site et Moodle (SCORM réel).
- La suite du lot 8 devra implémenter et qualifier les chargements H5P dynamiques, les iframes, les bibliothèques, les URLs CSS/JS, les médias et l'exécution réellement hors ligne avant toute sortie monofichier interactive.
