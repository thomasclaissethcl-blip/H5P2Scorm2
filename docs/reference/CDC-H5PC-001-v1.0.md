# Cahier des charges de référence

**Projet :** H5P Converter, visualisation et conversion H5P vers HTML et SCORM 1.2  
**Référentiel :** CDC-H5PC-001  
**Version du document :** 1.0  
**Date :** 23 octobre 2026  
**Statut :** proposition de référentiel initial à valider  
**Base auditée :** archive `H5P2SCorm-main.zip`, application version 1.0.1

> **Règle de gouvernance.** Après validation, ce cahier des charges constitue la référence normative du projet. Toute divergence entre une implémentation et une exigence doit être résolue par correction de l'implémentation ou par modification explicite, justifiée et versionnée du présent document. Une fonctionnalité n'est déclarée conforme qu'après satisfaction de ses critères de recette. Les limitations constatées restent documentées.

## 1. Finalité, objectifs et principes directeurs

Le projet vise à produire une application web conviviale permettant d'importer un ou plusieurs contenus H5P, de les analyser, de les prévisualiser avec un lecteur H5P compatible, de personnaliser leur présentation et de les exporter en HTML autonome ou en SCORM 1.2, avec remontée fiable des résultats lorsqu'une notation est disponible.

**Objectifs de résultat :**

1. Maximiser la compatibilité avec les bibliothèques H5P et les versions de H5P Core effectivement prises en charge par les moteurs disponibles, sans promettre une compatibilité universelle non démontrée.
2. Prévisualiser et tester les interactions avant conversion à l'aide du même profil de lecture que celui de l'export.
3. Produire trois formats : HTML monofichier, HTML multifichier et SCORM 1.2.
4. Récupérer dans SCORM le score natif, ou, lorsque cela est justifié, un score agrégé fiable pour les activités composites telles que Game Map et Interactive Book.
5. Afficher les dépendances H5P, leurs versions exactes et les exigences de H5P Core, tout en distinguant les exigences déclarées et la compatibilité réellement testée.
6. Convertir plusieurs fichiers en lot avec des réglages communs et des diagnostics individuels.
7. Préserver la personnalisation CSS par fichier et par saisie directe, avec aperçu fidèle.
8. Réduire le nombre d'actions à accomplir, en reléguant les paramètres spécialisés dans un mode avancé.

**Principes invariants :** réutilisation de l'existant validé ; conversion principalement locale dans le navigateur ; aucune mise à jour implicite des moteurs ; aucune note inventée ; aucune erreur masquée ; traçabilité des décisions de compatibilité ; résultats reproductibles à versions de dépendances identiques ; respect du standard SCORM 1.2 pour le profil par défaut.

## 2. Périmètre et exclusions

### 2.1 Inclus dans la version cible

L'application comprend l'import et l'analyse de fichiers H5P, la résolution des dépendances, la sélection d'un moteur compatible, la visionneuse, les outils de diagnostic, la localisation conservatrice déjà existante, la personnalisation CSS, les trois exports, le traitement par lots, la communication SCORM 1.2, la reprise de progression lorsque le contenu le permet, les tests et la documentation.

### 2.2 Hors périmètre, sauf décision ultérieure

La création ou modification pédagogique des contenus H5P avec H5P Editor ; l'hébergement public des activités et le suivi des apprenants en dehors d'un LMS ; SCORM 2004, xAPI/LRS et cmi5 comme formats de sortie ; la correction automatique d'une bibliothèque H5P malformée ; l'obtention automatique et sans vérification des bibliothèques manquantes auprès de sources tierces ; la promesse de compatibilité avec tous les navigateurs, tous les LMS ou tous les H5P existants.

Une archive `.h5p` ne contenant que des bibliothèques, sans activité exécutable, doit être reconnue comme telle : son inventaire est possible, mais sa conversion comme activité ne l'est pas.

## 3. État initial et politique de conservation

Le socle fourni est `H5P2SCorm` 1.0.1. Les fichiers `README.md`, `RUNTIME_PROFILE.json`, `MAINTENANCE_MANIFEST.md`, `COMPATIBILITY.md`, `MOODLE.md`, les tests et les fixtures font partie de la base de référence.

| Composant initial | Constat | Décision |
| --- | --- | --- |
| Analyse de `h5p.json`, `content.json`, `library.json` et des dépendances | Présente | Conserver puis modulariser et enrichir |
| Protection des chemins ZIP et contrôles de taille | Présente | Conserver, renforcer et tester |
| Localisation sans écraser les textes personnalisés | Présente | Conserver |
| CSS importé et CSS saisi | Présents | Conserver, mutualiser avec la visionneuse |
| Génération SCORM 1.2 et manifeste | Présente | Conserver puis fiabiliser |
| Score SCORM normalisé sur 100 | Présent | Conserver et élargir aux contenus composites |
| Sauvegarde/reprise de progression | Présente avec limites | Conserver et revalider selon les moteurs |
| H5P Standalone 3.8.2, plafond Core API déclaré 1.28 | Figés | Remplacer par des profils de moteurs versionnés |
| Export HTML monofichier et multifichier | Non proposés | Ajouter |
| Prévisualisation de l'activité | Non proposée | Ajouter |
| Conversion par lots | Non proposée | Ajouter |
| Code central dans `app.js` | Monolithique | Découper en modules testables |

**Point vérifié dans le code initial :** le pont de notation écarte actuellement les événements xAPI issus de sous-contenus. Il accepte des scores globaux émis par l'activité principale, mais ne sait pas agréger lui-même les scores des exerciseurs. Une nouvelle stratégie de notation est donc nécessaire.

