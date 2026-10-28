# Contre-recette utilisateur, lot 5.3

**Environnement :** GitHub Pages ; Firefox ; Moodle 1.2 SCORM ; version antérieure de référence 5.2b.

Cocher uniquement les actions réellement exécutées. Les points facultatifs peuvent rester « non testés » sans invalider les contrôles techniques.

## A. Non-régression

- [ ] **L53-01** Le Game Map 1.9.8 s'affiche, les hotspots, le plein écran natif et l'agrandissement fonctionnent comme avant.
- [ ] **L53-02** Les CSS saisis ou importés s'appliquent dans la visionneuse sans perte de progression.
- [ ] **L53-03** Le lecteur vidéo YouTube de secours fonctionne avec image et son.
- [ ] **L53-04** Les SCORM générés sans option expérimentale se lancent dans Moodle et conservent les notes et statuts antérieurement validés.
- [ ] **L53-05** Avec le Game Map, le rapport conserve `activePlan.enabled: false` et le score natif reste prioritaire.

## B. Diagnostic de provenance du score

- [ ] **L53-06** Sur un Interactive Book exporté avec option expérimentale, `window.H5PConverterScoreAudit()` est accessible depuis la console de l'iframe SCO.
- [ ] **L53-07** Après le rapport final natif d'Interactive Book, `scoreSource` indique `native`, et Moodle affiche la note attendue. Si aucun événement final natif ne survient, consigner le contexte.
- [ ] **L53-08** Le diagnostic ne contient aucun nom d'apprenant, identifiant de registration ou historique individuel des réponses.

## C. Paquet de démonstration sans H5P réel

Importer `SCORM12_RECETTE_AGREGATION_LOT5_3.zip` dans un cours Moodle d'essai, avec une nouvelle tentative. Aucun H5P réel n'est embarqué.

- [ ] **L53-09** Après le bouton 1, aucune nouvelle note SCORM n'a été écrite ; `scoreSource: none`.
- [ ] **L53-10** Après le bouton 2, `scoreSource: aggregate`, `aggregateUnits: 7`, note 71,05/100, statut `failed`.
- [ ] **L53-11** Après le bouton 3, `scoreSource: native`, note 81,58/100, statut `passed`.

## D. Qualité et reprise

- [ ] **L53-12** Pour un Interactive Book avec reprise activée, une fermeture après quelques sous-scores permet de retrouver les résultats du suivi dans `cmi.suspend_data` sans dépasser 4 000 caractères, sur le cas testé. Les très grands contenus restent soumis aux limites de SCORM 1.2.
- [ ] **L53-13** Les journaux Moodle et le relevé de notes ne signalent aucune régression du SCORM précédemment validé.

**Résultat global :** accepté / accepté sous réserves / refusé. Préciser le navigateur, la version Moodle, la politique de statut du SCO, la note et le statut enregistrés et les différences observées.

**Réserve toujours ouverte :** les vidéos YouTube ne sont pas jouées directement à l'intérieur de Game Map, mais le lecteur de secours fonctionne.
