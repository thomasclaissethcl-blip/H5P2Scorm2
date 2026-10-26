# Lot 3 : visionneuse H5P expérimentale

**Date :** 26 octobre 2026  
**Branche :** `development/phase-1-preview`  
**Version applicative publique :** 1.0.1 (pas de nouvelle release stable)  
**Référentiel :** CDC-H5PC-001, version 1.0

## Fonctionnalités implémentées

- Après analyse favorable, l'application prépare automatiquement un aperçu dans une iframe avec `sandbox="allow-scripts"` et **sans** `allow-same-origin`.
- Le code du lecteur H5P Standalone 3.8.2 est téléchargé par l'application hôte depuis l'URL CDN déjà utilisée par la V1 (version figée). Aucun contenu H5P n'est téléversé sur le serveur du convertisseur.
- La seule archive importée et ses ressources (JSON, bibliothèques, médias), ainsi que le CSS importé et saisi, sont copiées en mémoire dans le cadre isolé par `postMessage` avec transfert des `ArrayBuffer`.
- Résolution locale par chemins virtuels `https://preview.invalid/` pour `fetch`, XHR et les propriétés DOM les plus courantes (`script`, `link`, `img`, `media`, `source`). Les CSS sont adaptés pour leurs URL de ressources.
- Boutons « Recommencer » et « Agrandir », relance lors du changement de CSS, diagnostic xAPI simplifié.
- Les tentatives de prévisualisation ne transmettent **aucun score à un LMS**. Le pont SCORM précédent est inchangé.
- Protection contre une consommation excessive à la préparation de l'aperçu : limite provisoire de 120 Mio et 4 000 fichiers. Ces seuils sont **spécifiques à l'aperçu**, ils ne limitent pas les exports existants.

## Sécurité : périmètre réellement démontré

Les vérifications dans Chromium ont confirmé : iframe à origine opaque inaccessible à l'application hôte par DOM, chargement de données virtuelles, interdiction de `fetch` externe dans le cadre, absence de navigation autorisée vers la fenêtre parente. Le CSP de l'aperçu restreint les scripts aux blocs internes et aux `blob:` et interdit les frames internes, les `connect` natifs, les formulaires, et les chargements de ressources externes ordinaires.

**Important :** aucune garantie d'absence de tout trafic réseau n'est donnée pour du JavaScript volontairement malveillant. Une navigation à l'intérieur même de l'iframe peut rester possible suivant le navigateur. En particulier, le CSP ne constitue pas une politique universelle d'interdiction de toutes les navigations. Les liens, formulaires spéciaux, comportements des lecteurs et exfiltrations possibles restent à auditer. Ne pas considérer la visionneuse expérimentale comme un environnement sûr pour des contenus intentionnellement hostiles. La décision de conception finale `DEC-009` reste ouverte.

## Tests exécutés

- **13 suites automatisées réussies sur 13** via `python tests/run_all.py` : tests du socle V1, analyse H5P modulaire, pont SCORM, sécurité de chemins et construction de ressources de l'aperçu.
- **3 scénarios Chromium existants** : analyse de fichiers de test avec un faux JSZip, sans erreur JavaScript.
- **Test Chromium spécifique au nouvel aperçu** : iframe sandbox, lecture d'un JSON virtuel, chargement d'image simulée, CSS, interaction, XHR, blocage du fetch externe, réinitialisation et réouverture. **Le lecteur est remplacé par un substitut maîtrisé** dans ce test.
- Vérification syntaxique Node des nouveaux modules.

## Non encore validé

1. Aucun véritable contenu H5P n'a été ouvert avec H5P Standalone 3.8.2 dans cet environnement. L'accès au CDN était indisponible au cours de ce lot. La présence du code d'initialisation ne garantit donc pas la lecture de chaque H5P.
2. Les contenus utilisant des iframes internes sont actuellement bloqués par le CSP de la visionneuse. Les bibliothèques reposant sur des requêtes réseau particulières, `Worker`, des iframes, des ressources dynamiques complexes ou des API du navigateur peuvent échouer. Ces limites sont explicites, il faudra des profils et des tests réels.
3. La mise en page et le rendu du CSS ne sont pas certifiés identiques à ceux des exports SCORM sur un corpus réel.
4. La sécurité face à un H5P volontairement malveillant nécessite une campagne supplémentaire. Les contrôles actuels ne valent pas audit de sécurité complet.
5. Aucun contrôle Moodle ni second LMS n'a été effectué pour ce lot, et le moteur de notation composite n'a pas été modifié.

## Décision de livraison

**Prototype testable, fonctionnalité expérimentale.** Les exigences `VIS-01` à `VIS-07` sont **en développement**, elles ne sont pas déclarées vérifiées. La suite de la phase 1 doit utiliser des archives H5P réelles, examiner les incompatibilités puis consolider l'architecture de résolution des ressources.
