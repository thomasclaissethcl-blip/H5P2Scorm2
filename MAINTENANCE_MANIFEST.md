### Référence technique, lot 8.4b

`src/html-singlefile-preflight.js` est supprimé et ne doit plus être chargé. Les boutons `singlefileDiagnosticBtn` et `singlefileResourceBtn` sont supprimés ; aucun remplacement utilisateur n'est nécessaire. Le diagnostic actif est effectué dans le journal du générateur et dans `H5PConverterSinglefileAudit()` à l'intérieur de l'export (usage technique). Le collecteur `src/html-singlefile-resources.js` et ses protections sont toujours requis pour l'export HTML monofichier interactif.

# Manifeste de maintenance et de reprise du projet

Ce document est la référence de transmission pour toute personne ou toute nouvelle instance de ChatGPT amenée à maintenir **H5P vers SCORM 1.2**.

Il faut le lire avec `README.md`, `RUNTIME_PROFILE.json`, `COMPATIBILITY.md`, `MOODLE.md`, `CHANGELOG.md` et les tests du dossier `tests/` avant toute modification.

## 1. Finalité du projet

L'application convertit un fichier `.h5p` en paquetage SCORM 1.2 autonome, principalement destiné à Moodle. Elle fonctionne comme une application statique sur GitHub Pages et réalise la conversion dans le navigateur.

Contraintes de conception à préserver :

- aucun Node.js, Python ou serveur applicatif requis sur le poste de l'utilisateur final ;
- aucun envoi du fichier H5P ou du CSS vers un backend du projet ;
- SCORM 1.2 comme format de référence ;
- Moodle comme LMS de validation prioritaire ;
- conservation de la possibilité de reprise d'une tentative ;
- score SCORM normalisé de 0 à 100 ;
- runtime H5P versionné et figé pour une release donnée ;
- aucune mise à jour automatique vers `latest` ;
- génération bloquée lorsque la compatibilité ne peut pas être raisonnablement garantie.

## 2. État technique de la V1

Version applicative : `1.0.1`.

Runtime : `h5p-standalone 3.8.2`.

Plafond H5P Core API déclaré : `1.28`.

Le plafond Core API est une déclaration de compatibilité du projet. Il n'est pas découvert automatiquement dans le lecteur. Il doit être revérifié à chaque changement de runtime. Le fichier `RUNTIME_PROFILE.json` est la fiche d'identité de ce couple application/runtime.

La conversion suit cette chaîne :

```text
.h5p
  -> ouverture ZIP dans le navigateur
  -> validation de la structure et des chemins
  -> inventaire des library.json
  -> résolution récursive des dépendances d'exécution
  -> contrôle des exigences coreApi
  -> localisation conservatrice
  -> ajout du CSS personnalisé
  -> ajout du runtime H5P figé
  -> ajout du bridge SCORM 1.2
  -> imsmanifest.xml
  -> ZIP SCORM final
```

## 3. Invariants à ne pas casser

### 3.1 Analyse H5P

L'analyse ne doit pas exécuter le JavaScript contenu dans le H5P.

Elle doit au minimum :

- exiger `h5p.json` et `content/content.json` ;
- vérifier les chemins ZIP et refuser les chemins absolus ou contenant `..` ;
- inventorier les bibliothèques présentes ;
- résoudre les dépendances `preloadedDependencies` et `dynamicDependencies` ;
- bloquer une dépendance d'exécution absente ;
- identifier la bibliothèque principale ;
- vérifier `coreApi` sur les bibliothèques réellement requises ;
- bloquer une bibliothèque qui exige une Core API supérieure au plafond déclaré ;
- bloquer un `coreApi` présent mais non interprétable ;
- conserver les limites de sécurité sur le nombre d'entrées et la taille décompressée.

Une bibliothèque ancienne sans propriété `coreApi` explicite reste acceptée. Sa compatibilité réelle doit alors être couverte par les tests et la matrice de compatibilité.

### 3.2 Localisation

La localisation ne doit pas écraser un texte personnalisé par l'auteur.

Le mécanisme compare les valeurs de `content.json` aux valeurs par défaut de `semantics.json`. Une traduction provenant de `language/<langue>.json` peut remplacer une valeur absente ou encore égale au défaut source. Une formulation personnalisée doit rester intacte.

### 3.3 SCORM et score

Le score envoyé au LMS doit rester normalisé sur 100 :

```text
cmi.core.score.min = 0
cmi.core.score.max = 100
cmi.core.score.raw = pourcentage obtenu
```

Les trois politiques de statut doivent rester disponibles : automatique, seuil de score, achèvement seul.

Le bridge doit initialiser SCORM avant toute lecture ou écriture, enregistrer le temps de session, renseigner `cmi.core.exit`, effectuer les commits nécessaires et terminer proprement la session.

