# Lot 4.2 : infrastructure de choix de moteurs, sans activation automatique des candidats

Date : 27 octobre 2026. Base : lot 4.1 accepté (11/11 contrôles utilisateur). Référence du projet : CDC-H5PC-001 v1.0.

## Fonctionnement livré

- Par défaut : H5P Standalone 3.8.2 dans la visionneuse et à l'export SCORM 1.2 ; ses constantes et son constructeur SCORM n'ont pas changé.
- Le diagnostic avancé contient le sélecteur « Moteur de la visionneuse ». Versions 3.8.1 et 3.8.0 disponibles pour essais manuels, avec étiquette « non qualifié ».
- Les ressources du lecteur sont demandées sur le CDN à une version explicite et chaque version possède son cache distinct. Les chemins essentiels restent obligatoires (`main.bundle.js`, `frame.bundle.js`, `styles/h5p.css`) ; si une version n'est pas récupérable, l'aperçu signale l'échec sans proposer un résultat fictif.
- Pendant un essai candidat, la génération SCORM est désactivée, y compris au niveau du gestionnaire de génération. Aucun SCORM construit à partir d'un moteur non qualifié n'est livré. Pour exporter, revenir à 3.8.2.
- Lors du chargement d'un nouveau contenu, le sélecteur revient à 3.8.2.
- Le rapport de compatibilité JSON conserve le moteur SCORM de référence dans `runtime` et indique le moteur essayé dans `preview`.

## Limites explicites

Cette livraison ne qualifie PAS les versions 3.8.1 ou 3.8.0. Aucun résultat d'exécution réelle de ces lecteurs n'a été obtenu dans le présent environnement. L'analyse statique continue de respecter le plafond Core API 1.28 du profil 3.8.2 : un fichier exigeant 1.29 est toujours refusé, et le mode d'essai ne sert pas à contourner cette protection.

Les moteurs ne sont pas embarqués dans l'application, ils sont téléchargés par le navigateur depuis le CDN épinglé comme avant. Il reste à valider les URL, les licences, les ressources et les profils d'API de chaque moteur candidat dans Firefox sur GitHub Pages, puis à décider de leur qualification. La compatibilité ne peut être déduite de la seule existence d'une version publiée.

Les nouveaux essais ne modifient ni le suivi xAPI, ni la synchronisation de CSS, ni les mécanismes de plein écran, ni le lecteur de secours YouTube, ni le pont SCORM 1.2.

## Vérification de non-régression

- Les suites du projet : `python tests/run_all.py`.
- Le catalogue d'essai : `node tests/engine-trials.mjs`.
- Essai navigateur simulé : `python tests/engine_trials_browser.py` (Chromium/Playwright + vrai H5P pour l'analyse, lecteur non exécuté).
- Contrôles complémentaires : `python tests/browser_smoke.py` et `python tests/engine_catalog_browser.py`.

La validation Firefox sur GitHub Pages avec le véritable lecteur et le Game Map reste nécessaire. Un succès de chargement en mode d'essai n'établit pas la compatibilité SCORM ni la conformité universelle de la bibliothèque.