**Contrainte de non-régression :** aucune fonction existante ne doit disparaître sans justification, test de remplacement ou validation d'une suppression explicite. Les SCORM déjà produits par les anciennes versions ne sont pas modifiés.

## 4. Utilisateurs et parcours cibles

**Public principal :** ingénieurs pédagogiques, enseignants, administrateurs pédagogiques et concepteurs de formations utilisant H5P et des LMS SCORM.

**Parcours standard :** déposer le ou les fichiers ; recevoir automatiquement un diagnostic ; prévisualiser l'activité ; choisir un format ; éventuellement personnaliser le CSS ; convertir ; récupérer le résultat. Les réglages usuels disposent de valeurs par défaut compréhensibles et documentées.

**Parcours avancé :** ouvrir les informations de compatibilité, examiner les événements de notation, sélectionner une stratégie de score, régler la réussite et la reprise, choisir au besoin un profil de moteur validé, générer un rapport détaillé.

## 5. Exigences fonctionnelles

### 5.1 Import et analyse (IMP)

**IMP-01 [Obligatoire].** Accepter la sélection de fichier, le glisser-déposer et la sélection multiple. Prendre en charge les fichiers `.h5p` et, si leur structure est reconnue, les archives ZIP équivalentes.

**IMP-02 [Obligatoire].** Déclencher automatiquement l'analyse sans bouton « Analyser » supplémentaire dans le parcours standard.

**IMP-03 [Obligatoire].** Vérifier l'intégrité ZIP, la structure H5P attendue, la présence des métadonnées d'activité, les déclarations de bibliothèques, les fichiers référencés et les dépendances d'exécution transitives, dont les dépendances dynamiques.

**IMP-04 [Obligatoire].** Bloquer les chemins dangereux, les collisions et variantes trompeuses de chemins, les archives excessives ou décompressées disproportionnées, les dépendances manquantes et les structures manifestement invalides. Les limites de taille et de nombre d'entrées seront configurables et explicites.

**IMP-05 [Obligatoire].** Afficher pour chaque fichier un état distinct : prêt, prêt avec réserves, incompatible ou invalide. Les erreurs bloquantes sont compréhensibles et associées à une action possible.

**IMP-06 [Obligatoire].** Ne jamais exécuter les scripts H5P pendant la seule phase d'analyse statique.

### 5.2 Bibliothèques, versions et moteurs (CMP)

**CMP-01 [Obligatoire].** Inventorier les bibliothèques embarquées avec `machineName`, versions majeure/mineure/patch, rôle, dépendances et fichiers de ressources utiles.

**CMP-02 [Obligatoire].** Identifier la version minimale de H5P Core API déclarée par chaque bibliothèque d'exécution et l'exigence maximale du contenu. Une propriété `coreApi` absente est traitée selon la spécification H5P, sans transformer cette absence en preuve de compatibilité.

**CMP-03 [Obligatoire].** Distinguer dans l'interface : (a) versions et exigences déclarées par les fichiers, (b) profil de lecteur sélectionné, (c) compatibilité démontrée par des tests. Ne pas présenter comme équivalentes la version de H5P Standalone, la version interne de H5P Core et la version de H5P Core API.

**CMP-04 [Obligatoire].** Gérer un catalogue versionné de profils de moteurs, chacun comportant identification, dépendances, ressources, compatibilité déclarée, niveau de validation et empreintes d'intégrité. Les moteurs sont figés pour une release ; aucune référence `latest` ne doit être utilisée dans une livraison reproductible.

**CMP-05 [Obligatoire].** Choisir automatiquement un profil compatible, dans la mesure des informations disponibles. Une exigence supérieure, une ressource absente ou une incompatibilité documentée empêche le lancement ou l'export correspondant ; le diagnostic doit indiquer pourquoi.

**CMP-06 [Obligatoire].** Utiliser le même profil H5P dans la visionneuse et dans chaque export d'un contenu donné. Les différences imposées par le contexte SCORM sont explicitement documentées.

**CMP-07 [Obligatoire].** Fournir un tableau de compatibilité consultable et un export de rapport incluant versions et dépendances. Les exigences d'H5P Editor sont distinguées de celles du Player ; Editor n'est pas embarqué par défaut pour la simple lecture.

**CMP-08 [Mode avancé].** Permettre une sélection manuelle parmi les seuls profils disponibles et diagnostiqués, avec avertissement si le choix sort du profil recommandé ; aucun contournement silencieux des contrôles de sécurité.

**CMP-09 [Obligatoire].** Une nouvelle bibliothèque ou version de moteur n'est déclarée « compatible » qu'après recette représentative. L'absence de preuve entraîne « non vérifié », et non « compatible ».

### 5.3 Visionneuse (VIS)

**VIS-01 [Obligatoire].** Afficher le H5P importé avant export, avec ses interactions, médias et navigations, sous réserve de compatibilité.

**VIS-02 [Obligatoire].** Prévoir un affichage redimensionnable ou agrandissable et une action simple de remise à zéro de la tentative de prévisualisation.

**VIS-03 [Obligatoire].** Appliquer dans la visionneuse le même CSS personnalisé et la même logique de localisation que ceux prévus pour l'export ; permettre une actualisation de l'aperçu.

**VIS-04 [Obligatoire].** Isoler l'exécution du JavaScript H5P du contexte de gestion de l'application, avec une architecture de sécurité revue spécifiquement. Une iframe de même origine cumulant `allow-scripts` et `allow-same-origin` n'est pas réputée isolante.

