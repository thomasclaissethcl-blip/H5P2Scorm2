# H5P vers SCORM 1.2 - version 1.0.1

Application web statique destinée à GitHub Pages. Aucun Node.js, serveur applicatif ou outil de compilation n'est requis sur le poste utilisateur.

## Objectif

Le navigateur reçoit un fichier `.h5p`, l'analyse localement, applique éventuellement une localisation et une surcouche CSS, puis fabrique un package SCORM 1.2 autonome destiné en priorité à Moodle.

Le fichier H5P et le CSS personnalisé ne sont pas envoyés vers un serveur par l'application. Une connexion Internet reste nécessaire pendant la conversion pour charger JSZip dans l'interface et récupérer la distribution figée de H5P Standalone 3.8.2, qui est ensuite embarquée dans le SCORM produit.

## Extension du lot 7 : mini-site HTML multifichier

Le bouton **« Générer le HTML multifichier »** produit un ZIP autonome avec `index.html`, `html/player-init.js`, les ressources du lecteur H5P Standalone 3.8.2 dans `player/`, le contenu et les bibliothèques dans `h5p/`, les styles dans `custom/`, et un rapport `generation-report.json`.

Après extraction, publier **tout le contenu** de l'archive sous une URL HTTP(S) statique, éventuellement dans un sous-répertoire. L'application générée ne requiert ni backend ni CDN à la lecture. Elle peut être importée comme mini-site dans Moodle via une ressource « Fichier » si Moodle autorise les scripts et les ressources internes du ZIP. Décompresser les fichiers et définir `index.html` comme fichier principal.

Le format HTML simple ne fournit aucun suivi SCORM, aucune note LMS ni reprise LMS. Les ressources externes demandées par certains contenus H5P, notamment YouTube, peuvent nécessiter un accès réseau et des autorisations spécifiques. L'exécution `file://` n'est pas garantie pour le format multifichier. Le lot 8.3a ajoute un **essai HTML monofichier interactif**, distinct des formats validés : il intègre ses ressources et exécute le lecteur dans un document unique. Ce prototype fonctionne en contexte Chromium contrôlé sur H5P.AdvancedText et l'écran d'accueil/une étape de Game Map. Son ouverture `file://`, son déploiement HTTP(S) et les activités composites complètes ne sont pas encore certifiés. En cas de limite ou d'échec, utiliser le HTML multifichier. La conversion par lots reste à développer.

Documentation et recette : `docs/LOT7_HTML_MULTIFICHIER.md` et `docs/CONTRE_RECETTE_LOT7.md`.

## Lot 8.3a : HTML monofichier interactif, essai non qualifié

Le bouton « HTML monofichier interactif (essai) » génère un fichier `.html` contenant les ressources H5P, les bibliothèques et le lecteur 3.8.2. Un résolveur embarqué traite les requêtes fetch/XHR, les scripts, le CSS et plusieurs catégories de médias. Le CSS personnalisé et les marges ordinateur/mobile sont appliqués au document.

**Ce format est expérimental**, sans garantie de portabilité complète pour toutes les bibliothèques H5P, les vidéos externes, les iframes et les politiques de sécurité des hébergeurs. Un volume décompressé supérieur à 32 Mio est refusé. Les diagnostics internes sont disponibles avec `window.H5PConverterSinglefileAudit()` dans le HTML produit. Le lecteur peut indiquer une erreur et recommander l'HTML multifichier.

La génération monofichier n'envoie aucun score SCORM ou LMS. Les essais Chromium utilisent un document injecté dans un contexte navigateur, **et ne constituent pas une certification `file://` ou HTTP(S)**. Consulter `docs/LOT8_3_PREMIER_LECTEUR_MONOFICHIER.md` et `docs/CONTRE_RECETTE_LOT8_3.md`.

## Lot 8.3b : images Memory et médias locaux (30 octobre 2026)

Le lecteur monofichier expérimental intercepte désormais également les URLs générées dans des chaînes HTML par certaines bibliothèques telles que H5P.MemoryGame. Les images internes ont été testées avec la Game Map réelle : trois échecs de ressources ont disparu après correction.

