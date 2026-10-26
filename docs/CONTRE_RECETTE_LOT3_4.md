# Contre-recette ciblée du lot 3.4

**Référence :** CDC-H5PC-001 ; exigences VIS-01, VIS-02, VIS-04 et REC-05.  
**Environnement attendu :** dépôt GitHub Pages, Firefox à jour, Game Map `H5P.GameMap 1.9.8` (archive `fantasy-map-2-181 (1).h5p`).

## Préalables

1. Remplacer `src/preview-frame.js` par celui du lot 3.4, puis publier sur GitHub Pages.
2. Recharger intégralement la page (Ctrl+Maj+R sous Firefox) et importer à nouveau le fichier Game Map.
3. Ouvrir le journal de diagnostic avancé ; noter toute erreur, mais les messages de diagnostic n'indiquent pas à eux seuls la réussite visuelle.

## Scénarios

- [ ] **3.4-01. Plein écran** : lancer le plein écran du convertisseur. La carte et sa barre d'outils tiennent en hauteur sans défilement vertical de la carte. La zone de carte se redimensionne naturellement ; textes et fenêtres conservent leur taille lisible.
- [ ] **3.4-02. Hotspots** : sans cliquer sur la carte au préalable, comparer taille et forme des hotspots avant et après activation. Ils ne sont ni aplatis ni étirés. Tester au moins trois hotspots de tailles différentes.
- [ ] **3.4-03. Agrandir** : utiliser « Agrandir » puis « Réduire ». Même résultat que 3.4-01, sans dézoom général du contenu ni disparition d'éléments.
- [ ] **3.4-04. Revenir au mode normal** : sortir du plein écran et du mode agrandi ; disposition initiale et interactions intactes.
- [ ] **3.4-05. Interactions** : dans les deux modes, ouvrir une étape, réaliser un exercice et fermer sa fenêtre sans déplacement des points actifs.
- [ ] **3.4-06. CSS** : reprendre la règle CSS déjà validée en lot 3.3 ; elle s'applique dynamiquement, sans réinitialiser la carte.
- [ ] **3.4-07. SCORM** : le SCORM 1.2 est encore généré sans erreur. Le test dans Moodle reste distinct.
- [ ] **3.4-08. Journal de diagnostic** : en mode agrandi, vérifier la présence de « géométrie de la carte calculée par le lecteur H5P (agrandi) ». Si seul « redimensionnement H5P natif sollicité » apparaît, le passage vers l'iframe interne n'est pas confirmé et doit être signalé.
- [ ] **3.4-09. Autre H5P** : tester un H5P non Game Map. En mode agrandi il ne doit plus être réduit par `transform: scale`; un défilement peut rester nécessaire lorsqu'une activité dépasse physiquement la hauteur disponible.

### Anomalies à retourner

Pour chaque échec : identifiant, comportement attendu et observé, messages du diagnostic, navigateur/version, capture avant/après si utile.

## Limitations maintenues

- Le **bouton de plein écran natif de H5P.GameMap** n'est pas restauré : le lot 3.4 sollicite sa **logique de mise en page**, pas nécessairement son API de plein écran ni le bouton intégré.
- La lecture YouTube intégrée dans la visionneuse n'est **pas** corrigée dans ce lot.
- Les tests automatisés ont utilisé un lecteur H5P simulé ; le vrai Game Map sous Firefox/GitHub Pages reste à valider.
- La recette fonctionnelle ne remplace pas la validation de sécurité et SCORM en LMS.
