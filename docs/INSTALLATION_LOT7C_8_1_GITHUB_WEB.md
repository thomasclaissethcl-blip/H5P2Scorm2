# Installation manuelle GitHub Web : 7c et lot 8.1

## Préparation

Cette mise à jour est fondée sur la version 7b. Sauvegarder la version 7b (archive source et/ou historique Git) et conserver un moyen de retour arrière. Ne pas écraser tout le dépôt avec un projet d'un lot plus ancien.

## Fichiers applicatifs à remplacer

1. `app.js` : **remplacer**.
2. `index.html` : **remplacer**.
3. `styles.css` : **remplacer**.
4. `src/export-layout.js` : **remplacer**.
5. `src/html-multifile.js` : **remplacer** (seule sa valeur par défaut de rapport de mise en page a évolué).

## Fichier applicatif à ajouter

6. `src/html-singlefile-preflight.js` : **ajouter**.

Les fichiers `tests/` et `docs/` sont facultatifs pour publier le site mais recommandés pour garder les preuves. Aucun fichier existant n'est à supprimer.

Via GitHub Web, ouvrir le fichier correspondant, modifier le contenu ou téléverser les nouveaux fichiers en préservant exactement les chemins. Valider les modifications. Laisser GitHub Pages se republier et recharger la page avec un rafraîchissement forcé pour éviter l'ancien `app.js` en cache.

## Vérification rapide

- Charger un H5P connu, vérifier la présence des quatre champs, par exemple 960/12/48/24/36 px.
- Générer HTML multifichier puis SCORM ; vérifier les rendus et la notation Moodle.
- Cliquer sur Diagnostic HTML monofichier : seul un `.json` doit être téléchargé. Le format HTML unique n'est pas encore actif.

## Retour arrière

Rétablir les cinq anciens fichiers depuis la sauvegarde 7b et retirer `src/html-singlefile-preflight.js` si besoin. Le retour arrière ne modifie aucun package SCORM ou HTML déjà exporté.
