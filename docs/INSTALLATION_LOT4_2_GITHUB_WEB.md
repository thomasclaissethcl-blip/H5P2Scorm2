# Déploiement manuel du lot 4.2 sur GitHub Web

1. Conserver le commit validé du lot 4.1 (11 contrôles réussis) ; travailler de préférence sur une branche dédiée.
2. Décompresser l'archive « Fichiers modifiés ». Elle reproduit les chemins de la racine du dépôt.
3. Remplacer les fichiers applicatifs `app.js`, `index.html`, `styles.css` et `src/engine-catalog.js`.
4. Ajouter `tests/engine-trials.mjs`, `tests/engine_trials_browser.py`, les autres tests mis à jour et les nouveaux documents `docs/`. Aucun fichier existant ne doit être supprimé.
5. Publier sur GitHub Pages, attendre le déploiement complet, puis recharger Firefox en ignorant le cache.
6. Exécuter `docs/CONTRE_RECETTE_LOT4_2.md`. Si un comportement précédemment validé est dégradé, revenir au commit du lot 4.1 et communiquer les résultats.

Le lot 4.2 n'ajoute aucun moteur externe dans le dépôt GitHub. Les lecteurs d'essai sont demandés au CDN avec une version explicite. Ils ne sont jamais proposés pour la génération SCORM.
