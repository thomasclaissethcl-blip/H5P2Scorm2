# Contre-recette ciblée, lot 3.5

Environnement : GitHub Pages, Firefox, véritable Game Map 1.9.8 fourni.

Pour chaque vérification, noter : réussi / échoué / non testé, et relever le message de diagnostic en cas d'échec.

- [ ] **3.5-01 Agrandir, géométrie** : dès l'ouverture du mode « Agrandir », la carte conserve ses proportions et ses hotspots sans dézoom global ni déformation.
- [ ] **3.5-02 Agrandir, fenêtre longue** : ouvrir une étape dont le contenu dépasse la hauteur ; faire défiler **la fenêtre d'exercice** jusqu'en bas, sans déplacer toute la carte ni perdre les boutons de navigation.
- [ ] **3.5-03 Plein écran, fenêtre longue** : répéter le test précédent en plein écran. Le contenu débordant reste consultable verticalement.
- [ ] **3.5-04 Retour normal** : quitter le plein écran puis le mode agrandi. Les styles et la navigation normaux sont restaurés.
- [ ] **3.5-05 CSS** : vérifier qu'une règle CSS personnalisée reste visible et modifiable dans l'aperçu sans perdre la progression.
- [ ] **3.5-06 Régression SCORM** : vérifier qu'un paquet SCORM est toujours généré ; si vous avez Moodle, essayer son lancement sans extrapoler à la validation du score.
- [ ] **3.5-07 Diagnostics CSP** : indiquer les chemins `preview.invalid/...` rapportés, notamment ceux associés à des médias manquants.

**Hors du périmètre du correctif 3.5** : rétablissement du bouton de plein écran natif de H5P ; vidéo YouTube intégrée. Ces points restent ouverts et ne doivent pas être cochés comme résolus.

## Compte rendu

Navigateur et version :

Résultats :

Anomalies (ID, attendu, observé, message) :

Décision proposée : accepté / accepté sous réserves / rejeté.