**VIS-05 [Obligatoire].** Ne transmettre aucune note à un LMS réel depuis la prévisualisation. Les événements et scores de test sont locaux et réinitialisables.

**VIS-06 [Mode avancé].** Afficher les événements xAPI pertinents, la provenance (activité principale ou sous-contenu), le score observé, le statut, l'identifiant du sous-exercice, le choix de la source faisant autorité et les avertissements d'agrégation. Aucune information personnelle non nécessaire n'est incluse dans un rapport par défaut.

**VIS-07 [Obligatoire].** Si l'aperçu est indisponible mais l'analyse statique possible, conserver l'accès au diagnostic. L'export n'est autorisé que si ses conditions de compatibilité et de sécurité propres sont remplies.

### 5.4 Personnalisation et localisation (PER)

**PER-01 [Obligatoire].** Maintenir l'import d'un CSS local et une zone de saisie CSS. Les deux peuvent être utilisés simultanément.

**PER-02 [Obligatoire].** Appliquer la cascade dans l'ordre : styles d'origine, CSS importé, CSS saisi. Préserver explicitement les mécanismes de priorité CSS, y compris spécificité et `!important` ; « dernier chargé » n'est pas une garantie de priorité absolue.

**PER-03 [Obligatoire].** Prévisualiser les changements et les intégrer de manière identique aux exports lorsque le format le permet. Préciser les limitations éventuelles de CSS dans des iframes internes H5P.

**PER-04 [Obligatoire].** Conserver la langue et les textes personnalisés de l'auteur. Une localisation automatique ne remplace pas les textes modifiés par l'auteur et fournit un bilan des modifications.

**PER-05 [Mode avancé].** Autoriser la personnalisation CSS globale du lot et, facultativement, un remplacement CSS pour un fichier déterminé.

### 5.5 Export HTML multifichier (HMF)

**HMF-01 [Obligatoire].** Produire une archive ZIP contenant un `index.html`, les bibliothèques, les ressources, le moteur de lecture, les médias et les feuilles de style nécessaires.

**HMF-02 [Obligatoire].** Permettre l'exécution à partir d'un hébergement statique HTTP(S) standard, sans backend applicatif ni CDN requis à l'exécution.

**HMF-03 [Obligatoire].** Inclure un rapport de génération mentionnant moteur, bibliothèques, paramètres et éventuelles limitations. Les chemins relatifs doivent fonctionner après extraction dans un sous-répertoire.

**HMF-04 [Obligatoire].** Ne pas inclure le pont de communication SCORM dans l'export HTML simple.

### 5.6 Export HTML monofichier (HMO)

**HMO-01 [Obligatoire].** Produire, pour les contenus techniquement compatibles avec ce mode, un seul fichier `.html` intégrant les scripts, styles et ressources nécessaires.

**HMO-02 [Obligatoire].** Assurer le fonctionnement sans accès au réseau des fichiers réellement intégrables ; définir et tester séparément l'ouverture via `file://` et via HTTP(S), car leurs restrictions de sécurité diffèrent.

**HMO-03 [Obligatoire].** Fournir une résolution fiable des chemins et des ressources dynamiques (images, sons, vidéos, polices, JSON, bibliothèques). Ne pas supposer qu'une simple conversion de toutes les URL en `data:` fonctionne avec chaque H5P.

**HMO-04 [Obligatoire].** Pour un contenu ou un navigateur incompatible avec l'exécution monofichier, émettre une impossibilité explicite et proposer l'HTML multifichier, sans produire silencieusement un fichier inutilisable.

**HMO-05 [Obligatoire].** Surveiller les limites de mémoire et la taille finale ; éviter les chargements simultanés inutiles et signaler les situations à risque.

### 5.7 Export SCORM 1.2 (SCR)

**SCR-01 [Obligatoire].** Générer un ZIP SCORM 1.2 conforme, avec `imsmanifest.xml` à la racine, un SCO lançable, des références de ressources valides et tous les fichiers nécessaires pour une exécution autonome dans un LMS prenant en charge SCORM 1.2.

**SCR-02 [Obligatoire].** Initialiser la connexion via l'API JavaScript SCORM 1.2, gérer lecture/écriture, `LMSCommit`, erreurs, durée de session et `LMSFinish`, y compris lors des sorties normales et reprises, dans les limites des garanties du navigateur.

**SCR-03 [Obligatoire].** Écrire le score dans `cmi.core.score.raw` normalisé sur 0 à 100, avec `cmi.core.score.min=0` et `cmi.core.score.max=100`, uniquement si une note valide est disponible.

**SCR-04 [Obligatoire].** Gérer correctement les statuts autorisés par `cmi.core.lesson_status`, avec trois politiques : automatique, seuil de réussite et achèvement seul. Le seuil proposé par défaut reste de 80 %, modifiable dans le mode avancé.

**SCR-05 [Obligatoire].** Conserver la reprise lorsque l'activité sait exposer et restaurer son état. Respecter la limite normative de `cmi.suspend_data` (4 096 caractères), avec une marge opérationnelle de 4 000 et une compression compatible avec le navigateur. Ne jamais tronquer l'état sans signaler l'échec.

**SCR-06 [Mode avancé].** Maintenir un profil Moodle étendu uniquement en tant qu'option expérimentale, désactivée par défaut, clairement distincte de la conformité SCORM 1.2 stricte ; sa valeur de 64 000 caractères doit être confirmée par la configuration du LMS cible.

