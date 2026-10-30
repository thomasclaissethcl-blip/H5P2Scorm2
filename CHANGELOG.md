## Lot 8.4b, 30 octobre 2026 : nettoyage UI et préparation de la qualification Interactive Video

- Recette utilisateur 8.4a : 10 contrôles sur 10 validés.
- Retrait des boutons obsolètes « Diagnostic HTML monofichier » et « Prototype ressources (non interactif) » ainsi que de leurs fonctions et de la génération de prototype.
- Suppression du module `src/html-singlefile-preflight.js`, remplacé par l'analyseur courant de médias du lecteur interactif.
- Conservation de `src/html-singlefile-resources.js` et de `collect()`, indispensable au véritable export HTML monofichier, y compris ses limites, ses protections de chemins et sa progression.
- Qualification statique préparatoire `inspectInteractiveVideo()` : détecte le type H5P.InteractiveVideo, recense sources vidéo et interactions déclarées, vérifie les médias référencés. La lecture synchronisée reste **non qualifiée** sans véritable H5P de recette avec MP4 local.
- Vérification : 50 suites automatisées sur 50 et Chromium simulé pour l'import et les refus. Aucun nouveau résultat Moodle/Firefox revendiqué.

# Changelog

## Lot 8.4a : présentation neutre et premier essai Interactive Book (30 octobre 2026)

