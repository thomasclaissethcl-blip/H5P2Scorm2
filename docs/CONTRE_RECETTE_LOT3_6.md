# Contre-recette du lot 3.6 sur GitHub Pages

Navigateur principal : Firefox stable. H5P de référence : `fantasy-map-2-181 (1).h5p`, bibliothèque H5P.GameMap 1.9.8.

Rafraîchir la page après la publication de GitHub Pages (Ctrl+F5) puis réimporter le Game Map.

| ID | Manipulation | Résultat attendu | État |
| --- | --- | --- | --- |
| CR36-01 | Importer le Game Map | Carte, hotspots, images et interactions inchangés | À tester |
| CR36-02 | Passer en « Agrandir », puis « Plein écran » | Carte et dialogues bien dimensionnés, défilement des dialogues conservé | À tester |
| CR36-03 | Modifier le CSS pendant l'activité | Styles mis à jour sans réinitialisation | À tester |
| CR36-04 | Consulter le diagnostic Fullscreen avant et après agrandissement | Valeurs de disponibilité affichées pour le lecteur principal ; pour le sous-document si connecté | À tester |
| CR36-05 | Chercher le bouton natif de Game Map, puis essayer celui de l'application | Présence/absence consignée, fonctionnement observé, ne pas assimiler les deux boutons | À tester |
| CR36-06 | Sans cocher « Autoriser les vidéos YouTube », charger Game Map | Section de secours présente ; bouton de lecture externe désactivé ; aucune vidéo externe chargée automatiquement | À tester |
| CR36-07 | Cocher l'autorisation, puis cliquer « Lire la vidéo 1 dans le convertisseur » | Lecteur sous l'aperçu ; vidéo lisible si YouTube autorise l'intégration dans ce navigateur | À tester |
| CR36-08 | Fermer la vidéo puis décocher l'autorisation | Lecture interrompue et cadre vidéo fermé | À tester |
| CR36-09 | Essayer la vidéo 2 et les liens « Ouvrir sur YouTube » | Lecture ou erreur exacte documentée, lien d'accès direct fonctionnel | À tester |
| CR36-10 | Dans le Game Map, ouvrir l'exercice comportant YouTube | Distinguer le comportement du lecteur **interne** de celui de secours. Il peut rester bloqué | À tester |
| CR36-11 | Générer le SCORM | Archive générée comme auparavant, sans modification du résultat attendu | À tester |

**À relever en cas d'échec vidéo :** message du lecteur YouTube (notamment erreur 153), éventuel blocage Firefox de contenus externes, comportement dans un autre navigateur. Le lecteur intégré au H5P et le lecteur de secours constituent deux voies différentes.

**Décision de recette :** correctif accepté, accepté sous réserves ou rejeté. Une réussite des vidéos de secours ne suffit pas pour déclarer la lecture interne H5P conforme.
