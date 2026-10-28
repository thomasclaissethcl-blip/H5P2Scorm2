# Bilan technique du correctif 5.2b

**Référence :** cahier des charges CDC-H5PC-001, exigences NOT-02 à NOT-10.  
**Base :** lot 5.2 transmis le 28 octobre 2026.  
**Statut :** correction développée, tests techniques réussis, recette Moodle sur vrai Interactive Book à réaliser.

## Origine

Les deux SCORM du livre « SST406 Dossier1 » avaient le même comportement malgré l'option d'agrégation expérimentale. Le diagnostic `score-plan-report.json` indiquait `unqualified-library:H5P.ImageHotspots` et désactivait le plan.

L'inspection statique des contenus a montré : 5 chapitres, 4 Question Set regroupant 35 questions H5P.MultiChoice, 3 questions MultiChoice indépendantes, 1 Image Hotspots de 12 hotspots ne contenant que du texte et 9 accordéons contenant uniquement H5P.AdvancedText.

## Modifications

- `src/scorm-score-plan.js` : qualifie uniquement les instances Image Hotspots dont **chaque** hotspot contient exclusivement `H5P.Text` ou `H5P.AdvancedText`, et les accordéons dont **chaque** panneau contient un composant explicitement reconnu comme non noté. Toute autre structure non reconnue est refusée.
- `src/scorm-score-plan.js` : reconnaît `H5P.QuestionSet` comme une **unité de notation unique**, en vérifiant le nombre et le type de ses questions ainsi que leurs identifiants. Les IDs des questions internes sont déclarés séparément comme déjà couverts par le groupe.
- `src/scorm-scoring.js` : ignore les scores émis par ces questions internes, évite le double comptage, mais bloque l'agrégation si un autre score issu d'une unité non prévue est reçu, même invalide ou provisoire. La priorité du score global natif est conservée.
- `src/scorm-scoring.js` : la portée des questions internes est liée à l'état sauvegardé, afin qu'un registre de scores d'un autre périmètre ne soit pas restauré silencieusement.
- `app.js` : communique uniquement au pont SCORM la liste des questions internes à ignorer lorsque le plan expérimental est activé.

## Résultat sur l'Interactive Book étudié

Le plan candidat passe à `enabled: true` avec 7 unités attendues (4 Question Set et 3 questions indépendantes), et 35 identifiants de questions internes déclarés comme déjà compris dans ces unités. Les 12 hotspots textuels sont qualifiés comme non notés pour ce fichier précis.

L'option expérimentale reste **désactivée par défaut**. Quand le livre émet un résultat global natif final, celui-ci reste prioritaire. Une fin sans résultat global ne produit un score agrégé que lorsque les 7 unités ont envoyé des scores numériques finaux exploitables. Un livre soumis prématurément n'obtient pas artificiellement de score agrégé.

## Vérifications

- 29 suites automatisées réussies, dont trois suites supplémentaires sur les sous-structures imbriquées et le pont SCORM avec reprise.
- Essais Chromium simulés : import/analyse et verrouillage des exports, fiche de qualification des moteurs, sans erreur JavaScript.
- Le moteur H5P, la visionneuse, les fonctions CSS, le lecteur YouTube de secours, le profil 3.8.2 et les fichiers statiques d'interface ne sont pas modifiés.
- L'API SCORM 1.2 et sa politique de statuts restent inchangées.

## Limites

Ces tests ne prouvent pas que les vrais événements xAPI du livre concerné correspondent aux 7 identifiants attendus. Ils ne prouvent pas non plus qu'un scénario d'agrégation sans résultat global natif se produit dans Moodle. La correspondance numérique entre les 38 questions et les 38 points du test précédent n'est pas une preuve d'équivalence de leurs barèmes.

Le suivi des événements et les essais sur Moodle restent nécessaires. Une qualification finale ne sera prononcée qu'après les scénarios de contre-recette. La lecture YouTube directement dans Game Map reste une réserve connue et inchangée.
