# Contre-recette du lot 4.2 (GitHub Pages / Firefox)

Version à tester : lot 4.2, après publication des fichiers et rechargement forcé. Référence de non-régression : lot 4.1 accepté. Fichier principal : `fantasy-map-2-181 (1).h5p` (H5P.GameMap 1.9.8).

Pour chaque test, indiquer : réussi / échoué / non testé et relever les anomalies.

- [ ] **L42-01** Au chargement, le lecteur affiché par défaut dans « Versions et moteurs H5P » est **3.8.2**. Le bouton Générer le SCORM reste actif si le H5P est valide.
- [ ] **L42-02** Avec 3.8.2, Game Map fonctionne toujours : hotspots, images, navigation, exercices et feedbacks.
- [ ] **L42-03** Le plein écran H5P natif et les modes Plein écran / Agrandir du convertisseur restent fonctionnels, sans déformation ; les fenêtres longues défilent.
- [ ] **L42-04** Une règle CSS dans le champ apparaît/disparaît dynamiquement sans réinitialiser l'activité.
- [ ] **L42-05** La lecture des vidéos YouTube reste possible avec image et son dans le lecteur de secours.
- [ ] **L42-06** Sélectionner le lecteur **3.8.1 (essai non qualifié)** : l'interface signale le caractère expérimental et désactive Générer le SCORM. Observer séparément si l'aperçu se charge et si Game Map est utilisable. Un échec de cet aperçu ne doit pas casser le convertisseur.
- [ ] **L42-07** Sélectionner **3.8.0 (essai non qualifié)** : même comportement de sécurité ; noter le résultat d'exécution, sans considérer le moteur comme validé.
- [ ] **L42-08** Télécharger le rapport JSON pendant un essai. Le champ `preview.playerVersion` doit indiquer la version testée, `preview.exportAllowedWithPreview` doit être `false`, et `runtime.playerVersion` doit rester `3.8.2`.
- [ ] **L42-09** Revenir au moteur **3.8.2** : la visionneuse redémarre et la génération SCORM est réactivée, sans recharger le fichier H5P.
- [ ] **L42-10** Générer le SCORM après retour sur 3.8.2 : ZIP généré comme en lot 4.1. Si possible, ouvrir dans Moodle.
- [ ] **L42-11** Charger un nouveau H5P après avoir sélectionné un candidat : 3.8.2 est automatiquement restauré.
- [ ] **L42-12** Charger les fixtures incompatibles (Core API future et dépendance absente) : leur export demeure bloqué.

Observation des moteurs candidats :

- 3.8.1 : aperçu ouvert ? interactions, médias, console, avertissements ?
- 3.8.0 : aperçu ouvert ? interactions, médias, console, avertissements ?

Décision : accepter le dispositif d'essai (oui / sous réserves / non). Une qualification d'un candidat demanderait un procès-verbal spécifique incluant les médias, le CSS, les événements, le plein écran et les scores SCORM.