**SCR-07 [Obligatoire].** Ne pas établir de dépendance avec un domaine distant pendant l'exécution du SCORM généré, sauf dépendance intrinsèque explicitement déclarée du contenu et acceptée par l'utilisateur ; un tel export doit être signalé comme non entièrement autonome.

**SCR-08 [Obligatoire].** Préserver les scores et statuts cohérents lors de la reprise, des réouvertures, de la répétition d'un sous-exercice et des événements xAPI dupliqués.

### 5.8 Notation des activités composites (NOT)

**NOT-01 [Obligatoire].** Détecter les événements de score et d'achèvement de l'activité principale et de ses sous-contenus, en respectant la sémantique des événements H5P/xAPI.

**NOT-02 [Obligatoire].** Utiliser prioritairement le résultat global final natif fiable de l'activité composite, lorsqu'il est disponible. Les sous-scores qui le composent ne sont alors pas additionnés une seconde fois.

**NOT-03 [Obligatoire].** En l'absence de score global final, agréger uniquement des sous-scores numériques valides dont le périmètre et la sémantique sont maîtrisés, suivant `100 × somme(scores acquis) / somme(scores maximaux)` ; un maximum nul, une valeur invalide ou un résultat sans dénominateur exploitable ne participe pas au calcul.

**NOT-04 [Obligatoire].** Identifier de manière stable chaque sous-exercice et sa tentative. Une nouvelle réponse remplace le résultat précédent de la même unité de notation et de la même tentative ; les événements répétés ne créent pas de double comptage.

**NOT-05 [Obligatoire].** Distinguer le score provisoire affiché en diagnostic du score final transmis au LMS. Le passage au résultat final exige une condition d'achèvement fiable et un ensemble de scores délimité, ou une règle spécifique validée pour la bibliothèque.

**NOT-06 [Obligatoire].** Ne pas inventer de notes pour les interactions non notées, les exercices optionnels ou les activités muettes. Si un total fiable ne peut être établi, envoyer au plus un statut d'achèvement justifié et afficher « score indisponible ».

**NOT-07 [Obligatoire].** Distinguer fin de l'activité et réussite : un score présent ne démontre pas à lui seul que tous les exercices sont terminés. Un événement `answered` ne suffit pas systématiquement à clôturer une activité composite.

**NOT-08 [Obligatoire].** Prévoir des adaptateurs de notation spécifiques lorsque nécessaire, à commencer par Game Map et Interactive Book. Vérifier les conditions d'émission du score global, notamment les options de reporting de H5P Standalone pour Interactive Book.

**NOT-09 [Mode avancé].** Permettre les stratégies « automatique (global natif puis agrégation fiable) », « global natif uniquement », « achèvement seul ». Les ajustements de pondération ne sont autorisés que s'ils sont explicitement configurés et documentés ; aucune pondération supposée.

**NOT-10 [Obligatoire].** Produire un journal de décision exploitable en recette : score source, périmètre, identifiant, mise à jour, événements rejetés, méthode de calcul et justification du statut final.

**Exemple indicatif :** deux exercices indépendants et obligatoires, de 4/5 et 6/10, donnent `100 × 10/15 = 66,67 %`, à condition que l'activité soit réellement terminée et qu'aucun résultat global natif prioritaire ne s'y substitue. Si l'un des deux exercices est absent et que l'activité n'est pas terminée, aucun score final ne doit être annoncé.

### 5.9 Traitement par lots (LOT)

**LOT-01 [Obligatoire].** Permettre l'import et l'analyse de plusieurs fichiers dans une même opération, sans limite arbitraire basse ; les limites sont celles de ressources et de sécurité documentées.

**LOT-02 [Obligatoire].** Appliquer par défaut le format et les réglages communs à tous les contenus ; montrer les diagnostics individuels et les éventuelles exceptions.

**LOT-03 [Obligatoire].** Isoler les échecs : un H5P invalide ou incompatible ne doit pas empêcher la conversion des autres.

**LOT-04 [Obligatoire].** Afficher la progression globale et par fichier, le nombre de réussites, les avertissements et les échecs, sans créer une interface encombrée.

**LOT-05 [Obligatoire].** Produire un ZIP de livraison rassemblant les exports, en préservant une organisation et des noms sûrs, déterministes et sans collision, plus un rapport de lot JSON et une synthèse lisible.

**LOT-06 [Obligatoire].** Gérer la mémoire par traitement séquentiel ou à concurrence maîtrisée et libérer les ressources après chaque conversion.

### 5.10 Interface et accessibilité (UX)

**UX-01 [Obligatoire].** Écran principal organisé autour de l'import, l'aperçu, le choix du format et un bouton principal « Convertir ».

**UX-02 [Obligatoire].** Import et diagnostic automatiques ; commandes avancées regroupées dans un panneau fermé par défaut. Ne pas contraindre l'utilisateur à traverser plusieurs pages d'assistant.

**UX-03 [Obligatoire].** Interface en français, claire, adaptative au desktop et utilisable sur tablette. Prévoir une architecture de traduction de l'interface.

**UX-04 [Obligatoire].** Respecter autant que possible WCAG 2.2 niveau AA pour l'interface du convertisseur : navigation clavier, libellés, contrastes, focus visible, annonces des erreurs et états, sans prétendre corriger automatiquement l'accessibilité des contenus H5P tiers.

**UX-05 [Obligatoire].** Distinguer avertissement et échec bloquant ; ne jamais présenter un résultat « converti » si sa génération ou son contrôle final a échoué.