Un MP4 réellement contenu dans le H5P a été lu dans H5P.Video en Chromium sans accès réseau. Le nouveau diagnostic de médias distingue les fichiers locaux et les vidéos externes (dont YouTube), qui ne sont pas embarquées et nécessitent Internet. Un média local déclaré mais manquant provoque un refus explicite de l'export expérimental.

**Réserves :** `file://` reste à qualifier en recette réelle ; H5P.InteractiveVideo avec vidéo locale n'a pas été testé. Les vidéos YouTube ne deviennent pas hors ligne et peuvent être bloquées suivant l'origine du document. Le format reste expérimental. Voir `docs/LOT8_3B_IMAGES_MEDIAS.md` et `docs/CONTRE_RECETTE_LOT8_3B.md`.

## Fonctionnalités de la V1

- sélection classique ou glisser-déposer d'un fichier `.h5p` ;
- validation de `h5p.json` et `content/content.json` ;
- inventaire des bibliothèques H5P et résolution récursive des dépendances ;
- blocage des packages incomplets ou présentant des chemins ZIP non sûrs ;
- localisation à partir de `h5p.json`, des métadonnées et des fichiers `language/<langue>.json` ;
- préservation des formulations personnalisées par l'auteur ;
- traduction française des libellés système du lecteur H5P ;
- import d'un fichier CSS et zone d'édition CSS ;
- génération SCORM 1.2 ;
- intégration de H5P Standalone 3.8.2 ;
- contrôle des exigences `coreApi` des bibliothèques H5P requises, avec blocage au-delà du plafond déclaré 1.28 ;
- score SCORM normalisé sur 100 ;
- trois politiques de statut : automatique, seuil de score, achèvement seul ;
- mesure de `cmi.core.session_time` ;
- gestion de `cmi.core.exit` ;
- reprise via `cmi.suspend_data` ;
- compression Deflate de l'état lorsque le navigateur prend en charge `CompressionStream` ;
- profil SCORM 1.2 strict à 4000 caractères ;
- profil Moodle étendu à 64000 caractères, marqué expérimental ;
- sauvegarde périodique, sauvegarde sur événements xAPI et sauvegarde à la fermeture ;
- absence de messages visuels pour les sauvegardes réussies ;
- alertes facultatives uniquement en cas de problème de reprise ;
- barre de progression unique pendant la génération ;
- aide contextuelle accessible sur les champs et encadrés de l'interface ;
- rapports `localization-report.json` et `generation-report.json` intégrés au package produit.

## Runtime et compatibilité H5P

La release utilise un runtime figé : `h5p-standalone 3.8.2`. Le projet déclare un plafond de compatibilité H5P Core API `1.28`. Les bibliothèques requises qui déclarent une exigence supérieure sont bloquées avant génération.

Ce plafond est maintenu explicitement dans `app.js` et `RUNTIME_PROFILE.json`. Il doit être réévalué à chaque mise à jour du runtime. Il ne faut pas relever ce plafond uniquement pour contourner un blocage.

Le protocole complet de maintenance et de reprise du projet est documenté dans `MAINTENANCE_MANIFEST.md`. Ce fichier est destiné aussi bien à un mainteneur humain qu'à une autre instance de ChatGPT amenée à reprendre le développement.

## Reprise de progression

La version 1.0 utilise en priorité `getCurrentState()` sur les instances H5P accessibles, y compris dans les iframes de même origine. Si cette méthode n'est pas disponible, elle utilise l'état exposé dans `H5PIntegration.contents[...].contentUserData`.

Au lancement suivant, l'état enregistré dans `cmi.suspend_data` est restauré dans la structure attendue par le core H5P embarqué dans H5P Standalone 3.8.2 : un objet indexé par `subContentId`, puis par type de donnée, par exemple `{0: {state: "{...}"}}`.

Deux représentations peuvent être écrites :

- `H5P3R:` pour un état JSON brut ;
- `H5P3Z:` pour un état compressé avec Deflate et encodé en Base64.