### 3.4 Reprise de progression

La reprise est une fonction centrale de cette V1.

Le bridge capture l'état H5P en priorité via `getCurrentState()` sur une instance H5P accessible, y compris dans une iframe de même origine. Il utilise `H5PIntegration.contents[...].contentUserData` comme repli.

Le format natif attendu par le core embarqué dans H5P Standalone 3.8.2 pour la restauration est de la forme :

```json
{
  "0": {
    "state": "{...JSON sérialisé...}"
  }
}
```

Deux représentations sont actuellement stockables dans `cmi.suspend_data` :

- `H5P3R:` pour l'état brut ;
- `H5P3Z:` pour l'état compressé avec Deflate et encodé en Base64.

Règles à préserver :

- ne jamais tronquer silencieusement `cmi.suspend_data` ;
- en mode strict, rester sous la limite opérationnelle de 4000 caractères ;
- si un nouvel état ne tient pas, conserver le dernier état sauvegardable ;
- les messages de sauvegarde réussie ne doivent pas apparaître dans l'activité ;
- seules les alertes utiles ou les erreurs peuvent être affichées ;
- le mode Moodle 64K reste expérimental tant qu'il n'est pas validé sur un Moodle administré avec l'option correspondante.

## 4. Politique de compatibilité H5P Core API

Chaque `library.json` peut déclarer une exigence :

```json
"coreApi": {
  "majorVersion": 1,
  "minorVersion": 28
}
```

La V1.0.1 déclare un plafond de compatibilité `1.28` pour le runtime H5P embarqué.

Si une bibliothèque requise demande `1.29` ou davantage, la génération doit être bloquée. Il ne faut pas simplement afficher un avertissement et produire le SCORM.

Lorsque le runtime H5P est mis à jour, le mainteneur doit déterminer le nouveau plafond à partir des sources amont et de tests. Il ne faut jamais augmenter la constante uniquement pour faire disparaître un message d'incompatibilité.

## 5. Que faire lorsqu'une nouvelle bibliothèque H5P devient incompatible

Suivre cet ordre :

1. Conserver le fichier H5P qui reproduit le problème comme fixture de test si sa licence et sa taille le permettent. Sinon créer une fixture minimale reproduisant la propriété concernée.
2. Lire son `h5p.json` et ses `library.json` pour identifier la bibliothèque principale, les dépendances et les exigences `coreApi`.
3. Vérifier les versions actuellement publiées de H5P Standalone et les changements récents de H5P Core.
4. Ne pas modifier immédiatement `PLAYER_VERSION`.
5. Exécuter la suite de tests de la version actuelle afin d'obtenir un état de référence.
6. Conserver la release précédente intacte. Créer une branche, une copie de travail ou un dossier versionné dédié à la mise à jour. Ne jamais travailler directement sur le seul exemplaire de la dernière release stable.
7. Étudier les notes de version du nouveau runtime et les modifications du core H5P portant sur :
   - initialisation des contenus ;
   - structure de `H5PIntegration` ;
   - `contentUserData` ;
   - `getUserData` et `setUserData` ;
   - `getCurrentState()` ;
   - autosave et `saveFreq` ;
   - événements xAPI ;
   - structure CSS et polices ;
   - fichiers présents dans la distribution `dist`.
8. Mettre à jour le runtime dans le code uniquement après cette analyse.
9. Mettre à jour la liste `PLAYER_DIST_FILES` si la distribution a changé.
10. Réévaluer explicitement le plafond Core API et mettre à jour ensemble :
    - `app.js` ;
    - `RUNTIME_PROFILE.json` ;
    - `README.md` ;
    - `COMPATIBILITY.md` ;
    - `THIRD_PARTY_NOTICES.md` si nécessaire ;
    - `CHANGELOG.md`.
11. Relancer tous les tests automatisés.
12. Effectuer les tests manuels Moodle décrits plus bas.
13. Publier une nouvelle release seulement lorsque les régressions connues sont documentées ou corrigées.

## 6. Mise à jour de H5P Standalone

Ne jamais utiliser `@latest` dans une release de production.

La version est définie dans `app.js` par `PLAYER_VERSION`. Le convertisseur récupère actuellement les fichiers de cette version sur jsDelivr au moment de la conversion, puis les embarque dans le SCORM final.

Lors d'un changement de version :

1. consulter la page des releases H5P Standalone ;
2. comparer la structure `dist` avec `PLAYER_DIST_FILES` ;
3. inspecter `src/h5p-standalone.ts` pour les options de restauration et de sauvegarde ;
4. inspecter `vendor/h5p/js/h5p.js` pour le comportement réel de `H5P.getUserData`, de l'autosave et de `previousState` ;
5. vérifier que `customCss`, `contentUserData`, `saveFreq` et les événements xAPI restent disponibles ou adapter le bridge ;
6. mettre à jour les tests avant de déclarer la nouvelle version compatible.

