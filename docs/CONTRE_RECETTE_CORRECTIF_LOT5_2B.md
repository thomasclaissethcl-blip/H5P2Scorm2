# Contre-recette du correctif 5.2b

**Environnement :** application GitHub Pages et instance Moodle de test. Préserver les données et les notes de production. Utiliser le même Interactive Book SST406 Dossier1 pour la comparaison. Consigner « réussi », « échoué » ou « non testé » et, pour Moodle, les scores numériques et statuts observés.

- [ ] **L52B-01.** Le lecteur 3.8.2 reste sélectionné par défaut ; la visionneuse et les exports habituels fonctionnent sans changement visible.
- [ ] **L52B-02.** Exporter SST406 Dossier1 avec l'option expérimentale décochée : `activePlan.enabled:false`, score global natif conservé.
- [ ] **L52B-03.** Exporter le même livre avec l'option cochée : `candidateScorePlan.enabled:true` et `activePlan.enabled:true`.
- [ ] **L52B-04.** Vérifier dans `score-plan-report.json` : exactement 7 `expectedSubContentIds`, 4 unités de type `question-set`, 3 de type `scored-exercise` et 35 `ignoredNestedSubContentIds`.
- [ ] **L52B-05.** Vérifier que le livre affiche toujours correctement les 12 hotspots textuels, ses accordéons, les questions et les médias.
- [ ] **L52B-06.** Dans Moodle, soumettre le livre avant d'avoir répondu à toutes les questions : relever note, score brut et statut. Si un score global natif est présent, il doit rester prioritaire ; aucun total de sous-scores partiels ne doit le remplacer.
- [ ] **L52B-07.** Terminer le livre puis cliquer sur la soumission finale : vérifier la note et le statut Moodle et comparer à H5P. Relever la source native ou agrégée, si vérifiable.
- [ ] **L52B-08.** Refaire une question ou reprendre la tentative : vérifier absence de double comptage et conservation du résultat conforme à la politique de reprise.
- [ ] **L52B-09.** Tester avec un petit livre comportant un contenu noté dans un hotspot ou dans un accordéon : le plan expérimental doit être refusé, tout en maintenant la voie native.
- [ ] **L52B-10.** Refaire un test Game Map : plan expérimental inactif avec motif `native-score-preferred`, score natif inchangé.
- [ ] **L52B-11.** Réaliser la recette de non-régression : CSS dynamique, plein écran natif, hotspots, défilement des fenêtres, YouTube de secours, export SCORM.

## Interprétation

Le score global H5P a priorité : les cas où les deux voies aboutiraient au même score ne prouvent pas que notre calcul alternatif a été utilisé. L'agrégation alternative ne peut être considérée comme validée en production sans un cas où le résultat global est absent et où les sept unités et la finalisation ont été observées dans les événements xAPI.

Le test d'un plan éligible et activé vérifie le **détecteur structurel**, pas automatiquement la **fiabilité des notes en conditions réelles**. En cas de résultats divergents, revenir à l'option décochée et joindre `score-plan-report.json`, `generation-report.json` et les observations Moodle.