**UX-06 [Obligatoire].** Le mode avancé fournit les versions H5P, le diagnostic xAPI/score, les politiques SCORM, les options de reprise, les journaux et les paramètres de compatibilité.

## 6. Exigences non fonctionnelles

**NFR-01 [Sécurité].** Analyser le ZIP sans exécuter de code. Contrôler traversées de répertoires, entrées dupliquées, archive ZIP malveillante, liens ou chemins inattendus, volumes compressés disproportionnés et ressources externes. La visionneuse exécute du code tiers dans une isolation conçue et testée ; aucune instruction JavaScript présente dans le H5P ne doit pouvoir lire les fichiers importés voisins ou modifier l'interface hôte.

**NFR-02 [Confidentialité].** Par défaut, contenu H5P et CSS restent localement dans le navigateur. Aucun envoi à un serveur du projet, à un service analytique ou à un service d'IA. Les éventuels téléchargements de moteurs sont documentés ; aucune ressource de contenu n'est envoyée pour déterminer la compatibilité.

**NFR-03 [Déploiement].** Le convertisseur doit rester publiable sur un hébergement statique tel que GitHub Pages, sans backend requis pour les fonctions centrales. Les dépendances de conversion seront idéalement fournies localement avec la distribution afin d'éviter le recours à un CDN à chaque opération.

**NFR-04 [Reproductibilité].** Versions et sommes de contrôle des moteurs et outils embarqués figées. La même entrée avec les mêmes paramètres et profils doit produire un résultat fonctionnel équivalent ; les éléments variables de métadonnées, par exemple la date de génération, sont consignés.

**NFR-05 [Robustesse].** Défaillance d'un H5P, d'un moteur, d'un export ou d'un fichier d'un lot sans blocage durable de l'interface. Libération des URL temporaires, objets ZIP et contextes de prévisualisation.

**NFR-06 [Performance].** Ne fixer aucun seuil chiffré universel avant mesure sur corpus représentatif. Définir avant la recette les tailles de fichiers, le volume maximal de lot et les navigateurs de référence ; surveiller temps de traitement, mémoire et taille d'export. La progression doit rester visible lors d'une opération longue.

**NFR-07 [Compatibilité navigateur].** Cibler les versions stables maintenues de Firefox, Chromium/Chrome et Edge ; Safari si disponible dans la campagne de tests. Les capacités variables (`CompressionStream`, URL Blob, `file://`, politiques de sécurité) font l'objet de tests et de chemins de repli.

**NFR-08 [Traçabilité].** Rapports exploitables par machine (`generation-report.json`, rapport de compatibilité et rapport de lot) et lisibles par une personne. Numéro de version du convertisseur, moteur et profil retenus, politiques de notation et limites y figurent.

**NFR-09 [Droits].** Préserver les mentions de licence des composants tiers et les métadonnées de droits des contenus. Les restrictions propres aux contenus importés doivent être rappelées ; la licence du code de l'application doit être décidée avant publication open source.

## 7. Architecture fonctionnelle cible

L'implémentation doit isoler au minimum les domaines suivants, sans imposer un framework particulier :

1. **Importateur / validateur** : ZIP, structures H5P, dépendances, garde-fous.
2. **Catalogue de compatibilité** : profils de lecteurs, versions Core API déclarées, tests et sélection.
3. **Résolveur de ressources** : chemins, médias, JS, CSS, ressources dynamiques, stratégies d'export.
4. **Moteur de lecture commun** : initialisation et configuration reproductible pour aperçu et exports.
5. **Visionneuse isolée** : rendu, reset, agrandissement, collecte d'événements et diagnostics.
6. **Localisation et styles** : conservation de l'existant, injection CSS et aperçu.
7. **Moteur de notation** : interprétation xAPI, registre des sous-exercices, règles de fin, agrégation et adaptateurs.
8. **Pont SCORM 1.2** : API LMS, persistance, score, statut, erreurs et reprise.
9. **Exportateurs** : HTML multifichier, HTML monofichier, SCORM.
10. **Orchestrateur de lots et rapports** : file de travaux, gestion mémoire, packaging et résultats.
11. **Interface utilisateur** : vue principale, options avancées, accessibilité et état de progression.

**Invariance :** l'analyse ne charge pas le lecteur ; le lecteur n'assume pas le LMS ; le pont SCORM n'est présent que dans le SCORM ; les trois exportateurs utilisent un modèle de contenu et un mécanisme de résolution de ressources cohérents.

L'éditeur H5P, avec ses propres bibliothèques et dépendances, n'est pas requis pour un lecteur. Le diagnostic peut indiquer les bibliothèques liées à l'édition et signaler que celles-ci ne sont pas nécessaires au fonctionnement de l'export de lecture.

## 8. Contrats de données et livrables de génération

**Données minimales d'analyse :** identifiant du fichier, nom, taille, empreinte lorsque calculée, bibliothèque principale, liste versionnée des dépendances, exigences Core API, ressources, avertissements, erreurs, profil choisi et compatibilité documentée.

**Données minimales de score :** identifiant de l'activité, identifiant stable du sous-exercice, identifiant de tentative, origine de l'événement, horodatage logique, résultat obtenu, maximum, indicateur d'achèvement, caractère provisoire ou final, méthode d'agrégation et motif de refus ou d'acceptation d'un score.

**Rapport de génération :** version du générateur ; version du profil moteur ; format ; décisions de compatibilité ; options CSS, localisation et notation ; mécanisme de reprise ; fichiers produits ; erreurs et avertissements ; informations permettant une reproduction fonctionnelle.

