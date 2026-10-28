# Contre-recette du lot 5.2 sur GitHub Pages et Moodle

**État initial :** lot 5.1 accepté. Effectuer la recette sur une instance Moodle de test (et jamais sur des résultats d'apprenants réels). Les tests d'agrégation nécessitent un Interactive Book avec **deux activités notées simples**, des identifiants distincts et des résultats xAPI exploitables. Conserver le paquet `.h5p` et les paramètres de test.

Pour chaque contrôle, consigner « Réussi », « Échoué » ou « Non testé », le contenu utilisé et la note observée.

- [ ] **L52-01**. Sans cocher l'option, l'export Game Map et sa note finale sont identiques à la version 5.1.
- [ ] **L52-02**. Le lecteur 3.8.2 reste sélectionné par défaut, les versions expérimentales ne débloquent pas l'export.
- [ ] **L52-03**. Importer le Game Map 1.9.8 et générer un SCORM en cochant l'option : `score-plan-report.json` indique un plan inactif (score natif privilégié).
- [ ] **L52-04**. Importer un Interactive Book simple avec deux activités notées supportées. Avec l'option décochée, la notation reste celle du lot 5.1.
- [ ] **L52-05**. Cocher l'option et générer : `score-plan-report.json` contient `activePlan.enabled: true`, les identifiants attendus et `experimentalAggregation: true`. Si le livre ne remplit pas les critères, noter le motif et marquer ce scénario non testé.
- [ ] **L52-06**. Dans Moodle, répondre à un seul des deux exercices et ne pas terminer le livre : aucune **note finale agrégée** n'est produite.
- [ ] **L52-07**. Répondre aux deux exercices puis terminer le livre : si le livre n'a pas émis de score global, le total attendu est la somme des points acquis sur la somme des maximaux (exemple 4/5 + 6/10 = 66,67 %). Relever la note Moodle exacte.
- [ ] **L52-08**. Si Interactive Book émet un score global natif, vérifier qu'il prime sur les sous-scores, y compris si sa valeur est différente.
- [ ] **L52-09**. Répondre deux fois au même exercice : la seconde réponse remplace la précédente, sans double comptage.
- [ ] **L52-10**. Fermer puis rouvrir une tentative avec reprise active : vérifier la persistance des résultats précédemment soumis, l'état de l'activité et la limite `suspend_data`.
- [ ] **L52-11**. Tester un Interactive Book avec bibliothèque imbriquée inconnue ou un ID dupliqué : plan refusé, score natif préservé, aucune note agrégée fictive.
- [ ] **L52-12**. Vérifier la visionneuse, les images/sons, les modes Agrandir et Plein écran, le CSS en direct et les vidéos YouTube de secours.
- [ ] **L52-13**. Exporter un exercice simple : score et statut SCORM comme en 5.1.
- [ ] **L52-14**. Vérifier que la génération ZIP, le manifeste SCORM et la reprise traditionnelle restent fonctionnels.

**Conditions de validation :** aucun recul des contrôles validés précédemment ; les scénarios d'agrégation doivent être accompagnés de valeurs chiffrées et, si possible, d'extraits des événements xAPI / du rapport de note Moodle. Les absences d'événements attendus ou les plans refusés ne sont pas des échecs du mécanisme conservateur, mais ne prouvent pas non plus l'agrégation réelle.

**Réserve préexistante :** YouTube reste disponible par lecteur de secours, sans intégration directe dans Game Map.
