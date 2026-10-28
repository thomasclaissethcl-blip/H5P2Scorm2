# Bilan technique du lot 5.2

- Base : source intégrale du lot 5.1 fourni et validé, version applicative conservée à 1.0.1.
- Périmètre : plan expérimental d'Interactive Book, agrégation fermée, doublons, sauvegarde/reprise conditionnelles et rapports de génération.
- Fichiers exécutables : `app.js`, `index.html`, `src/scorm-scoring.js` modifiés ; `src/scorm-score-plan.js` ajouté.
- Contrôle de régression : modules de lecteur H5P, visionneuse, YouTube, profils, styles et constructeur de l'API SCORM non modifiés.
- Tests : 26 suites automatiques, dont tests inédits ; tests Chromium de l'interface existante ; simulations SCORM incluant une fermeture/réouverture de SCO.
- Limitation : les véritables événements et notes d'un Interactive Book dans Moodle ne peuvent être établis par ces tests. Fonction expérimentale désactivée par défaut.
- Décision de livraison : prête pour recette utilisateur, pas encore qualifiée pour la notation réelle d'Interactive Book.
