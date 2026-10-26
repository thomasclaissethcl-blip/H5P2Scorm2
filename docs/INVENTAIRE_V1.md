# Inventaire de la V1.0.1 et politique de conservation

| Fonction ou composant | Preuve source | État du lot 1 | Décision |
| --- | --- | --- | --- |
| Import `.h5p` unique, sélection et glisser-déposer | `index.html`, `app.js` | Présent ; tests UI partiels | Conserver, étendre au lot |
| Analyse de `h5p.json`, `content.json`, `library.json` | `app.js` fonction `analyzeH5P` | Tests de fixtures réussis | Modulariser sans régression |
| Dépendances transitives et contrôle de Core API | `app.js`, `RUNTIME_PROFILE.json` | Vérification automatisée du plafond 1.28 | Conserver, introduire profils ultérieurement |
| Contrôles ZIP et chemins | `app.js` et fixtures | Présents, sécurité complète non démontrée | Renforcer lors de la refonte |
| Localisation conservatrice | `app.js`, fixture `poc-language.h5p` | Test de fixture partiel | Conserver, mutualiser aperçu/export |
| CSS local importé et CSS saisi | `index.html`, `app.js` | Structure UI vérifiée, rendu non certifié | Conserver, prévisualiser dans le futur |
| Générateur SCORM 1.2 | `app.js` fonction `generateScorm` | Tests runtime simulés réussis | Conserver puis fiabiliser |
| Configuration SCORM, statuts, seuil et manifeste | `app.js`, `tests/runtime-smoke.mjs` | Couverture automatisée partielle | Conserver et étendre |
| Score global normalisé à 100 | `app.js` `bridgeSource` | Tests simulés partiels | Conserver, ajouter agrégation conditionnelle |
| Agrégation des sous-scores | `bridgeSource` ignore `isSubcontent(st)` | Absente | Implémenter au lot notation |
| Sauvegarde/reprise | `app.js`, `RUNTIME_PROFILE.json` | Tests runtime simulés | Conserver avec limites normatives |
| Limite suspend_data 4 000 / profil 64 000 | `RUNTIME_PROFILE.json`, `app.js` | Présent ; profil étendu expérimental | Conserver comme choix explicite |
| Rapports intégrés à l'export | `app.js`, `README.md` | Code présent | Étendre le diagnostic |
| Lecteur H5P Standalone 3.8.2 | `app.js`, `RUNTIME_PROFILE.json` | Version figée | Profils versionnés futurs |
| JSZip 3.10.1 via jsDelivr | `index.html` | Dépendance distante déclarée | Migrer à terme sans changer la V1 |
| Visionneuse avant export | Aucun composant dédié | Absente | Lot 3 |
| Exports HTML mono et multifichier | Aucun export disponible | Absents | Phase 3 |
| Conversions batch | UI mono-activité | Absentes | Phase 3 |
| Interface simplifiée et mode avancé | Interface V1 à étapes | Non implémentés | Phase 4 |

**Interprétation :** « présent » désigne l'existence d'une fonctionnalité dans le code. Cela ne signifie pas « conforme aux 75 exigences du CDC » ni « testée dans tous les contextes ».

## Fichiers initiaux maintenus strictement inchangés au lot 1

`app.js`, `index.html`, `styles.css`, `VERSION`, `README.md`, `RUNTIME_PROFILE.json`, `tests/runtime-smoke.mjs`, `tests/validate_fixtures.py`, `tests/validate_release.py`, `tests/validate_ui.py` ainsi que les six fixtures originales. Comparaison de contenu effectuée avec l'archive initiale.