Si H5P Standalone cesse d'être maintenu, trois voies sont possibles, par ordre de préférence :

1. adopter un autre lecteur autonome maintenu ;
2. maintenir un fork limité du lecteur actuel ;
3. construire une couche de chargement directement autour du core H5P officiel.

Le bridge SCORM, la génération ZIP, la localisation et l'interface doivent rester aussi indépendants que possible du lecteur afin de faciliter ce remplacement.

## 7. Protocole de tests automatiques

Avant toute release, exécuter au minimum :

```bash
node --check app.js
node tests/runtime-smoke.mjs
python tests/validate_fixtures.py
python tests/validate_ui.py
python tests/validate_release.py
```

GitHub Actions exécute ces contrôles automatiquement.

Les tests doivent couvrir :

- syntaxe de l'application ;
- génération des sources SCORM ;
- score 0 à 100 ;
- statut `passed`, `failed`, `completed`, `incomplete` selon les cas ;
- sauvegarde de `suspend_data` ;
- compression ;
- restauration dans le format natif du core H5P ;
- profil strict et profil Moodle étendu ;
- dépendance manquante ;
- H5P invalide ;
- Core API future bloquée ;
- éléments obligatoires de l'interface ;
- cohérence des métadonnées de release et absence de dépendance `@latest` dans le code publié.

Un changement du mécanisme de reprise doit toujours ajouter ou adapter un test reproduisant précisément le problème corrigé.

## 8. Protocole de test manuel Moodle

Les tests automatiques ne remplacent pas un test réel LMS.

Réglages Moodle recommandés pour la validation :

- nombre de tentatives : 1 ;
- forcer une nouvelle tentative : non ;
- forcer terminé : non ;
- mode aperçu : désactivé ;
- auto-commit : oui ;
- affichage dans la fenêtre actuelle ;
- note maximale : 100.

Scénario de reprise obligatoire :

1. créer une nouvelle activité SCORM avec le package à tester ;
2. démarrer la tentative ;
3. progresser d'au moins deux ou trois étapes dans un contenu qui expose un état, Game Map étant le cas de référence actuel ;
4. quitter l'activité sans la terminer ;
5. rouvrir la même tentative ;
6. vérifier que Moodle indique toujours une seule tentative ;
7. vérifier que le H5P restaure la progression ;
8. terminer le contenu ;
9. vérifier le score et le statut remontés au carnet de notes ;
10. si possible, consulter le journal SCORM pour confirmer les appels `LMSInitialize`, `LMSSetValue`, `LMSCommit` et `LMSFinish`.

Une release modifiant le runtime, la reprise ou le bridge ne doit pas être déclarée stable avant ce test.

## 9. Matrice de compatibilité

`COMPATIBILITY.md` doit distinguer :

- les tests automatisés ;
- les tests manuels Moodle ;
- les types H5P non encore qualifiés ;
- les versions de bibliothèques lorsque cette information est disponible.

Ne pas transformer un test réussi sur un fichier en garantie pour toutes les versions futures du même type de contenu.

## 10. Versionnement

Utiliser un versionnement sémantique pragmatique :

- `PATCH`, par exemple `1.0.2`, pour correction de bug, durcissement ou documentation sans modification majeure de comportement ;
- `MINOR`, par exemple `1.1.0`, pour nouveau runtime H5P validé, nouveau format de sortie optionnel ou nouvelle fonction compatible avec la V1 ;
- `MAJOR`, par exemple `2.0.0`, pour changement de standard principal, refonte du modèle de persistance ou rupture de compatibilité de l'interface.

Chaque release doit mettre à jour `VERSION` et `CHANGELOG.md`. Une release publiée doit être considérée comme immuable. Les travaux suivants partent d'une nouvelle branche, d'une nouvelle copie ou d'un nouveau numéro de version.

Les anciens SCORM déjà générés ne doivent jamais être modifiés automatiquement. Ils restent des artefacts figés de la version qui les a produits.

## 11. Politique de dépendances et réseau

La V1.0.1 utilise encore jsDelivr pendant la conversion :

- JSZip est chargé par la page du convertisseur ;
- la distribution figée de H5P Standalone est récupérée au moment de générer le SCORM.

Le SCORM généré est ensuite autonome.

Une future version pourra embarquer ces dépendances directement dans le dépôt GitHub Pages afin de permettre une conversion sans dépendance réseau. Cette évolution doit conserver les versions figées et les mentions de licences.

## 12. Sécurité

Ne jamais retirer les protections suivantes sans remplacement équivalent :

