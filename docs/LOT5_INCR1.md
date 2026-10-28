# Lot 5.1 : premiere consolidation de la notation SCORM 1.2

Referentiel : CDC-H5PC-001, NOT-01 a NOT-10, SCR-03, SCR-04, REC-11 a REC-15, REC-24.
Statut : developpe et teste techniquement ; recette utilisateur Moodle en attente.

## Portee du correctif

- Moteur de decisions xAPI independant du DOM et de SCORM, embarque dans le pont SCORM genere (`src/scorm-scoring.js`).
- Sous-scores reconnus avec identifiant `h5p-subContentId`, y compris son equivalent dans l'URL. Remplacement de la derniere reponse pertinente au lieu d'une addition des tentatives.
- Double emploi des memes statements xAPI ignore lorsque leur `id` est identique.
- Filtrage des scores invalides (valeurs negatives, maximaux nuls, nombres non finis, depassement du bareme).
- Le score global natif reste prioritaire et est normalise dans `cmi.core.score.raw`.
- Pour **H5P.GameMap**, l'evenement racine `answered` avec score est reconnu comme evenement final, pour transmettre aussi le statut `passed` / `failed` / `completed` suivant la politique SCORM.
- Les autres bibliotheques conservent la semantique anterieure de finalisation des evenements racine.
- Le moteur de notation contient une agregation conditionnelle : elle exige la liste explicite et fiable de tous les sous-contenus notes requis, ainsi qu'une preuve de fin au niveau parent. **Aucun plan de ce type n'est genere automatiquement dans ce lot**. De ce fait, les sous-scores observes sans total natif ne sont pas envoyes comme total SCORM.
- Le generateur utilise toujours le profil H5P Standalone 3.8.2.

## Garanties et limites

Un score de 4/5 et 6/10 forme un agregat de 66,67 % **uniquement** si les deux activites composent l'ensemble des exercices attendus et si leur fin est justifiee. Sans inventaire fiable, la note reste indisponible.

Le suivi en memoire des sous-scores ne prouve pas qu'il existe des donnees suffisantes pour reconstituer un resultat apres reouverture. Le stockage des sous-scores entre sessions et la determination automatique des exercices attendus doivent etre developpes et valides dans un lot ulterieur.

Aucun essai reel dans Moodle ou un second LMS n'a ete effectue dans cet environnement. La certification des scores finaux demeure ouverte.

## Technique

Le moteur est fourni depuis `index.html` et le code de sa fabrique (`createTracker`) est insere dans le JavaScript `scorm/h5p-scorm-bridge.js` produit. Aucune dependance reseau supplementaire n'est necessaire a l'execution du SCORM.

Fichiers applicatifs modifies : `app.js`, `index.html`. Fichier applicatif ajoute : `src/scorm-scoring.js`.

Le module ne modifie pas : les profils moteurs, l'analyse des bibliotheques, le lecteur H5P de previsualisation, les styles, YouTube, l'API SCORM 1.2, la reprise et le constructeur du manifeste SCORM.

## Validation technique

- Les tests unitaires eprouvent les evenements globaux et locaux, les duplications, les changements de tentative, les resultats invalides et le calcul conditionnel lorsque les identifiants requis sont fournis.
- Le test d'integration eprouve le pont SCORM genere : `answered` final pour Game Map ; conservation de `incomplete` pour un simple `answered` non final ; absence de note pour un Interactive Book qui n'en fournit pas globalement et dont les exercices attendus ne sont pas connus.
- Les tests existants et les controles Chromium de l'interface doivent rester valides.

## Suite

Lot 5.2 : caracteriser les evenements natifs reels de Game Map et Interactive Book dans Moodle, definir/qualifier les adaptateurs de perimetre et la prise en charge des reprises de tentatives avant d'activer l'agregation SCORM automatique.