**Formats de sortie :**

| Sortie | Fichier remis | Contenu attendu |
| --- | --- | --- |
| HTML monofichier | `.html` | Un document exécutable unique, autonome dans les conditions de navigateur certifiées |
| HTML multifichier | `.zip` | `index.html`, moteur, ressources, bibliothèques, rapports |
| SCORM 1.2 | `.zip` | `imsmanifest.xml`, SCO, moteur, contenus, pont SCORM et rapports |
| Lot | `.zip` | Un artefact par contenu réussi, rapport global, erreurs individuelles |

Les rapports techniques peuvent être intégrés dans les ZIP multifichiers, SCORM et lots. Pour le HTML strictement monofichier, les métadonnées de génération sont intégrées au document sans créer de deuxième fichier ; le rapport complet reste téléchargeable séparément en mode avancé si nécessaire.

## 9. Comportement SCORM et reprise

La version cible utilise uniquement les éléments de données SCORM 1.2 pertinents et autorisés : `cmi.core.lesson_status`, `cmi.core.score.raw`, `cmi.core.score.min`, `cmi.core.score.max`, `cmi.core.session_time`, `cmi.core.exit`, `cmi.suspend_data` et, le cas échéant, `cmi.core.lesson_location`. Aucun champ propre à SCORM 2004 (`cmi.score.scaled`, `cmi.success_status`, `cmi.completion_status`) ne doit être utilisé comme interface SCORM 1.2.

L'application distingue une **tentative de prévisualisation** et une **tentative LMS**. Les événements de la première ne peuvent être persistés dans la seconde. La source du score final, l'état de fin et la disponibilité de la note sont déterminés séparément. Un contenu non noté peut être terminé ; un score provisoire ne garantit ni fin ni réussite.

La capture et la restauration de l'état H5P restent dépendantes des API effectivement implémentées par chaque bibliothèque. Un état trop volumineux ne doit pas être tronqué. La capacité standard est limitée ; les compromis possibles sont une compression vérifiée, une reprise partielle explicitement présentée ou la désactivation de la reprise pour le contenu concerné. Aucun repli ne doit perdre silencieusement des données antérieures.

## 10. Campagne de compatibilité et matrice de validation

La matrice de validation est versionnée dans le dépôt. Elle contient pour chaque couple bibliothèque/version de H5P et profil de moteur : import, analyse, aperçu, CSS, HTML multi, HTML mono, SCORM, score, achèvement, reprise, navigateur et LMS testés. Chaque cellule distingue « réussi », « échoué », « non applicable » et « non testé », avec date et référence du test.

Le corpus initial doit comporter des versions variées et des fonctionnalités représentatives : Game Map, Interactive Book, Course Presentation, Interactive Video, Question Set, Branching Scenario, Drag and Drop, Fill in the Blanks, ainsi que des activités sans score, des contenus avec bibliothèques manquantes, des Core API incompatibles et des bibliothèques avec ressources dynamiques ou iframe.

La validation LMS nécessite au minimum Moodle et un second environnement réellement compatible SCORM 1.2. Les versions des LMS, navigateurs, bibliothèques et moteurs utilisés sont consignées. La phrase « compatible avec tout environnement SCORM » signifie que le paquet respecte SCORM 1.2 et n'utilise pas de mécanismes exclusivement Moodle ; les différences et limitations constatées des LMS sont documentées.

## 11. Critères de recette vérifiables

Chaque critère ci-dessous est bloquant pour la fonctionnalité correspondante, sauf exception écrite et versionnée.

| Test | Procédure minimale | Résultat attendu |
| --- | --- | --- |
| REC-01 Import valide | Importer un H5P complet | Analyse automatique, inventaire exact, aperçu disponible si compatible |
| REC-02 H5P invalide | Charger ZIP corrompu et H5P sans activité | Erreur explicite, aucun script exécuté, aucun faux export |
| REC-03 Dépendance absente | Charger package à bibliothèque manquante | Dépendance nommée, export bloqué tant que non résolue |
| REC-04 Core API | Charger un H5P dont la Core API requise dépasse le profil | Profil non compatible détecté ; aucune déclaration trompeuse |
| REC-05 Aperçu | Interagir, agrandir et réinitialiser un H5P | Activité opérationnelle, réinitialisation sans réimport, isolation vérifiée |
| REC-06 CSS | Importer un CSS puis ajouter une règle saisie | Rendu d'aperçu conforme au même moteur en export |
| REC-07 HTML multifichier | Extraire le ZIP et servir en HTTP(S) statique | Rendu et interactions sans CDN ni backend |
| REC-08 HTML monofichier | Ouvrir un H5P certifié en `file://` puis HTTP(S) | Fonctionnement conforme aux conditions certifiées, sans réseau |
| REC-09 HTML mono non supporté | Importer un cas de ressources non résolubles | Blocage explicite du monofichier et proposition multifichier |
| REC-10 SCORM packaging | Inspecter ZIP, manifest et ressources | Paquet SCORM 1.2 structurellement valide, SCO lançable |
| REC-11 Score simple | Répondre à une activité notée 9/10 | `cmi.core.score.raw = 90`, statut selon la politique retenue |
| REC-12 Score composite natif | Jouer une activité avec résultat global | Score global utilisé ; aucun double comptage des sous-exercices |
| REC-13 Score composite agrégé | Terminer deux exercices 4/5 et 6/10 sans global | Après fin fiable, score SCORM 66,67 (selon arrondi retenu) |
| REC-14 Doublons et reprises | Répondre deux fois, réouvrir et recevoir doublons xAPI | Pas de double comptage ; dernière réponse pertinente conservée |
| REC-15 Score non disponible | Activité sans score ou périmètre d'agrégation inconnu | Aucun score fictif ; statut d'achèvement seulement si justifié |
| REC-16 Reprise stricte | Fermer et rouvrir un SCO avec état sauvegardable | Restauration vérifiée, `cmi.suspend_data` dans le budget strict |
| REC-17 Reprise hors limite | Produire un état supérieur à la capacité autorisée | Avertissement contrôlé, absence de troncature ou corruption |
| REC-18 Moodle | Exécuter un paquet et consulter le relevé de notes | Score, statut et reprise cohérents avec les règles choisies |
| REC-19 Second LMS | Rejouer les scénarios SCORM de base | Score et statut récupérés sans extension Moodle |
| REC-20 Batch mixte | Mélanger H5P valide, invalide et incompatible | Conversions valides produites ; erreurs isolées ; rapport complet |
| REC-21 Sécurité | Tester traversée ZIP, ZIP bomb et H5P actif malveillant | Fichiers refusés ou activité contenue sans compromission de l'interface |
| REC-22 Accessibilité | Vérifier clavier, focus, erreurs, contrastes | Interface du convertisseur conforme à la cible d'accessibilité |
| REC-23 Traçabilité | Examiner les rapports et profils d'une génération | Versions, paramètres, méthode de score et limitations identifiables |
| REC-24 Non-régression | Relancer fixtures et tests existants | Fonctions antérieures préservées ou changements explicitement approuvés |