- Aucun avertissement technique (notamment YouTube/file://) ne s'affiche dans le contenu HTML monofichier lorsqu'il est lancé normalement. Les erreurs empêchant le lancement conservent un message succinct.
- Le journal du convertisseur présente les comptes de vidéos locales, les sources externes, la limitation de YouTube en file:// et les réserves hors ligne. Le diagnostic `H5PConverterSinglefileAudit()` demeure accessible pour analyse technique.
- Maintien de la politique de référent `strict-origin-when-cross-origin` pour les pages HTTPS contenant YouTube, sans contournement des restrictions du fournisseur.
- Premier essai d'un vrai H5P.InteractiveBook (SST406) en HTML unique, construit depuis le contenu H5P d'une archive SCORM fournie pour recette : 772 fichiers et 20 026 849 octets embarqués. Chromium hors réseau : lecteur initialisé, ouverture du premier chapitre, aucune erreur JavaScript ni ressource manquante observée dans ce scénario.
- Le livre complet, les soumissions de questionnaires et l'ouverture en Firefox file:// restent à qualifier par l'utilisateur. H5P.InteractiveVideo local reste à qualifier séparément.
- 51/51 contrôles automatisés et test Chromium additionnel du livre réel réussis ; aucune modification du SCORM ni de l'export HTML multifichier.

## Lot 8.3a : premier lecteur H5P HTML monofichier interactif (essai, 29 octobre 2026)

- Résolveur autonome des ressources H5P intégrées, incluant fetch, XMLHttpRequest, scripts dynamiques, feuilles CSS, images et polices.
- Prototype interactif distinct des deux exportateurs validés, toujours disponible après retour utilisateur positif du correctif 8.2c.
- Sur Chromium avec document injecté : H5P.AdvancedText rendu et H5P.GameMap affiché, étape Welcome ouverte. Trois requêtes médias de Game Map ont échoué dans ce banc de test.
- Taille de ressources intégrées plafonnée à 32 Mio. Aucun résultat LMS transmis. Repli HTML multifichier explicite.
- 48 tests automatisés réussis ; ouverture directe file:// et déploiements HTTP(S)/Moodle restent à valider.


## Correctif 7d et lot 8.2 (version applicative maintenue à 1.0.1)

- Quatre marges ordinateur, quatre marges mobile (media query 768 px), marges mobile à zéro par défaut. Export SCORM et HTML multifichier sans modification des composants internes H5P.
- Contrat rétrocompatible des marges 7b et 7c ; réglages nouveaux présents dans les rapports de génération.
- Module borné `src/html-singlefile-resources.js` : inventaire et encodage binaire, résolution de chemins locaux et URL CSS, prototype HTML à ressources intégrées.
- Bouton `Prototype ressources (non interactif)` : télécharge une preuve technique, ne lance ni n'exporte d'activité H5P interactive. Monofichier opérationnel toujours non qualifié.
- 44 contrôles automatisés, tests de rendu responsive Chromium et prototype de ressources exécuté en contexte navigateur ; navigation directe `file://` et publication HTTP(S) non validées dans l'environnement de test.


## Lot 7 : export HTML multifichier (version applicative maintenue à 1.0.1)

- Ajout de l'export ZIP HTML multifichier portable pour hébergement statique HTTP(S) et sous-répertoires.
- Réutilisation du lecteur H5P 3.8.2 et du mécanisme de copie H5P validés au lot 6.1.
- Lanceur HTML distinct, sans API ni manifeste SCORM, rapport de génération et consignes Moodle « Fichier ».
- Deux vrais ZIP générés en Chromium avec Game Map et Interactive Book.
- Recette web/Moodle ouverte ; l'option HTML monofichier n'est pas encore développée.

## 1.0.1

Version de stabilisation et de maintenabilité de la V1.

### Compatibilité H5P

- ajout d'un plafond H5P Core API déclaré à 1.28 pour H5P Standalone 3.8.2 ;
- contrôle des propriétés `coreApi` sur les bibliothèques d'exécution requises ;
- blocage de la génération lorsqu'une bibliothèque requiert une Core API plus récente ;
- blocage d'un `coreApi` présent mais invalide ;
- ajout de la fixture `poc-coreapi-future.h5p` exigeant Core API 1.29.

### Maintenance

- ajout de `RUNTIME_PROFILE.json` ;
- ajout de `MAINTENANCE_MANIFEST.md` avec architecture, invariants, procédure de mise à jour, protocole Moodle, checklist de release et instruction de prise de relais pour une autre instance de ChatGPT ;
- ajout des informations de runtime dans `generation-report.json` et dans le `README.txt` des SCORM générés ;
- enrichissement du diagnostic avec le lecteur, le plafond Core API et l'API maximale demandée ;
- ajout d'un test de cohérence de release pour synchroniser version applicative, profil runtime et dépendances figées.

## 1.0.0

Première version stable centrée sur Moodle et SCORM 1.2.

### Interface

- ajout du glisser-déposer H5P ;
- ajout d'aides contextuelles sur les champs et encadrés ;
- réorganisation en cinq étapes ;
- amélioration de la zone de diagnostic ;
- conservation d'une seule barre de progression pour la génération ;
- suppression des messages visuels ordinaires de sauvegarde dans le SCO.

### SCORM

- normalisation des scores sur 100 ;
- profil de reprise SCORM 1.2 strict à 4000 caractères ;
- profil Moodle étendu 64K expérimental ;
- conservation de la compression de `cmi.suspend_data` ;
- conservation de la restauration H5P corrigée en 0.3.3 ;
- alertes de reprise limitées aux situations problématiques ;
- identifiant de manifeste stabilisé.

### Robustesse

- liste figée des fichiers H5P Standalone à intégrer au package ;
- ajout de tests de normalisation du score ;
- ajout de tests du profil étendu ;
- ajout de contrôles statiques de l'interface V1.

## 0.3.3

- correction du format de restauration `contentUserData` attendu par H5P Standalone 3.8.2 ;
- conversion des anciens états de reprise vers la structure native du core H5P.

## 0.3.2

- amorçage de `contentUserData` dès le premier lancement ;
- capture dans les iframes de même origine ;
- diagnostic détaillé de reprise.

## 0.3.1

- barre de progression unique pendant la compression ;
- premiers diagnostics de reprise.

## 0.3.0

- première reprise de progression via `cmi.suspend_data` ;
- compression Deflate ;
- `session_time`, `exit` et politiques de statut.

## Correctif 5.2b, 28 octobre 2026 (expérimental)

- Détection conservatrice des composants purement informatifs Image Hotspots et Accordion.
- Prise en charge des Question Set comme unités globales de notation dans Interactive Book.
- Protection contre le double comptage des questions internes et contre les sous-scores inattendus.
- Contrainte de portée pour le registre de reprise des sous-scores imbriqués.
- Agrégation toujours facultative, score global natif toujours prioritaire et non-régression du lecteur de référence.

## 2026-10-28 : Correctif 7b, mise en page des exports
- Champs facultatifs de largeur maximale (centrée et responsive) et de marges en px pour SCORM et HTML multifichier.
- Validation stricte des valeurs, sortie inchangée avec les champs vides.
- Module partagé `src/export-layout.js` et nouveaux contrôles automatisés.
- Aucune modification des moteurs, de la visionneuse, du suivi SCORM et de la notation.

## 2026-10-29 : correctif 7c et préparation du lot 8.1

- Quatre marges indépendantes en px pour les exports SCORM et HTML multifichier ; valeurs vides sans effet, centrage et plein écran conservés, protection des petits écrans.
- Compatibilité interne de l'ancien réglage uniforme `marginPx` du lot 7b.
- Diagnostic statique téléchargeable de faisabilité HTML monofichier (inventaire, tailles, références externes). Aucun export monofichier non certifié n'est généré.
- 41/41 tests automatisés et génération Chromium réelle de Game Map en ZIP HTML multifichier et SCORM. Recette des exports sur hébergement et Moodle encore ouverte.

## 2026-10-30 : correctif 8.3b, Memory et médias monofichier

- Résolution des images créées dans des chaînes HTML et des styles inline (H5P.MemoryGame).
- Test de lecture hors réseau d'un vrai H5P.Video avec MP4 local et lecteur 3.8.2.
- Rapport des vidéos externes YouTube/Vimeo et refus explicite des références vers des fichiers média locaux absents.
- 49 suites de tests automatisés réussies ; Game Map et H5P.Video testés en Chromium sans réseau.
- HTML monofichier toujours expérimental ; pas de certification de H5P.InteractiveVideo ni de `file://`.