Si l'état dépasse la capacité du profil choisi, il n'est pas tronqué. Le dernier état sauvegardable est conservé.

### Profil strict

Valeur recommandée et utilisée par défaut. Limite opérationnelle : 4000 caractères.

### Profil Moodle étendu

Limite configurée dans le générateur : 64000 caractères. Ce mode suppose que l'administration Moodle autorise une capacité étendue pour `cmi.suspend_data`. Il n'a pas été validé dans l'environnement de test utilisé pour cette V1.

## Score et statut

Le score envoyé au LMS est normalisé sur une échelle de 0 à 100 :

- `cmi.core.score.min = 0` ;
- `cmi.core.score.max = 100` ;
- `cmi.core.score.raw = pourcentage obtenu`.

Un résultat H5P de 9/9 produit donc un score SCORM de 100/100.

### Politique automatique

Utilise en priorité `result.success`. En son absence, un score disponible est comparé au seuil. Un contenu terminé sans information de réussite ni score passe à `completed`.

### Seuil de score

Le score final est comparé au seuil configuré. Un contenu terminé sans score passe à `completed`.

### Achèvement seul

Tout événement final de niveau principal passe le SCO à `completed`. Aucun `masteryscore` n'est ajouté au manifeste.

## Réglages Moodle recommandés

Pour favoriser la reprise de la même progression :

- nombre de tentatives : 1 ;
- forcer une nouvelle tentative : non ;
- forcer terminé : non ;
- désactiver le mode aperçu : oui ;
- auto-commit : oui ;
- affichage : fenêtre actuelle ;
- navigation Moodle : masquée lorsque l'activité H5P gère déjà sa navigation ;
- note maximale : 100.

## Déploiement GitHub Pages

1. Créer un dépôt GitHub.
2. Copier le contenu de ce dossier à la racine du dépôt.
3. Dans **Settings > Pages**, publier la branche principale depuis la racine du dépôt.
4. Ouvrir l'URL GitHub Pages fournie.

## Tests automatisés

Le dépôt inclut un workflow GitHub Actions qui exécute :

- vérification syntaxique de `app.js` ;
- test des sources SCORM générées ;
- test de sauvegarde et de restauration ;
- test de normalisation du score sur 100 ;
- vérification du profil strict et du profil Moodle étendu ;
- vérification structurelle des fixtures H5P ;
- vérification de l'interface V1 ;
- vérification de la cohérence de release entre `VERSION`, `APP_VERSION`, `RUNTIME_PROFILE.json` et les dépendances figées.

Aucune installation locale n'est nécessaire pour exécuter ces tests sur GitHub.

## Fichiers de test

Le dossier `test-fixtures` contient :

- `poc-valid.h5p` ;
- `poc-language.h5p` ;
- `poc-resume.h5p` ;
- `poc-missing-dependency.h5p` ;
- `poc-invalid.h5p` ;
- `poc-coreapi-future.h5p`, qui doit être bloqué car il requiert H5P Core API 1.29.

## Limites connues

- SCORM 1.2 uniquement ;
- compatibilité validée prioritairement avec Moodle et quelques contenus H5P, dont Game Map ;
- la qualité de la reprise dépend aussi de la bibliothèque H5P elle-même ;
- la matrice de compatibilité par type H5P reste à enrichir ;
- un second LMS SCORM 1.2 n'a pas encore été intégré à la campagne de validation ;
- la distribution du convertisseur dépend encore de jsDelivr pendant la conversion ;
- le plafond H5P Core API est une déclaration de compatibilité du projet, pas une détection automatique du lecteur ;
- la licence propre du projet doit être choisie par le propriétaire du dépôt avant une diffusion publique sous licence open source.

## Maintenance et transmission

Avant toute mise à jour du runtime H5P, lire `MAINTENANCE_MANIFEST.md` et `RUNTIME_PROFILE.json`, exécuter la suite de tests, puis suivre la checklist de release.

## Composants tiers

Voir `THIRD_PARTY_NOTICES.md`.
