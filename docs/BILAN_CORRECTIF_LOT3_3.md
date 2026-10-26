# Correctif expérimental 3.3 : rapport de réalisation

Date : 26 octobre 2026. Base : code livré en lot 3.2. Cahier des charges CDC-H5PC-001 version 1.0.

## Retour utilisateur ayant motivé la correction

* Le plein écran fonctionne, mais Game Map occupe toute la largeur et déborde verticalement.
* Le bouton plein écran intégré à Game Map ne s'affiche toujours pas.
* Le CSS personnalisé n'a aucun effet visible dans l'aperçu.
* Le lecteur YouTube intégré ne fonctionne pas dans l'aperçu, malgré son fonctionnement dans le SCORM produit.

## Modifications du prototype 3.3

1. **Ajustement par hauteur** : l'orchestrateur avertit l'iframe des entrées et sorties en mode agrandi ou plein écran. L'iframe calcule un coefficient uniforme de réduction fondé sur la largeur et surtout la hauteur réellement disponibles, puis applique `transform:scale` sur la scène H5P entière. L'objectif est d'éviter les hotspots déformés. Le mécanisme peut ne pas couvrir les éléments H5P positionnés hors de cette scène ou leurs propres logiques internes de plein écran.
2. **CSS initial** : `customCss` référence à présent un URL Blob réellement résoluble, y compris depuis les sous-documents, en complément de l'injection CSS dynamique existante. Les mises à jour restent transmises à la scène et aux sous-documents accessibles/connectés.
3. **Diagnostic CSS** : le journal avancé indique le nombre de caractères transmis et de documents ayant reçu les styles. Ces messages ne prouvent pas l'effet d'un sélecteur donné.
4. **Diagnostic du plein écran** : le journal indique `document.fullscreenEnabled` et `H5P.fullscreenSupported` afin d'expliquer l'absence éventuelle du bouton natif. L'inspection du H5P.GameMap 1.9.8 de référence a confirmé que ce bouton dépend de `H5P.fullscreenSupported` dans l'instance racine.
5. **Diagnostic CSP** : les ressources bloquées peuvent être signalées sous forme d'hôte et de directive, sans journaliser les URL complètes.

## Ce qui n'est pas résolu

La lecture YouTube **au sein de l'activité H5P prévisualisée** n'est pas corrigée par ce lot. Des contraintes de sandbox, d'origine ou de politique du navigateur peuvent intervenir. Une architecture de lecture distincte ou un diagnostic réel dans Firefox est nécessaire avant de modifier davantage les permissions ; éviter d'ajouter `allow-same-origin` au `srcdoc` actuel.

Le rétablissement du bouton natif Game Map n'est pas garanti. Il faut exploiter le nouvel indicateur `H5P.fullscreenSupported` avant tout autre changement.

L'effet réel du CSS sur H5P Standalone et Game Map ne peut être confirmé sur cet environnement, qui ne dispose pas de leurs fichiers de lecteur en exécution dans les tests navigateur. L'amélioration est une hypothèse technique éprouvée par tests avec lecteur simulé ; le test utilisateur reste bloquant.

## Tests effectués

* `python tests/run_all.py` : 13/13 contrôles réussis.
* `python tests/preview_browser.py` : contrôles fonctionnels avec lecteur simulé réussis.
* `python tests/preview_nested_css_browser.py` : mise à jour CSS d'une iframe imbriquée simulée réussie.
* `python tests/preview_fit_height_browser.py` : calcul proportionnel, hotspot cliquable, sortie du mode ajusté et isolation de l'iframe vérifiés sous Chromium simulé.
* Aucune exécution du H5P Game Map réel dans Firefox, aucun contrôle réel de YouTube dans le navigateur cible.

## Contre-recette nécessaire

1. Actualiser GitHub Pages et forcer le rechargement de l'application.
2. Importer le fichier Game Map de référence, ouvrir en plein écran, vérifier qu'aucun défilement vertical n'est nécessaire pour visualiser la carte et que les hotspots restent alignés avant tout clic.
3. Réduire/agrandir à nouveau, puis tester la navigation et la progression.
4. Dans le CSS saisi, essayer `.h5p-game-map-map { outline: 8px solid magenta !important; }`. Vérifier si la bordure apparaît immédiatement puis disparaît quand on vide le champ. Ne pas réimporter le fichier.
5. Dans les paramètres avancés de l'aperçu, relever les diagnostics `CSS : ...`, `Sous-document H5P CSS connecté`, `Navigateur fullscreenEnabled=... ; H5P.fullscreenSupported=...` et les éventuelles lignes `CSP`.
6. Tester les vidéos YouTube avec consentement et relever les diagnostics CSP ; si elles ne s'affichent pas, conserver le statut **échoué**, même si les liens directs permettent leur ouverture.
7. Générer un SCORM et confirmer la non-régression de la génération ; la recette dans Moodle reste distincte.

Aucune nouvelle permission d'origine n'a été accordée au contenu tiers. Les exports SCORM n'ont pas été modifiés.