- refus des chemins ZIP non sûrs ;
- limites sur le nombre d'entrées ;
- limites sur la taille décompressée ;
- absence d'exécution du code H5P pendant l'analyse ;
- blocage des dépendances d'exécution manquantes ;
- blocage des exigences Core API supérieures au runtime déclaré.

Un fichier H5P contient du JavaScript exécutable. Le SCORM généré exécute ce code lorsqu'il est lancé. Les utilisateurs doivent donc convertir des H5P provenant de sources de confiance.

## 13. Fichiers à connaître

`app.js` : analyse H5P, localisation, génération SCORM, runtime et bridge.

`index.html` : interface du convertisseur.

`styles.css` : présentation et aides contextuelles.

`RUNTIME_PROFILE.json` : identité du runtime et plafond Core API déclaré.

`tests/runtime-smoke.mjs` : comportement du bridge, score et reprise.

`tests/validate_fixtures.py` : validation structurelle des fixtures et contrôle Core API de test.

`tests/validate_ui.py` : garde-fous de l'interface et des constantes de release.

`COMPATIBILITY.md` : résultats de compatibilité réellement observés.

`MOODLE.md` : réglages LMS conseillés.

`THIRD_PARTY_NOTICES.md` : dépendances et licences tierces.

## 14. Sources amont à vérifier lors d'une maintenance

Toujours consulter les sources actuelles avant de prendre une décision de compatibilité :

- H5P Standalone : https://github.com/tunapanda/h5p-standalone
- Releases H5P Standalone : https://github.com/tunapanda/h5p-standalone/releases
- H5P Core PHP : https://github.com/h5p/h5p-php-library
- Définition des fichiers H5P : https://h5p.org/documentation/developers/json-file-definitions
- Documentation Moodle SCORM : https://docs.moodle.org/en/SCORM_module
- Référence SCORM 1.2 : https://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/

Les URL peuvent évoluer. Si une page n'est plus disponible, rechercher sa version officielle actuelle plutôt que de supposer que le comportement est inchangé.

## 15. Checklist de release

Avant de publier :

- [ ] `VERSION` mis à jour ;
- [ ] `APP_VERSION` cohérent ;
- [ ] runtime et plafond Core API cohérents avec `RUNTIME_PROFILE.json` ;
- [ ] aucune dépendance passée à `latest` ;
- [ ] `PLAYER_DIST_FILES` comparé à la distribution réelle du runtime ;
- [ ] tests automatiques tous réussis ;
- [ ] fixture d'incompatibilité Core API toujours bloquée ;
- [ ] Game Map ou contenu de reprise équivalent testé dans Moodle si le runtime ou le bridge change ;
- [ ] score sur 100 vérifié ;
- [ ] reprise après fermeture vérifiée ;
- [ ] `COMPATIBILITY.md` mis à jour ;
- [ ] `CHANGELOG.md` mis à jour ;
- [ ] `THIRD_PARTY_NOTICES.md` vérifié ;
- [ ] archive finale testée avec un outil ZIP ;
- [ ] empreinte SHA-256 produite pour la release.

## 16. Instruction de prise de relais pour une autre instance de ChatGPT

Lorsqu'une autre instance reprend le projet, lui fournir le dépôt ou l'archive complète et lui demander de suivre cette séquence :

```text
Tu reprends la maintenance du projet H5P vers SCORM 1.2.

Avant toute modification :
1. Lis intégralement README.md, MAINTENANCE_MANIFEST.md, RUNTIME_PROFILE.json, COMPATIBILITY.md, MOODLE.md, CHANGELOG.md et THIRD_PARTY_NOTICES.md.
2. Inspecte app.js et les tests existants.
3. Exécute la suite de tests actuelle et conserve le résultat comme référence.
4. Ne mets jamais une dépendance sur latest.
5. Ne relève jamais le plafond H5P Core API uniquement pour contourner un blocage.
6. Pour toute nouvelle incompatibilité H5P, examine d'abord les library.json et leur coreApi, puis les releases et sources amont du runtime.
7. Toute modification de la reprise doit être couverte par un test automatisé reproduisant le cas et par un test manuel Moodle avant release stable.
8. Préserve les invariants de sécurité, la normalisation du score sur 100, la non-troncature de suspend_data et la préservation des textes auteur.
9. Mets à jour ensemble VERSION, APP_VERSION, RUNTIME_PROFILE.json, CHANGELOG.md et COMPATIBILITY.md lorsque nécessaire.
10. Ne modifie jamais rétroactivement les SCORM déjà générés.
```

Ce protocole prévaut sur une tentative de mise à jour rapide ou automatique. En cas d'incertitude, conserver la version actuelle, documenter l'incompatibilité et bloquer la génération plutôt que produire un paquet dont le comportement n'est pas vérifié.
