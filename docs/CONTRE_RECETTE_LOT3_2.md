# Contre-recette ciblée du correctif 3.2, GitHub Pages

**Environnement :** Firefox (préciser le numéro de version), ordinateur, URL GitHub Pages, Game Map `fantasy-map-2-181 (1).h5p`.
**Préparation :** vérifier que la publication GitHub Pages est terminée, actualiser sans cache, puis recharger le H5P.

Pour chaque scénario : réussi / échoué / non testé et observations.

- [ ] **CR3-04-A, Agrandir.** Ouvrir le Game Map et cliquer une fois sur « Agrandir » sans cliquer sur un hotspot. Les icônes et la carte doivent conserver immédiatement leurs proportions, sans être étirées.
- [ ] **CR3-04-B, Réduire.** Revenir en affichage normal. Le contenu retrouve aussitôt sa mise en page et reste utilisable.
- [ ] **CR3-05, Plein écran.** Utiliser le **nouveau bouton « Plein écran »** de la visionneuse. Vérifier les proportions et le retour en mode normal (bouton ou touche Échap). Consigner séparément si le contenu H5P propose sa propre commande native.
- [ ] **CR3-06-A, CSS saisi.** Sur une activité H5P dont le bouton possède la classe `.h5p-content`, saisir par exemple `.h5p-content { outline: 6px solid #e11d48 !important; }`. Vérifier qu'un contour rose apparaît autour du contenu.
- [ ] **CR3-06-B, CSS dynamique.** Modifier le contour en `#16a34a`, puis supprimer la règle. Les changements doivent être visibles sans redémarrage et sans perte de progression.
- [ ] **CR3-07, CSS importé.** Charger un fichier `.css` avec la même règle ; contrôler l'application puis l'export SCORM.
- [ ] **CR3-09-A, YouTube embarqué.** Constater si les vidéos sont lisibles après autorisation, en notant les messages d'erreur éventuels. Une vidéo encore bloquée signifie que CR3-09 n'est pas résolu.
- [ ] **CR3-09-B, secours.** Sous la visionneuse, vérifier que les vidéos externes de ce Game Map sont proposées sous forme de deux liens et peuvent s'ouvrir dans un nouvel onglet. Ceci est une capacité de secours et **ne suffit pas à valider CR3-09**.
- [ ] **CR3-10, SCORM.** Vérifier que le ZIP se génère toujours et que le fichier CSS est présent dans l'export.

## Bilan

- Contrôles réussis : ___
- Contrôles échoués : ___
- Contrôles non testés : ___
- Problème le plus gênant : ___
- Décision proposée : validé / sous réserves / à corriger
