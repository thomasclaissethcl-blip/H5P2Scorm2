# Lot 7b : personnalisation de la mise en page des exports

**Référence fonctionnelle : lot 7**, lui-même basé sur le socle 6.1 et la notation 5.3.

## Fonctionnement

Deux champs facultatifs figurent dans l'étape 2 « Apparence » :

- **Largeur maximale du contenu (px)** : entier entre 1 et 10000, vide par défaut. Le contenu est centré horizontalement par `margin-left:auto; margin-right:auto`, et réduit automatiquement sur les écrans plus étroits.
- **Marges autour du contenu (px)** : entier entre 0 et 2000, vide par défaut. S'applique uniformément aux quatre côtés de la page exportée. La valeur `0` est distincte du champ vide.

Les réglages s'appliquent aux deux formats exportés, **SCORM 1.2 et HTML multifichier**, en ajoutant des règles CSS dans le `index.html` de la page générée. Le CSS importé et le CSS saisi sont conservés séparément dans `custom/custom.css`, sans modification. Le rendu de la visionneuse du convertisseur n'est pas reconfiguré par ces deux champs.

Lorsque les deux champs sont vides, aucune règle CSS de mise en page n'est ajoutée : la présentation exportée reste inchangée. Le plein écran natif n'est pas limité : la seule règle spéciale cible le conteneur H5P si ce conteneur devient lui-même l'élément de plein écran.

La source des paramètres est le module partagé `src/export-layout.js`. Ce dernier valide strictement les nombres pour éviter les injections CSS. Les paramètres utilisés figurent dans `generation-report.json` : racine `layout` pour SCORM, `parameters.layout` pour HTML.

## Périmètre non modifié

Aucune modification des fonctions de notation, du suivi SCORM, de la lecture H5P, de la visionneuse, de la compatibilité moteur, du CSS libre ou des ressources du lecteur. Le moteur 3.8.2 demeure le seul qualifié pour l'export. L'agrégation composite reste désactivée par défaut.

## Vérifications techniques

- 37/37 suites automatisées passées ;
- Chromium : Game Map réelle -> ZIP SCORM avec largeur 960px et marges 24px ;
- Chromium : Game Map réelle -> ZIP HTML avec largeur 960px et marges 24px ;
- les deux pages générées donnent 960px centrés sur une fenêtre 1440px et 327px de largeur sur une fenêtre 375px avec marges 24px ;
- contrôle des ressources H5P, présence du manifeste uniquement dans SCORM et absence de suivi dans HTML ;
- Chromium : trois scénarios d'import H5P valide et incompatibles ;
- fichiers du lecteur et modules SCORM non modifiés par rapport au lot 7.

**Limitations :** ces essais ne valident pas la lecture interactive réelle du nouveau réglage dans Moodle ou GitHub Pages. Les interactions Game Map/Interactive Book et leur plein écran sont à recontrôler sur l'hébergement et dans le LMS par l'utilisateur.
