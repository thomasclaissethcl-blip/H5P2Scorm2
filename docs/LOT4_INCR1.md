# Lot 4, incrément 1 : catalogue et inventaire des versions

Référence : CDC-H5PC-001 v1.0, exigences CMP-01 à CMP-09 et REC-24.
Date : 26 octobre 2026.
Statut : développé, tests locaux réussis, validation utilisateur GitHub Pages attendue.

## Règle de sécurité des régressions

La version 3.6 est la base fonctionnelle figée. Son **seul profil actif** reste
`h5p-standalone-3.8.2-core-1.28`. Aucune mise à jour du Player, du runtime H5P,
du constructeur de SCORM ni du pont xAPI/SCORM n'a été introduite. L'interface
de prévisualisation, le CSS dynamique, la géométrie de Game Map, son plein écran
natif et le lecteur YouTube de secours ont conservé exactement leur code source.

Deux versions publiées de H5P Standalone, 3.8.1 et 3.8.0, figurent maintenant
au catalogue à titre documentaire et sont **désactivées**. Elles ne sont pas
annoncées compatibles et ne peuvent être choisies. La composition du package,
les exigences Core API et le fonctionnement de chaque version nécessitent des
tests propres avant activation. Ne pas confondre version du Player et version
interne de H5P Core. Sources :
https://github.com/tunapanda/h5p-standalone/releases
https://www.npmjs.com/package/h5p-standalone?activeTab=versions

## Capacités ajoutées

- `src/engine-catalog.js` : catalogue immuable, sélection restrictive du profil
  de référence, création d'un rapport JSON de compatibilité et inventaire des
  bibliothèques d'exécution, principale et embarquées non nécessaires.
- Interface : panneau « Versions et moteurs H5P (diagnostic avancé) », fermé par
  défaut ; tableau des bibliothèques avec versions majeur/mineur/patch et
  exigences Core API déclarées ; statut de qualification de chaque Player.
- Téléchargement local : `diagnostic-versions-h5p.json`, sans envoi à un service.
  Ce fichier inclut le détail des bibliothèques et des dépendances, la version
  du lecteur, les avertissements et les limites du diagnostic.
- Matrice initiale : `docs/ENGINE_COMPATIBILITY_MATRIX.csv`.

## Portée du contrôle

Le fichier H5P décrit ses bibliothèques et certaines exigences en H5P Core API.
Ces déclarations permettent de **refuser une incompatibilité connue**, mais ne
constituent pas une preuve de fonctionnement. Les bibliothèques sans `coreApi`
restent acceptées selon la politique héritée ; cette absence est signalée dans
le rapport. H5P Editor n'est pas nécessaire à la lecture. Les bibliothèques
encore indisponibles et les ressources dynamiques non déclarées restent des
limites connues.

## Tests effectués

- 16/16 suites exécutées avec `python tests/run_all.py`.
- Parité des six fixtures avec le code V1.0.1 conservée.
- `python tests/browser_smoke.py` : trois scénarios de routage d'interface,
  JSZip simulé, dont les cas Core API trop récente et dépendance manquante.
- `python tests/engine_catalog_browser.py` : véritable Game Map fourni comme
  source de données, lecture du rapport JSON et ses 37 bibliothèques, bouton
  d'export resté activé. Le lecteur et JSZip sont simulés ; pas de lecture H5P
  réelle dans Chromium ni d'essai Moodle dans ce test.
- Régression de sécurité : versions candidates interdites ; API supérieure à
  1.28 toujours refusée.

## Non couverts et prochaine évolution

Sélection multi-runtime réellement fonctionnelle, vérification et empreintes
cryptographiques des assets propres à chaque version, matrice de validation
multi-bibliothèques, moteurs antérieurs, HTML monofichier/multifichier, batch et
notation composite. Ces fonctions ne sont pas présentées comme livrées.

## Retour arrière

Restaurer les trois fichiers applicatifs `app.js`, `index.html`, `styles.css`
de la livraison lot 3.6 et retirer uniquement `src/engine-catalog.js`. Les autres
fichiers ajoutés sont des tests et de la documentation. Aucune suppression d'un
fichier 3.6 n'est requise pour l'installation normale.
