# Lot 5.2 : agrégation conditionnelle des sous-scores, prototype expérimental

**Base :** lot 5.1 accepté (13 scénarios validés). **Date :** 28 octobre 2026.  
**Cahier des charges :** CDC-H5PC-001, NOT-02 à NOT-10, SCR-03 à SCR-05, REC-12 à REC-17, REC-24.

## Ce qui change

- Nouveau module `src/scorm-score-plan.js` : analyse statique **conservatrice** d'Interactive Book. Il reconnaît les chapitres de type `H5P.Column` et les exercices simples `H5P.MultiChoice`, `H5P.Blanks`, `H5P.TrueFalse`, `H5P.DragText`, `H5P.MarkTheWords`. Il exclut les ressources d'affichage connues (`AdvancedText`, `Image`, `Audio`, `Video`). Les exercices imbriqués inconnus, identifiants absents/dupliqués, structures différentes et modèles composites non qualifiés bloquent le plan.
- Game Map **n'est pas agrégé** : son score global dépend de règles de parcours, d'étapes facultatives et de la soumission finale. Son score natif conserve la priorité.
- **Option avancée expérimentale désactivée par défaut.** Elle doit être cochée lors de la génération du SCORM. Si le plan statique n'est pas sûr, le SCORM utilise le comportement du lot 5.1, même lorsque la case est cochée.
- Le moteur attend un événement de fin parent et un sous-score valide pour chaque identifiant du plan avant d'écrire un score agrégé. Chaque nouvelle réponse remplace la précédente. Des scores de sous-exercices inattendus désactivent l'agrégation.
- Le score global H5P fait toujours autorité : il peut remplacer un score agrégé.
- Le registre des résultats du plan peut être sauvegardé dans `cmi.suspend_data`, lorsque la reprise est activée et que la taille le permet. Les anciennes données de reprise restent lisibles. La limite SCORM stricte et les alertes de dépassement existantes sont conservées.
- Le fichier `score-plan-report.json` est inclus dans le ZIP SCORM, avec le plan proposé, l'état d'activation et le plan effectif. Le rapport `generation-report.json` indique aussi l'état de l'agrégation.

## Comportement volontairement inchangé

Avec la case **décochée**, `scorm-scoring.js` continue de recevoir un inventaire vide. Les valeurs et statuts SCORM natifs conservent leur comportement 5.1 ; la sauvegarde sérialisée garde la structure historique `{v:1, records}`. Aucune modification des scripts de lecture H5P, visionneuse, CSS, plein écran, YouTube ou des profils de moteur.

## Limites importantes

1. La liste des exercices attendus est déduite de structures précises d'Interactive Book, **pas de toutes les bibliothèques H5P**. Des activités notées peuvent ne pas émettre d'événements complets : dans ce cas, aucune note agrégée n'est écrite.
2. Le modèle peut être plus strict que nécessaire. Un Interactive Book avec `QuestionSet`, `InteractiveVideo`, des exercices facultatifs ou une structure nouvelle restera en notation native uniquement.
3. L'état de notation peut augmenter la taille de `suspend_data` ; une reprise ne sera pas annoncée comme réussie si le LMS refuse ou si la taille dépasse le budget.
4. La capture xAPI est dépendante de la version des bibliothèques et de leur implémentation. Le test simulé n'établit pas le comportement de tous les vrais H5P.
5. La validation réelle dans Moodle avec un Interactive Book correspondant au plan est indispensable avant utilisation de cette fonction sur des parcours apprenants.

## Validation technique

`python tests/run_all.py --report docs/evidence/lot5-2-tests.json` (26 suites). Tests nouveaux sur structure d'Interactive Book, cas ambigu, score 4/5 + 6/10, doublons, reprise de l'état de notation et priorité au score global natif. Le runtime est testé dans une API SCORM simulée. La compatibilité Game Map 1.9.8 (plan désactivé) a été vérifiée par analyse de l'archive fournie.
