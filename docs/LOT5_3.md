# Lot 5.3 : preuve de notation de secours SCORM 1.2

Référence : `CDC-H5PC-001`, version 1.0 ; base de développement : correctif 5.2b accepté.

## Portée du développement

La politique pédagogique reste identique : **priorité au score global natif**, aucune agrégation si le périmètre est ambigu, aucune note partielle envoyée à Moodle. L'option de calcul des sous-scores reste **expérimentale et désactivée par défaut**.

Le lot 5.3 fournit trois éléments :

1. Une méthode de diagnostic dans le SCO généré, `window.H5PConverterScoreAudit()`, renvoyant le type de score réellement écrit (`none`, `aggregate` ou `native`), le nombre d'unités de score attendues et reçues, le caractère final du résultat et les indicateurs de blocage. Aucune identité de l'apprenant, aucun identifiant individuel de question et aucun événement xAPI complet n'y figurent. Le diagnostic est conservé en mémoire uniquement. Il ne modifie ni l'API du LMS ni `cmi.suspend_data`.
2. La sauvegarde dès la réception d'un sous-score éligible **lorsque la reprise et un plan d'agrégation explicite sont activés**. Avant ce correctif, ces sous-scores étaient principalement sauvegardés lors d'une sauvegarde périodique ou d'un événement global. La dernière sauvegarde asynchrone sollicitée prévaut pour éviter qu'une compression terminée tardivement écrase un état plus récent.
3. Une preuve d'intégration utilisant le vrai `bridgeSource` produit par le convertisseur, avec un LMS simulé et des événements xAPI **synthétiques** fondés sur le plan structurel du livre SST406 (sept unités, 35 identifiants imbriqués exclus). La suite contrôle le score 27/38 = 71,05 %, l'absence de note partielle, le double comptage, les résultats inattendus, la nouvelle réponse, la reprise SCORM, la priorité native et le comportement lorsque l'option est désactivée.

## Diagnostic dans un SCORM réel

Dans Moodle, ouvrir l'activité SCORM générée avec ce lot, puis les outils de développement du navigateur (Firefox : F12). Dans la console, choisir le contexte de la fenêtre ou iframe du SCO contenant `scorm/h5p-scorm-bridge.js`, puis exécuter :

```javascript
window.H5PConverterScoreAudit()
```

Lire `scoreSource` :

- `native` : le score racine du H5P a été transmis ; **c'est le cas normal attendu d'un Interactive Book classique** après l'envoi du rapport ;
- `aggregate` : le moteur a effectivement calculé la note à partir de toutes les unités attendues après un signal final sans score racine ;
- `none` : aucun score n'a été transmis par ce suivi depuis l'ouverture du SCO.

`scoreFinal` indique si ce résultat était final ; `expectedUnits`, `observedUnits`, `unexpectedScoredChild`, `aggregateReady` et `nativeFinal` permettent de comprendre la décision. L'état du diagnostic est réinitialisé à chaque ouverture du SCO. Pour voir un résultat après reprise, réaliser une action notée après réouverture ; le diagnostic n'est pas lui-même sauvegardé.

## Paquet SCORM technique de recette

Le fichier `SCORM12_RECETTE_AGREGATION_LOT5_3.zip` est **exclusivement un test**, qui n'embarque pas H5P Standalone ni les contenus du livre. Il injecte des événements xAPI de synthèse dans le pont SCORM livré. À utiliser dans un cours Moodle de test, jamais dans un cours évalué d'apprenants :

1. Importer le ZIP comme activité SCORM 1.2 de test, avec suivi des résultats activé et seuil de réussite à 80 % (repris dans le manifeste).
2. Cliquer sur **1. Émettre sept sous-scores (27/38)** : aucune nouvelle note ne doit être communiquée au LMS.
3. Cliquer sur **2. Finaliser sans score global** : la note doit être **71,05/100**, statut `failed` avec la politique simulée.
4. Cliquer sur **3. Émettre un score global natif (31/38)** : la note doit devenir **81,58/100**, statut `passed`.
5. Vérifier que la console du SCO indique `scoreSource: aggregate` à l'étape 2, puis `scoreSource: native` à l'étape 3.

Les données affichées dans l'activité et dans le carnet de notes peuvent différer selon la configuration d'évaluation de Moodle, ou si Moodle conserve des tentatives antérieures. Employer une **tentative neuve** et un compte de test pour chaque campagne.

**Limites de preuve :** les tests Node.js et Chromium utilisent un LMS et des événements xAPI simulés. Le paquet technique pourra faire confirmer les écritures SCORM dans le vrai Moodle, mais ne démontre pas qu'un véritable Interactive Book émet une fin sans score global. Pour un livre standard, la source native peut rester prioritaire et être toujours utilisée.

## Fichiers modifiés

- `app.js` : pont SCORM, diagnostic de provenance et sauvegarde des sous-scores éligibles.
- `tests/run_all.py` : ajoute la suite de preuve.
- `tests/scorm-fallback53.mjs`, `tests/fixtures/interactive-book-score53.json` : nouvelle preuve sur sept unités.
- `tests/generate_qa_scorm53.mjs` : génération reproductible du paquet de recette.
- `tests/qa_scorm_browser53.py` : test Chromium facultatif (Playwright requis).
- `docs/evidence/LOT5_3_SIMULATION.json` : résultats reproductibles et explicites quant à la simulation.

Les autres fichiers applicatifs, la visionneuse, YouTube, les profils des moteurs, le constructeur du plan H5P et l'interface restent inchangés.
