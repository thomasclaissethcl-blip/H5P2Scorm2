# Lot 8.5b : intégration de la maquette UI/UX validée

**Source de départ :** archive réelle `H5P2Scorm2-8.zip`, avec les six suppressions confirmées par l'utilisateur après l'audit 8.5a. `index.html`, `app.js`, `styles.css` et les modules concordent bit à bit avec l'archive fournie, avant application de ce lot.

**Référence visuelle :** `SCORM-Studio_Charte-graphique_et_design-system.md` v1.0, SCORM Studio v6, et `MAQUETTE_H5P_CONVERTER_8_5B.html` validée par l'utilisateur.

## Modifications applicatives

- `index.html` : véritable interface à quatre sections (Importer, Prévisualiser, Personnaliser, Exporter), barre supérieure, navigation, panneau de contexte, choix du format par cartes, bouton d'action unique. Tous les identifiants historiques des contrôles sont conservés.
- `styles.css` : règles initiales conservées octet pour octet comme préfixe ; ajout de la couche sombre/clair reprenant les tokens officiels SCORM Studio. Le lecteur importé conserve son propre style ; les règles UI sont limitées au conteneur de l'application.
- `src/ui-workspace.js` : nouveau contrôleur uniquement ergonomique. Bascule des sections, thème mémorisé localement, sélection exclusive du format, bouton « Convertir » déclenchant directement le bouton originel du format choisi, résumé non intrusif. Pas d'accès aux données SCORM.
- `courseTitle` et `languageOverride` déplacés vers les réglages communs. Les paramètres de notation et reprise SCORM sont masqués en mode HTML sans effacer leurs valeurs.
- Le CSS libre et les huit marges ordinateur/mobile sont conservés. L'option CSS est repliée par défaut.
- Les boutons d'export historiques restent dans le DOM, mais sont masqués visuellement pour éviter tout double parcours ; leurs fonctions et leurs contrôles de sécurité restent en place.
- L'iframe d'aperçu est conservée en dehors du viewport, avec une largeur déterminée, pendant l'import, afin de préserver son initialisation et son chargement H5P. Une notification de redimensionnement est émise lors de l'ouverture de l'onglet Aperçu.

## Codes préservés

Aucune modification à `app.js`, aux modules de notation SCORM, à l'export HTML multi/monofichier, aux ressources du lecteur H5P, aux bibliothèques de preview ou au catalogue de moteurs. Les comportements de génération ne sont pas réécrits.

## Vérifications effectuées

- 50/50 suites historiques réussies.
- Chromium : les quatre sections, le thème clair/sombre, les trois formats via bouton unique, le maintien de la valeur du profil Moodle lors d'un changement de format, les champs d'apparence, et l'absence de débordement de 320 à 1450 px.
- Chromium avec un vrai jeu de fixtures : analyse H5P valide, blocage de Core API incompatible, blocage d'une dépendance manquante ; activation cohérente des trois exports.
- Nouveau test `tests/verify_styles_7c.py` : vérifie désormais l'empreinte exacte SHA-256 du CSS historique puis la couche de thème autorisée (l'ancien test imposait une égalité complète à l'ancienne apparence).

## Limites des essais

La navigation Chromium charge les modules par injection dans ce banc de test, avec JSZip simulé pour l'analyse. Aucun nouveau paquet SCORM ou HTML n'a été exécuté dans Moodle dans le cadre de cette livraison UI. Ces vérifications doivent être effectuées lors de la contre-recette utilisateur. La version technique d'application reste `1.0.1` conformément aux invariants historiques ; le nom **8.5b** désigne le lot de travail et non un changement du runtime.
