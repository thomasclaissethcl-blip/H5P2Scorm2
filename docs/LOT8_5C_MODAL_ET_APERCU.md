# Lot 8.5c : fenêtre de génération et actualisation de Game Map

## Référence

Version source : lot 8.5b, validé fonctionnellement par l'utilisateur (14/14 contrôles, avec deux observations ergonomiques).
Date : 30 octobre 2026. Ce lot ajoute une fenêtre de génération et une correction du reflow de la visionneuse.

## Changements

1. Une boîte de dialogue modale native s'ouvre lorsqu'on utilise le bouton principal d'export. La barre de progression et le journal existants y sont déplacés temporairement, sans duplication. Après succès : « Contenu généré » puis bouton « OK ». Sur échec : « Échec de la génération », journal conservé et bouton « OK ». La boîte ne peut pas être fermée par Échap pendant la génération.
2. Le bouton « OK » remet exactement la barre et le journal dans leur emplacement d'origine, sans réinitialiser les informations. Le même dispositif couvre les trois formats : SCORM 1.2, HTML multifichier, HTML monofichier.
3. Game Map : l'aperçu préchargé hors écran reçoit une largeur correspondant à la zone centrale et, à la révélation de son panneau, le véritable résolveur d'iframe est notifié par postMessage, puis reçoit deux notifications différées de redimensionnement. L'origine opaque du cadre interdit un événement resize direct sur son contenu.

## Limites

Le recalcul de Game Map est une correction ciblée, validée dans l'architecture et dans les essais simulés Chromium. L'absence de déformation sur la Game Map réelle après l'ouverture de l'onglet reste à vérifier sur GitHub Pages/Firefox. Le contenu H5P exporté n'est pas modifié.

## Vérifications

- 51/51 suites automatisées réussies, y compris un nouveau contrôle structurel 8.5c.
- Tests Chromium : ouverture et fermeture modale, trois formats, progression, succès/échec, restitution du journal, prévention de la fermeture anticipée, responsive de 320 à 1450 px.
- Les trois exportateurs de l'application ont été exécutés avec un H5P valide et une couche d'E/S ZIP et lecteur simulée : trois téléchargements simulés et trois signaux de succès. Aucun LMS réel ni vrai ZIP final dans ces tests.
- Importation H5P valide et refus de deux H5P incompatibles préservés.
- Modules métier, sources du lecteur, notation, visionneuse isolée, CSS des exports et leurs dépendances inchangés.

## Décision

Livré pour recette utilisateur. La version 8.5b reste la dernière référence acceptée jusqu'à confirmation.