**Mécanisme de preuve :** chaque recette dispose d'un scénario, d'une fixture ou d'un contenu de test identifié, d'un résultat automatisé ou d'un compte rendu manuel, et d'un état signé dans la matrice. Un résultat « testé manuellement » ne remplace pas un test automatisé et inversement.

## 12. Stratégie de tests

**Tests unitaires :** validation ZIP, construction du graphe de dépendances, analyse des versions, sélection moteur, résolution des chemins, règles d'agrégation, politique des statuts, sérialisation de reprise, composition CSS et production de rapports.

**Tests d'intégration :** lecteur intégré à la visionneuse ; jeux xAPI réels et synthétiques ; adaptation des ressources HTML ; création de manifeste SCORM ; cycle complet de l'API SCORM simulée, y compris erreurs de commit et fermeture.

**Tests de bout en bout :** parcours standard à partir d'un H5P réel ; HTML mono et multi ; SCORM dans Moodle puis dans un second LMS ; lot mixte ; essais sur navigateurs de référence ; usage clavier.

**Tests de sécurité :** fuzzing ciblé ZIP/JSON/chemins, scénarios d'exécution hostile dans l'aperçu, vérification CSP/origine, absence de transmission involontaire et contrôle des dépendances logicielles.

Les tests préexistants du dépôt doivent continuer à être exécutés pendant toute la refonte. Les nouvelles fonctionnalités créent leurs propres fixtures et tests de non-régression. Les incompatibilités découvertes sont capitalisées dans la matrice plutôt que masquées par des exceptions génériques.

## 13. Phasage, dépendances et points de validation

**Phase 0, gel du socle.** Exécuter les tests initiaux, conserver une archive de référence immuable, inventorier les comportements et identifier les scénarios manuels reproduisibles. Livrable : état initial vérifié.

**Phase 1, architecture et lecteur commun.** Extraire l'analyse, les profils de moteur, les ressources et la localisation/CSS ; construire la visionneuse isolée ; mettre à disposition le diagnostic de compatibilité. **Validation 1 :** aperçu réel de plusieurs H5P et non-régression de l'analyse.

**Phase 2, notation et SCORM.** Refaire le moteur de suivi des scores avec adaptateurs composites ; consolider statuts, reprise et pont LMS ; maintenir le format SCORM. **Validation 2 :** Game Map, Interactive Book et exercices simples testés jusqu'au carnet de notes dans Moodle, puis sur un second LMS.

**Phase 3, exports HTML et batch.** Ajouter HTML multifichier, puis monofichier avec ses limitations explicites ; intégrer la conversion par lots et les rapports. **Validation 3 :** fonctionnement hors connexion des exports admissibles, lot mixte et gestion mémoire.

**Phase 4, ergonomie et stabilisation.** Simplifier l'interface, intégrer le mode avancé, compléter l'accessibilité, la documentation et la compatibilité navigateur. **Validation 4 :** campagne de recette complète, documentation et préparation de release.

Le passage d'une phase à la suivante exige les tests de la phase courante et la vérification de la non-régression. Les fonctions instables ne sont pas rebaptisées « terminées » pour respecter un calendrier.

## 14. Livrables attendus

1. Code source refactorisé, avec historique et versionnement.
2. Application statique publiable et exécutable dans les navigateurs retenus.
3. Visionneuse H5P intégrée et outil de diagnostic de notation en mode avancé.
4. Trois exportateurs et orchestrateur de conversion par lots.
5. Catalogue de moteurs avec profils figés, notes de compatibilité et licences.
6. Tests automatisés, fixtures et comptes rendus de recette Moodle et second LMS.
7. Documentation d'utilisation, de déploiement statique, de création des exports et de réglage Moodle.
8. Documentation technique : architecture, API internes, événements xAPI, choix de score et reprise.
9. Matrice de compatibilité à jour, journal des changements et registre des limitations.
10. Rapport de génération, rapports individuels et de lot, ainsi qu'une liste des vérifications de release.

