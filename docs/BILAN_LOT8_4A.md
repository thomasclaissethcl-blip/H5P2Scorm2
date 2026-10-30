# Lot 8.4a : journal de génération et premier essai Interactive Book

Date : 30 octobre 2026. Base : correctif 8.3c validé par l'utilisateur (7/7).

## Objet

Rendre la page HTML monofichier pédagogique silencieuse en fonctionnement normal. Les réserves techniques, principalement les médias externes et la lecture `file://` des vidéos YouTube, sont consignées dans le journal du convertisseur. Commencer la qualification d'Interactive Book dans un HTML réellement monofichier.

## Décisions

- Le monofichier contient un lecteur H5P et ses ressources locales. Le conteneur `singlefile-status` est vide et caché au démarrage ; après initialisation normale aucune bannière/alerte technique n'est affichée.
- Une erreur fatale de démarrage affiche toujours une phrase courte, sans exposer une trace technique à l'apprenant. Le détail est accessible à des fins de diagnostic avec `window.H5PConverterSinglefileAudit()`.
- Le convertisseur affiche dans son journal le nombre de vidéos locales, les références audio/vidéo locales, le nombre de vidéos externes, ainsi que la dépendance de YouTube à Internet et à l'origine HTTP(S).
- La politique de référent sur les pages HTTP(S) contenant une vidéo YouTube est conservée. **Aucune solution universelle n'est garantie pour la lecture YouTube depuis `file://`**. YouTube impose un `Referer` HTTP ou identification équivalente ; la lecture sur HTTPS a été confirmée par l'utilisateur dans Moodle.
- Aucun composant SCORM, HTML multifichier, CSS, moteur de notation ou autre partie validée du projet n'a été modifié.

## Qualification technique d'Interactive Book

Source : contenu H5P et lecteur extraits de `SST406-Dossier1-scorm12(1).zip` fourni dans le projet ; les fichiers SCORM et pont LMS ont été **exclus** du monofichier.

- 772 fichiers embarqués ; total binaire 20 026 849 octets (inférieur au plafond expérimental 32 Mio).
- Fichier final HTML de 26 795 599 caractères environ.
- Tests Playwright/Chromium en contexte sans réseau : démarrage `H5P.InteractiveBook`, affichage d'images et de boutons, navigation « Commencer » vers « Page 1 sur 6 », aucune requête échouée ni erreur JavaScript détectée, statut technique non visible.

**Limite :** seule la première navigation a été testée, pas les 38 questions ni l'ensemble de la soumission finale, et l'ouverture `file://` reste à vérifier sous Firefox. Ce résultat ne constitue pas une certification d'Interactive Book en général.

## Vérifications

- 51/51 contrôles automatisés réussis.
- Qualification Chromium hors réseau du livre réel réussie pour le chargement et la première navigation.
- Aucun nouvel essai LMS ni Firefox réalisé dans cette livraison.

## Suite

Contre-recette utilisateur sur la disparition des messages, leur présence dans le journal et l'essai de l'Interactive Book monofichier. Puis qualification H5P.InteractiveVideo avec MP4 local et stabilisation des critères d'éligibilité avant le lot 9 (conversion par lots).
