# Correctif expérimental lot 3.2 : contre-recette Firefox / Game Map

Référence : `CDC-H5PC-001`, exigences VIS-01 à VIS-07, PER-01 à PER-03 et NFR-01.
Base : lot 3.1, sans modification intentionnelle de la génération SCORM.
Date : 26 octobre 2026.

## Réception de la contre-recette 3.1

- 5 réussis : CR3-01, CR3-02, CR3-03, CR3-08, CR3-10.
- 3 échoués : CR3-04 (redimensionnement), CR3-06 (CSS saisi), CR3-09 (YouTube).
- 2 non testés : CR3-05 (plein écran natif), CR3-07 (CSS importé).
- Verdict utilisateur : rejeté / corrections demandées.

## Interventions sur les anomalies

**CR3-04, mise en page.** Les notifications de redimensionnement sont relancées après la mise en page (double `requestAnimationFrame` et rappel différé) et propagées aux instances H5P qui exposent un mécanisme `resize` ou un événement `resize`. L'affichage agrandi est conservé. Un bouton « Plein écran » supplémentaire fait appel à l'API Fullscreen du navigateur depuis la page hôte ; il ne remplace pas la commande native propre à certaines bibliothèques H5P.

**CR3-05, bouton natif H5P.** Absence observée dans le lot 3.1. Le bouton ajouté « Plein écran » concerne la visionneuse, pas le bouton natif du contenu. La présence d'une commande H5P native reste à diagnostiquer dans le lecteur réel.

**CR3-06/07, personnalisation CSS.** Actualisation du CSS dans le document principal et les sous-documents accessibles. Pour les sous-frames à origine opaque, un petit agent de synchronisation est injecté à la fin de la ressource `frame.bundle.js` du lecteur et échange seulement du CSS avec son parent par `postMessage`, à l'aide d'un identifiant aléatoire par prévisualisation. Les iframes tierces (YouTube) ne reçoivent pas ce CSS. L'origine opaque et le `sandbox="allow-scripts"` sont conservés. Cela nécessite une recette réelle, en particulier sur Firefox.

**CR3-09, vidéos YouTube.** La lecture embarquée dans l'aperçu reste expérimentale. Le projet conserve les restrictions de sécurité et l'option de consentement. Les URLs YouTube HTTPS explicitement mentionnées dans les objets `video/YouTube` du H5P sont rendues sous forme de liens directs, utilisables volontairement dans un nouvel onglet. Ces liens ne garantissent pas le comportement pédagogique de la vidéo intégrée dans le H5P ; CR3-09 reste ouvert. Aucun téléchargement de contenu vers le projet ou appel distant automatique n'est créé par les liens de secours.

## Vérifications locales effectuées

- 13/13 suites de non-régression : réussies.
- Chromium simulé : lecture des ressources, iframe sandboxée, CSS de document principal, xAPI simulé et absence de redémarrage : réussis.
- Chromium simulé avec sous-document distinct à origine opaque : propagation du CSS par agent interne après actualisation : réussie.
- Chromium simulé : réception des notifications `resize` sans redémarrage : réussie.
- Aucun test direct dans Firefox disponible dans cet environnement.
- Aucun test complet avec H5P Standalone réel ou sur GitHub Pages depuis cet environnement.

## Conditions de mise à jour

1. Mettre à jour les fichiers dans l'arborescence exacte du dépôt GitHub Web.
2. Publier GitHub Pages, actualiser sans cache puis réimporter le fichier Game Map de référence.
3. Tester CR3-04, CR3-05, CR3-06, CR3-07 en priorité.
4. Tester CR3-09 séparément : regarder si la lecture intégrée est toujours bloquée, puis vérifier les liens YouTube externes de secours.
5. Faire une dernière vérification de génération SCORM (CR3-10).

**Statut : lot 3 ouvert.** Ce correctif ne constitue pas une acceptation fonctionnelle. La sécurité de la visionneuse face à un H5P volontairement hostile nécessite également une revue spécialisée avant release stable.