## 15. Conditions de livraison et de publication

Une version stable ne peut être publiée que si :

- les exigences obligatoires annoncées pour cette version sont satisfaites et testées ;
- aucune régression majeure n'affecte les fonctions conservées ;
- la génération SCORM est vérifiée dans Moodle et au moins un autre LMS SCORM 1.2 pour le corpus minimal convenu ;
- Game Map et Interactive Book ont fait l'objet de tests de score final, de sous-scores et de reprise selon les possibilités des bibliothèques utilisées ;
- les profils et versions de moteur effectivement compatibles sont publiés ;
- les limitations de HTML monofichier, des bibliothèques H5P et des LMS sont documentées ;
- la sécurité de l'import et de la visionneuse a été revue ;
- les mentions de licence, la documentation, le journal de modifications et les empreintes des livrables sont disponibles.

Un format ou une bibliothèque qui ne satisfait pas à ses critères de recette reste disponible uniquement avec un statut expérimental explicite, ou est temporairement désactivé. Une telle décision doit être actée dans le registre de projet.

## 16. Risques et réponses attendues

| Risque | Réponse de conception |
| --- | --- |
| H5P anciens ou récents incompatibles avec un lecteur unique | Catalogue de moteurs profilés, critères de sélection, matrice testée |
| Bibliothèques absentes d'un fichier H5P | Diagnostic exact, blocage, pas de téléchargement arbitraire |
| Ressources dynamiques non intégrables en HTML unique | Résolveur dédié, essais `file://`, repli vers HTML multifichier |
| Absence de résultat global et sous-scores incomplets | Agrégation conditionnelle, adaptateurs, refus de score final fictif |
| Différences Moodle/autres LMS | Profil SCORM strict par défaut, recette multi-LMS |
| `suspend_data` trop court pour certains états | Compression, limites contrôlées, alerte et absence de troncature |
| Exécution de JavaScript H5P hostile dans l'aperçu | Isolation réelle, modèle d'origine, contrôles réseau et de permissions |
| Activités H5P avec dépendances externes | Déclaration et traitement explicite ; aucune autonomie revendiquée à tort |
| Consommation mémoire lors de gros lots | File de traitement bornée, nettoyage entre fichiers, suivi de progression |
| Régression lors de la modularisation | Tests existants conservés et critères de non-régression |

## 17. Gouvernance du cahier des charges

Le présent document est la référence principale une fois validé. Les arbitrages sont consignés dans un **registre des décisions** associé au projet, comprenant : identifiant, date, exigence concernée, proposition, justification, conséquences, tests à adapter et décision. Chaque évolution validée augmente le numéro du cahier des charges et met à jour la matrice de traçabilité entre exigences, code, tests et livraison.

**Statuts autorisés des exigences :** proposée, validée, en développement, implémentée, vérifiée, bloquée, abandonnée sur décision. Le statut « implémentée » ne vaut pas « vérifiée ».

**Priorisation :** toutes les exigences marquées **Obligatoire** relèvent du périmètre cible et sont nécessaires à l'acceptation finale. Les éléments marqués **Mode avancé** sont également à développer lorsqu'ils constituent une capacité explicitement demandée, mais ne doivent pas alourdir le parcours standard ; le caractère avancé concerne leur visibilité, pas une priorité de développement moindre. Les fonctionnalités uniquement expérimentales restent signalées comme telles.

**Référence en cas de conflit :** exigence validée du présent cahier des charges, puis décision de modification approuvée, puis tests de recette documentés, puis documentation technique courante. Le code hérité ne prévaut pas sur une exigence explicitement révisée.

## 18. Références vérifiées

Les documents suivants fondent les contraintes techniques. Les versions de logiciels, les capacités et les comportements doivent être réexaminés lors des mises à jour :

- H5P, spécification du fichier `.h5p` : https://h5p.org/documentation/developers/h5p-specification
- H5P, définition de `h5p.json` : https://h5p.org/documentation/developers/json-file-definitions
- H5P, définition de `library.json`, y compris `coreApi` et dépendances : https://h5p.org/library-definition
- H5P, événements xAPI : https://h5p.org/node/2397
- H5P Standalone Player, documentation du projet : https://github.com/tunapanda/h5p-standalone
- SCORM 1.2, référence des éléments d'exécution : https://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/
- MDN, sécurité des iframes et de l'attribut `sandbox` : https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe
- Projet d'origine : fichiers `README.md`, `RUNTIME_PROFILE.json`, `MAINTENANCE_MANIFEST.md`, `COMPATIBILITY.md`, `MOODLE.md`, `THIRD_PARTY_NOTICES.md` et tests contenus dans `H5P2SCorm-main.zip`.

## 19. Points à faire valider avant le gel contractuel

Le document établit les règles par défaut ci-dessus. Restent à approuver explicitement : le nom public du produit ; la licence du code source ; les configurations minimales des machines et les volumes de lot de référence ; le corpus exact de vrais packages H5P et les versions Moodle / second LMS disponibles pour la recette ; la liste des moteurs distribuables compte tenu de leurs licences ; et les exceptions admises, le cas échéant, pour les ressources externes et le HTML monofichier.

Ces arbitrages ne doivent pas servir à différer les travaux d'analyse, de modularisation et de prototypage, mais une publication déclarée « conforme à la totalité du cahier des charges » doit les documenter.

---

**Fin du cahier des charges CDC-H5PC-001, version 1.0.**
