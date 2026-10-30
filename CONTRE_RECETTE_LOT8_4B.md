# Contre-recette du lot 8.4b

Base validée : lot 8.4a, 10 contrôles réussis. Aucun scénario réussi antérieurement ne doit régresser.

## Nettoyage de l'interface

1. Les boutons **Diagnostic HTML monofichier** et **Prototype ressources (non interactif)** ont disparu.
2. Les trois boutons SCORM 1.2, HTML multifichier et HTML monofichier interactif sont toujours présents.
3. Un H5P simple valide permet toujours d'activer les trois formats disponibles ; un H5P incompatible bloque la génération.
4. Le monofichier interactif produit toujours un document `.html` et progresse jusqu'à 100 %.

## Non-régression

5. Game Map : affichage, images Memory, interactions et plein écran toujours fonctionnels en monofichier.
6. Interactive Book SST406 : ouverture, navigation et exercices inchangés en monofichier.
7. HTML multifichier : génération et lecture sous HTTP(S) ou Moodle inchangées.
8. SCORM : génération, notation et reprise inchangées dans Moodle.
9. Largeur maximale, marges ordinateur et mobile, CSS personnalisé : inchangés.

## Qualification préparatoire d'Interactive Video (facultatif)

10. **Avec un véritable H5P Interactive Video disposant d'un MP4 local**, vérifier que le journal de génération affiche un inventaire des médias et des interactions. Ce contrôle ne qualifie pas l'exécution synchronisée.
11. Vérifier la lecture du MP4, l'apparition d'une interaction à l'instant programmé et le retour correct à la vidéo après interaction. Si vous ne disposez pas d'un tel H5P complet, inscrire « non testé ». Le format monofichier reste expérimental dans ce cas.

Merci de communiquer les résultats numérotés, en distinguant OK, non OK et non testé. Aucune manipulation de console n'est nécessaire.
