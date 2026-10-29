# Changelog

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
