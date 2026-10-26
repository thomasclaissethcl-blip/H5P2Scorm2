(() => {
  'use strict';

  const APP_VERSION = '1.0.1';
  const modules = globalThis.H5PConverterModules;
  if (!modules?.compatibility || !modules?.dependencies || !modules?.analysis || !modules?.preview) {
    throw new Error('Modules H5P absents : vérifier le chargement avant app.js.');
  }
  const runtimeProfile = modules.compatibility.defaultProfile;
  const PLAYER_VERSION = runtimeProfile.playerVersion;
  const H5P_CORE_API_SUPPORTED = runtimeProfile.supportedCoreApi;
  const RUNTIME_PROFILE_ID = runtimeProfile.id;
  const STRICT_SUSPEND_DATA_LIMIT = 4000;
  const MOODLE_EXTENDED_SUSPEND_DATA_LIMIT = 64000;
  const PLAYER_CDN = `https://cdn.jsdelivr.net/npm/h5p-standalone@${PLAYER_VERSION}`;
  const PLAYER_DIST_FILES = [
    '/dist/main.bundle.js',
    '/dist/frame.bundle.js',
    '/dist/main.bundle.js.LICENSE.txt',
    '/dist/styles/h5p.css',
    '/dist/styles/h5p-fonts.css',
    '/dist/images/h5p.svg',
    '/dist/images/throbber.gif',
    '/dist/fonts/h5p-core-30.woff2',
    '/dist/fonts/h5p-hub-publish.woff',
    '/dist/fonts/h5p-hub-publish.woff2',
    '/dist/fonts/h5p-theme.woff2',
    '/dist/fonts/inter/Inter-ExtraBold.woff2',
    '/dist/fonts/inter/Inter-ExtraBoldItalic.woff2',
    '/dist/fonts/inter/inter-v18-cyrillic_cyrillic-ext_greek_greek-ext_latin_latin-ext_vietnamese-600.woff2',
    '/dist/fonts/inter/inter-v18-cyrillic_cyrillic-ext_greek_greek-ext_latin_latin-ext_vietnamese-600italic.woff2',
    '/dist/fonts/inter/inter-v18-cyrillic_cyrillic-ext_greek_greek-ext_latin_latin-ext_vietnamese-italic.woff2',
    '/dist/fonts/inter/inter-v18-cyrillic_cyrillic-ext_greek_greek-ext_latin_latin-ext_vietnamese-regular.woff2',
    '/dist/fonts/inter/LICENSE.txt',
    '/dist/fonts/open-sans/open-sans-v40-cyrillic_cyrillic-ext_greek_greek-ext_hebrew_latin_latin-ext_math_symbols_vietnamese-600.woff2',
    '/dist/fonts/open-sans/open-sans-v40-cyrillic_cyrillic-ext_greek_greek-ext_hebrew_latin_latin-ext_math_symbols_vietnamese-600italic.woff2',
    '/dist/fonts/open-sans/open-sans-v40-cyrillic_cyrillic-ext_greek_greek-ext_hebrew_latin_latin-ext_math_symbols_vietnamese-700.woff2',
    '/dist/fonts/open-sans/open-sans-v40-cyrillic_cyrillic-ext_greek_greek-ext_hebrew_latin_latin-ext_math_symbols_vietnamese-700italic.woff2',
    '/dist/fonts/open-sans/open-sans-v40-cyrillic_cyrillic-ext_greek_greek-ext_hebrew_latin_latin-ext_math_symbols_vietnamese-italic.woff2',
    '/dist/fonts/open-sans/open-sans-v40-cyrillic_cyrillic-ext_greek_greek-ext_hebrew_latin_latin-ext_math_symbols_vietnamese-regular.woff2',
    '/dist/fonts/open-sans/OFL.txt'
  ];

  const CORE_TRANSLATIONS = {
    fr: {
      H5P: {
        fullscreen: 'Plein écran',
        disableFullscreen: 'Quitter le plein écran',
        download: 'Télécharger',
        copyrights: "Droits d’utilisation",
        embed: 'Intégrer',
        size: 'Taille',
        showAdvanced: 'Afficher les options avancées',
        hideAdvanced: 'Masquer les options avancées',
        advancedHelp: 'Incluez ce script sur votre site si vous souhaitez un redimensionnement dynamique du contenu intégré :',
        copyrightInformation: "Droits d’utilisation",
        close: 'Fermer',
        title: 'Titre',
        author: 'Auteur',
        year: 'Année',
        source: 'Source',
        license: 'Licence',
        thumbnail: 'Miniature',
        noCopyrights: 'Aucune information de droits d’utilisation n’est disponible pour ce contenu.',
        reuse: 'Réutiliser',
        reuseContent: 'Réutiliser le contenu',
        reuseDescription: 'Réutiliser ce contenu.',
        downloadDescription: 'Télécharger ce contenu sous forme de fichier H5P.',
        copyrightsDescription: 'Afficher les informations relatives aux droits d’utilisation de ce contenu.',
        embedDescription: 'Afficher le code permettant d’intégrer ce contenu.',
        h5pDescription: 'Consultez H5P.org pour découvrir d’autres contenus.',
        contentChanged: 'Ce contenu a changé depuis votre dernière utilisation.',
        startingOver: 'Vous allez recommencer depuis le début.',
        by: 'par',
        showMore: 'Afficher plus',
        showLess: 'Afficher moins',
        subLevel: 'Sous-niveau',
        confirmDialogHeader: 'Confirmer l’action',
        confirmDialogBody: 'Veuillez confirmer que vous souhaitez continuer. Cette action est irréversible.',
        cancelLabel: 'Annuler',
        confirmLabel: 'Confirmer',
        licenseU: 'Non renseignée',
        licenseCCBY: 'Attribution',
        licenseCCBYSA: 'Attribution - Partage dans les mêmes conditions',
        licenseCCBYND: 'Attribution - Pas de modification',
        licenseCCBYNC: 'Attribution - Pas d’utilisation commerciale',
        licenseCCBYNCSA: 'Attribution - Pas d’utilisation commerciale - Partage dans les mêmes conditions',
        licenseCCBYNCND: 'Attribution - Pas d’utilisation commerciale - Pas de modification',
        licenseCC40: '4.0 International',
        licenseCC30: '3.0 non transposé',
        licenseCC25: '2.5 Générique',
        licenseCC20: '2.0 Générique',
        licenseCC10: '1.0 Générique',
        licenseGPL: 'Licence publique générale',
        licenseV3: 'Version 3',
        licenseV2: 'Version 2',
        licenseV1: 'Version 1',
        licensePD: 'Domaine public',
        licenseCC010: 'CC0 1.0 Universel',
        licensePDM: 'Marque du domaine public',
        licenseC: 'Copyright',
        contentType: 'Type de contenu',
        licenseExtras: 'Informations complémentaires de licence',
        changes: 'Historique des modifications',
        contentCopied: 'Le contenu est copié dans le presse-papiers',
        connectionLost: 'Connexion perdue. Les résultats seront conservés et envoyés lorsque la connexion sera rétablie.',
        connectionReestablished: 'Connexion rétablie.',
        resubmitScores: 'Tentative d’envoi des résultats conservés.',
        offlineDialogHeader: 'La connexion au serveur a été perdue',
        offlineDialogBody: 'Impossible d’envoyer les informations relatives à la réalisation de cette activité. Vérifiez votre connexion Internet.',
        offlineDialogRetryMessage: 'Nouvelle tentative dans :num…',
        offlineDialogRetryButtonLabel: 'Réessayer maintenant',
        offlineSuccessfulSubmit: 'Résultats envoyés avec succès.'
      }
    }
  };

  const state = {
    file: null,
    zip: null,
    analysis: null,
    importedCss: ''
  };

  const el = id => document.getElementById(id);
  const h5pFile = el('h5pFile');
  const cssFile = el('cssFile');
  const analyzeBtn = el('analyzeBtn');
  const generateBtn = el('generateBtn');
  const diagnostic = el('diagnostic');
  const log = el('log');
  const generationProgressWrap = el('generationProgressWrap');
  const generationProgress = el('generationProgress');
  const generationProgressPhase = el('generationProgressPhase');
  const generationProgressPercent = el('generationProgressPercent');

  // La visionneuse partage le profil et la localisation de l'export, pas son pont LMS.
  const preview = modules.preview.createPreview({
    frame: el('previewFrame'), status: el('previewStatus'),
    onEvent(event) {
      if (event.type === 'xapi-ready') {
        el('previewEvents').textContent='Écoute xAPI active. Réalisez un exercice pour observer les événements.';
      }
      if (event.type === 'xapi-unavailable') {
        el('previewEvents').textContent='Écoute xAPI indisponible avec ce lecteur.';
      }
      if (event.type === 'xapi') {
        const node = el('previewEvents');
        if (node.textContent.startsWith('Aucun événement.') || node.textContent.startsWith('Écoute xAPI active.')) node.textContent = '';
        node.textContent += `${new Date().toLocaleTimeString('fr-FR')} : ${event.message}\n`;
      }
    }
  });
  const loadPreviewPlayer = modules.preview.playerLoader({
    version: PLAYER_VERSION, paths:PLAYER_DIST_FILES,
    onProgress(message) { el('previewStatus').textContent = message; }
  });
  let previewSequence = 0;
  let cssDebounce = null;
  function clearPreview() {
    previewSequence++;
    preview.reset();
    el('previewRestart').disabled = true;
    el('previewExpand').disabled = true;
    el('previewEvents').textContent = 'Aucun événement.';
  }
  async function launchPreview() {
    if (!state.analysis?.ok || !state.zip) return;
    const sequence = ++previewSequence;
    el('previewRestart').disabled = false;
    el('previewExpand').disabled = false;
    el('previewEvents').textContent = 'Aucun événement.';
    try {
      const localized = await localizeContent(state.zip, state.analysis);
      if (sequence !== previewSequence) return;
      const manifest = cloneJson(state.analysis.h5pJson);
      manifest.language = state.analysis.language.selected;
      const replacements = {
        'h5p.json':JSON.stringify(manifest),
        'content/content.json':JSON.stringify(localized.content),
        __css:[state.importedCss,el('cssText').value].filter(Boolean).join('\n\n')
      };
      await preview.open({zip:state.zip,replacements,assetLoader:loadPreviewPlayer,
        allowYoutube:Boolean(el('previewExternalVideos')?.checked),
        onProgress(message) { if (sequence === previewSequence) el('previewStatus').textContent = message; }});
    } catch (error) {
      if (sequence === previewSequence) el('previewStatus').textContent = 'Aperçu indisponible : '+error.message;
    }
  }


  function logLine(message) {
    const stamp = new Date().toLocaleTimeString('fr-FR');
    log.textContent += `[${stamp}] ${message}\n`;
    log.scrollTop = log.scrollHeight;
  }

  function clearLog() {
    log.textContent = '';
  }

  function setGenerationProgress(percent, phase = '') {
    const value = Math.max(0, Math.min(100, Number(percent) || 0));
    generationProgressWrap.hidden = false;
    generationProgress.value = value;
    generationProgressPhase.textContent = phase || 'Génération';
    generationProgressPercent.textContent = `${Math.round(value)} %`;
  }

  function resetGenerationProgress() {
    generationProgressWrap.hidden = true;
    generationProgress.value = 0;
    generationProgressPhase.textContent = '';
    generationProgressPercent.textContent = '0 %';
  }

  function suspendDataProfile() {
    const profile = el('resumeProfile')?.value || 'strict';
    if (profile === 'moodle-extended') {
      return { key: profile, label: 'Moodle étendu 64K', limit: MOODLE_EXTENDED_SUSPEND_DATA_LIMIT, experimental: true };
    }
    return { key: 'strict', label: 'SCORM 1.2 strict', limit: STRICT_SUSPEND_DATA_LIMIT, experimental: false };
  }

  function updateConditionalFields() {
    const completionOnly = (el('statusPolicy')?.value || 'auto') === 'completion';
    const resumeEnabled = Boolean(el('enableResume')?.checked);
    if (el('masteryScore')) el('masteryScore').disabled = completionOnly;
    if (el('saveFreq')) el('saveFreq').disabled = !resumeEnabled;
    if (el('resumeProfile')) el('resumeProfile').disabled = !resumeEnabled;
    if (el('showRuntimeWarnings')) el('showRuntimeWarnings').disabled = !resumeEnabled;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  // APIs métier isolées. L'application fournit seulement le contexte UI à l'analyseur.
  const { safeZipPath, languageCandidates, translationPathFor, parseJsonFile } = modules.analysis;
  const { parseLibraryReference } = modules.dependencies;
  const { normalizeCoreApi, compareCoreApi, formatCoreApi } = modules.compatibility;

  async function analyzeH5P(zip) {
    return modules.analysis.analyzeH5P(zip, {
      runtimeProfile,
      languageOverride: el('languageOverride')?.value,
      browserLanguage: navigator.language || navigator.languages?.[0],
      coreTranslations: CORE_TRANSLATIONS
    });
  }

  function renderDiagnostic(result) {
    const statusClass = result.ok ? (result.warnings.length ? 'status-warn' : 'status-ok') : 'status-error';
    const statusLabel = result.ok ? (result.warnings.length ? 'Compatible avec avertissements' : 'Compatible') : 'Blocage détecté';
    const title = result.h5pJson?.title || result.h5pJson?.mainLibrary || 'Indéterminé';
    const language = result.language || {};
    const mainLibrary = result.mainKey || result.h5pJson?.mainLibrary || 'Indéterminée';
    const uncompressedMb = ((result.totalUncompressed || 0) / 1024 / 1024).toFixed(1);
    const enableResume = Boolean(el('enableResume')?.checked);
    const saveFreq = Math.max(5, Math.min(300, Number(el('saveFreq')?.value) || 10));
    const profile = suspendDataProfile();
    const policy = el('statusPolicy')?.value || 'auto';
    const policyLabels = { auto: 'Automatique', score: 'Seuil de score', completion: 'Achèvement seul' };

    const missingHtml = result.missing?.length
      ? `<h3>Dépendances manquantes</h3><ul class="list">${result.missing.map(dep => `<li><code>${escapeHtml(dep.key)}</code> <span class="muted">(${escapeHtml(dep.kind)})</span></li>`).join('')}</ul>`
      : '';
    const issuesHtml = result.issues.length
      ? `<h3>Erreurs bloquantes</h3><ul class="list">${result.issues.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
      : '';
    const warningsHtml = result.warnings.length
      ? `<h3>Avertissements</h3><ul class="list">${result.warnings.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
      : '';
    const languageHtml = result.language
      ? `<h3>Localisation</h3>
         <div class="language-grid">
           <div><strong>Déclarée</strong><span>${escapeHtml(language.declared || 'non renseignée')}</span></div>
           <div><strong>Métadonnées</strong><span>${escapeHtml(language.metadata || 'non renseignée')}</span></div>
           <div><strong>Navigateur</strong><span>${escapeHtml(language.browser || 'non renseignée')}</span></div>
           <div><strong>Retenue</strong><span>${escapeHtml(language.selected)} <span class="muted">(${escapeHtml(language.source)})</span></span></div>
         </div>
         <p class="muted">${result.translatedLibraries?.length ?? 0}/${result.localizationLibraries?.length ?? 0} bibliothèque(s) avec <code>semantics.json</code> disposent d’une traduction exploitable.</p>`
      : '';

    const runtimeCompatibility = result.runtimeCompatibility || {};
    const runtimeIssues = [
      ...(runtimeCompatibility.incompatible || []).map(item => `<li><code>${escapeHtml(item.key)}</code> requiert Core API ${escapeHtml(formatCoreApi(item.requirement))}</li>`),
      ...(runtimeCompatibility.invalid || []).map(item => `<li><code>${escapeHtml(item.key)}</code> déclare un <code>coreApi</code> invalide</li>`)
    ].join('');
    const runtimeHtml = result.runtimeCompatibility
      ? `<h3>Runtime H5P</h3>
         <div class="language-grid">
           <div><strong>Lecteur</strong><span>H5P Standalone ${escapeHtml(runtimeCompatibility.playerVersion)}</span></div>
           <div><strong>Core API déclarée</strong><span>jusqu’à ${escapeHtml(formatCoreApi(runtimeCompatibility.supportedCoreApi))}</span></div>
           <div><strong>API max. demandée</strong><span>${escapeHtml(formatCoreApi(runtimeCompatibility.maxRequiredCoreApi))}</span></div>
           <div><strong>Bibliothèques vérifiées</strong><span>${runtimeCompatibility.checkedLibraries ?? 0}</span></div>
         </div>
         <p class="muted">Les bibliothèques sans <code>coreApi</code> explicite restent acceptées. Une exigence supérieure au plafond déclaré bloque la génération afin d’éviter un SCORM dont le fonctionnement n’est pas maîtrisé.</p>
         ${runtimeIssues ? `<ul class="list">${runtimeIssues}</ul>` : ''}`
      : '';

    const extendedNote = enableResume && profile.experimental
      ? '<p class="callout warning"><strong>Profil expérimental.</strong> Ce mode suppose que Moodle autorise une capacité étendue pour <code>cmi.suspend_data</code>. Il n’a pas été validé dans notre environnement de test. Utiliser le profil strict si vous ne maîtrisez pas la configuration du LMS.</p>'
      : '';
    const trackingHtml = `<h3>Suivi SCORM</h3>
      <div class="language-grid">
        <div><strong>Politique</strong><span>${escapeHtml(policyLabels[policy] || policy)}</span></div>
        <div><strong>Score</strong><span>normalisé sur 100</span></div>
        <div><strong>Reprise</strong><span>${enableResume ? 'Activée' : 'Désactivée'}</span></div>
        <div><strong>Profil</strong><span>${enableResume ? escapeHtml(profile.label) : 'sans objet'}</span></div>
        <div><strong>Sauvegarde</strong><span>${enableResume ? `${saveFreq} s` : 'sans objet'}</span></div>
        <div><strong>suspend_data</strong><span>${enableResume ? `${profile.limit.toLocaleString('fr-FR')} caractères max.` : 'non utilisé'}</span></div>
      </div>
      ${enableResume ? '<p class="muted">La reprise dépend aussi de la capacité de la bibliothèque H5P à exposer et restaurer son état utilisateur. Le dépassement de capacité est contrôlé à l’exécution.</p>' : ''}
      ${extendedNote}`;

    diagnostic.className = `diagnostic ${statusClass}`;
    diagnostic.innerHTML = `
      <div class="summary">
        <div class="card"><strong>Résultat</strong>${escapeHtml(statusLabel)}</div>
        <div class="card"><strong>Contenu</strong>${escapeHtml(title)}</div>
        <div class="card"><strong>Bibliothèque principale</strong>${escapeHtml(mainLibrary)}</div>
        <div class="card"><strong>Taille décompressée</strong><span class="metric">${escapeHtml(uncompressedMb)} Mo</span></div>
        <div class="card"><strong>Bibliothèques</strong>${result.libraries?.length ?? 0}</div>
        <div class="card"><strong>Dépendances requises</strong>${result.required?.length ?? 0}</div>
      </div>
      ${languageHtml}${runtimeHtml}${trackingHtml}${issuesHtml}${warningsHtml}${missingHtml}
    `;
  }

  async function loadAndAnalyze() {
    if (!state.file) return;
    clearPreview();
    clearLog();
    generateBtn.disabled = true;
    diagnostic.className = 'diagnostic';
    diagnostic.textContent = 'Analyse en cours…';
    try {
      const buffer = await state.file.arrayBuffer();
      state.zip = await JSZip.loadAsync(buffer, { createFolders: true });
      state.analysis = await analyzeH5P(state.zip);
      renderDiagnostic(state.analysis);
      generateBtn.disabled = !state.analysis.ok;
      if (state.analysis.ok) {
        void launchPreview();
        logLine(`Analyse terminée : package exploitable. Langue retenue : ${state.analysis.language.selected}.`);
      } else {
        logLine('Analyse terminée : génération bloquée par le diagnostic.');
      }
    } catch (error) {
      state.zip = null;
      state.analysis = null;
      diagnostic.className = 'diagnostic status-error';
      diagnostic.textContent = `Impossible de lire l’archive : ${error.message}`;
      logLine(`Erreur : ${error.message}`);
    }
  }

  async function fetchPlayerDist(targetZip) {
    logLine(`Intégration de H5P Standalone ${PLAYER_VERSION}…`);
    const distFiles = PLAYER_DIST_FILES;
    let done = 0;
    for (const remotePath of distFiles) {
      const url = `${PLAYER_CDN}${remotePath}`;
      const response = await fetch(url, { cache: 'force-cache' });
      if (!response.ok) throw new Error(`Impossible de récupérer ${remotePath} (HTTP ${response.status}).`);
      const data = await response.arrayBuffer();
      const localPath = `player/${remotePath.slice('/dist/'.length)}`;
      targetZip.file(localPath, data);
      done += 1;
      setGenerationProgress(15 + (done / distFiles.length) * 20, 'Intégration du lecteur H5P');
      if (done === 1 || done % 5 === 0 || done === distFiles.length) {
        logLine(`Lecteur H5P : ${done}/${distFiles.length} fichiers intégrés.`);
      }
    }
  }

  async function buildLocalizationCatalog(zip, analysis, language) {
    const catalog = new Map();
    for (const record of analysis.libraries) {
      let semantics = null;
      let translation = null;
      if (record.hasSemantics) {
        semantics = await parseJsonFile(zip, `${record.folder}/semantics.json`, false);
      }
      const translationPath = translationPathFor(record, language);
      if (translationPath) {
        translation = await parseJsonFile(zip, translationPath, false);
      }
      catalog.set(record.key, {
        record,
        semantics: Array.isArray(semantics) ? semantics : null,
        translatedSemantics: Array.isArray(translation?.semantics) ? translation.semantics : null,
        translationPath
      });
    }
    return catalog;
  }

  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function applyLocalizedDefaults(target, semantics, translations, stats) {
    if (!target || typeof target !== 'object' || !Array.isArray(semantics)) return;

    for (let index = 0; index < semantics.length; index += 1) {
      const field = semantics[index];
      const translatedField = Array.isArray(translations) ? translations[index] : undefined;
      if (!field || typeof field !== 'object' || !field.name) continue;

      const current = target[field.name];
      const sourceDefault = field.default;
      const translatedDefault = translatedField?.default;

      if (typeof sourceDefault === 'string' && typeof translatedDefault === 'string' && translatedDefault !== sourceDefault) {
        if (current === undefined) {
          target[field.name] = translatedDefault;
          stats.added += 1;
        } else if (current === sourceDefault) {
          target[field.name] = translatedDefault;
          stats.replaced += 1;
        } else if (typeof current === 'string') {
          stats.preserved += 1;
        }
      }

      const value = target[field.name];
      if (field.type === 'group' && value && typeof value === 'object' && !Array.isArray(value)) {
        applyLocalizedDefaults(value, field.fields, translatedField?.fields, stats);
      } else if (field.type === 'list' && Array.isArray(value) && field.field) {
        for (const item of value) {
          if (field.field.type === 'group' && item && typeof item === 'object') {
            applyLocalizedDefaults(item, field.field.fields, translatedField?.field?.fields, stats);
          }
        }
      }
    }
  }

  function localizeNestedLibraries(root, catalog, stats) {
    const visited = new WeakSet();

    function visit(value) {
      if (!value || typeof value !== 'object') return;
      if (visited.has(value)) return;
      visited.add(value);

      if (!Array.isArray(value) && typeof value.library === 'string' && value.params && typeof value.params === 'object') {
        const ref = parseLibraryReference(value.library);
        const entry = ref ? catalog.get(ref.key) : null;
        if (entry?.semantics) {
          applyLocalizedDefaults(value.params, entry.semantics, entry.translatedSemantics, stats);
          stats.localizedLibraryInstances += 1;
        }
      }

      if (Array.isArray(value)) {
        for (const item of value) visit(item);
      } else {
        for (const child of Object.values(value)) visit(child);
      }
    }

    visit(root);
  }

  async function localizeContent(zip, analysis) {
    const language = analysis.language.selected;
    const content = cloneJson(analysis.contentJson);
    const catalog = await buildLocalizationCatalog(zip, analysis, language);
    const stats = {
      language,
      added: 0,
      replaced: 0,
      preserved: 0,
      localizedLibraryInstances: 0,
      translatedLibraries: analysis.translatedLibraries.map(record => record.key),
      untranslatedLibraries: analysis.untranslatedLibraries.map(record => record.key)
    };

    const main = analysis.mainKey ? catalog.get(analysis.mainKey) : null;
    if (main?.semantics) {
      applyLocalizedDefaults(content, main.semantics, main.translatedSemantics, stats);
      stats.localizedLibraryInstances += 1;
    }
    localizeNestedLibraries(content, catalog, stats);

    if (content.metadata && typeof content.metadata === 'object' && content.metadata.defaultLanguage !== undefined) {
      content.metadata.defaultLanguage = language;
    }

    return { content, stats };
  }

  function coreTranslationsFor(language) {
    const candidates = languageCandidates(language);
    const base = candidates.at(-1) || '';
    return CORE_TRANSLATIONS[base] || null;
  }

  function scormApiSource(markIncomplete, enableResume) {
    return `'use strict';\n(function(global){\n  let api=null, initialized=false, finished=false, dirty=false;\n  const cache=new Map();\n  const startedAt=Date.now();\n  function findAPI(win){\n    let attempts=0;\n    while(win && attempts<50){\n      try{ if(win.API) return win.API; }catch(e){}\n      try{ if(win.parent && win.parent!==win){ win=win.parent; attempts++; continue; } }catch(e){}\n      break;\n    }\n    return null;\n  }\n  function locate(){\n    api=findAPI(global);\n    if(!api){ try{ if(global.opener) api=findAPI(global.opener); }catch(e){} }\n    return api;\n  }\n  function init(){\n    if(initialized) return true;\n    api=locate();\n    if(!api) return false;\n    try{ initialized=api.LMSInitialize('')==='true'; }catch(e){ initialized=false; }\n    if(initialized && ${markIncomplete ? 'true' : 'false'}){\n      const s=get('cmi.core.lesson_status');\n      if(!s || s==='not attempted') set('cmi.core.lesson_status','incomplete');\n      commit();\n    }\n    return initialized;\n  }\n  function get(k){\n    if(!initialized&&!init()) return '';\n    try{\n      const value=api.LMSGetValue(k)||'';\n      cache.set(k,String(value));\n      return value;\n    }catch(e){ return ''; }\n  }\n  function set(k,v){\n    if(!initialized&&!init()) return false;\n    const value=String(v);\n    if(cache.has(k) && cache.get(k)===value) return true;\n    try{\n      const ok=api.LMSSetValue(k,value)==='true';\n      if(ok){ cache.set(k,value); dirty=true; }\n      return ok;\n    }catch(e){ return false; }\n  }\n  function commit(force){\n    if(!initialized&&!init()) return false;\n    if(!dirty && !force) return true;\n    try{\n      const ok=api.LMSCommit('')==='true';\n      if(ok) dirty=false;\n      return ok;\n    }catch(e){ return false; }\n  }\n  function error(){\n    if(!api) return {code:'',message:'',diagnostic:''};\n    try{\n      const code=String(api.LMSGetLastError?.()||'');\n      const message=code && code!=='0' ? String(api.LMSGetErrorString?.(code)||'') : '';\n      const diagnostic=code && code!=='0' ? String(api.LMSGetDiagnostic?.(code)||'') : '';\n      return {code,message,diagnostic};\n    }catch(e){ return {code:'',message:'',diagnostic:''}; }\n  }\n  function sessionTime(){\n    const cs=Math.max(0,Math.floor((Date.now()-startedAt)/10));\n    const hours=Math.floor(cs/360000);\n    const minutes=Math.floor((cs%360000)/6000);\n    const seconds=((cs%6000)/100).toFixed(2);\n    return String(hours).padStart(4,'0')+':'+String(minutes).padStart(2,'0')+':'+String(seconds).padStart(5,'0');\n  }\n  function finish(){\n    if(finished) return;\n    finished=true;\n    if(!initialized&&!init()) return;\n    const status=get('cmi.core.lesson_status');\n    if(${enableResume ? 'true' : 'false'}){\n      const isFinal=status==='passed'||status==='completed'||status==='failed';\n      set('cmi.core.exit',isFinal?'':'suspend');\n    }else{\n      set('cmi.core.exit','');\n    }\n    set('cmi.core.session_time',sessionTime());\n    commit();\n    try{api.LMSFinish('');}catch(e){}\n  }\n  global.SCORM12={init,get,set,commit,error,finish,isAvailable:()=>!!(api||locate())};\n})(window);\n`;
  }

  function bridgeSource(masteryScore, language, statusPolicy, saveFreq, enableResume, showRuntimeWarnings, suspendLimit) {
    const translations = coreTranslationsFor(language);
    return `'use strict';\n(function(){\n  const mastery=${Number(masteryScore)};\n  const statusPolicy=${JSON.stringify(statusPolicy)};\n  const runtimeLanguage=${JSON.stringify(language)};\n  const runtimeTranslations=${JSON.stringify(translations)};\n  const enableResume=${enableResume ? 'true' : 'false'};\n  const saveFreq=${Number(saveFreq)};\n  const showRuntimeWarnings=${showRuntimeWarnings ? 'true' : 'false'};\n  const suspendLimit=${Number(suspendLimit)};\n  const contentId='h5p-scorm-content';\n  const SUBCONTENT_EXT='http://h5p.org/x-api/h5p-subContentId';\n  const RAW_PREFIX='H5P3R:';\n  const ZIP_PREFIX='H5P3Z:';\n  let saveTimer=null, firstSaveTimer=null, closing=false, lastPackedState='';\n\n  function verbTail(id){ return String(id||'').split('/').pop().toLowerCase(); }\n  function number(v){ const n=Number(v); return Number.isFinite(n)?n:null; }\n  function isSubcontent(st){\n    const ext=st?.object?.definition?.extensions||{};\n    if(ext[SUBCONTENT_EXT]) return true;\n    const parent=st?.context?.contextActivities?.parent;\n    return Array.isArray(parent) && parent.length>0;\n  }\n  function setRuntimeMessage(message, force=false){\n    if(!force && !showRuntimeWarnings) return;\n    const box=document.getElementById('runtime-status');\n    if(!box) return;\n    box.textContent=message||'';\n    box.hidden=!message;\n  }\n  function scormErrorText(){\n    const info=typeof SCORM12.error==='function'?SCORM12.error():null;\n    if(!info || !info.code || info.code==='0') return '';\n    return ' Erreur SCORM '+info.code+(info.message?': '+info.message:'')+(info.diagnostic?' ('+info.diagnostic+')':'')+'.';\n  }\n  function percent(score){\n    if(!score) return null;\n    const scaled=number(score.scaled);\n    if(scaled!==null) return scaled*100;\n    const raw=number(score.raw), min=number(score.min)??0, max=number(score.max);\n    if(raw!==null && max!==null && max>min) return ((raw-min)/(max-min))*100;\n    if(raw!==null && max===null && raw>=0 && raw<=100) return raw;\n    return null;\n  }\n  function setScore(score){\n    const pct=percent(score);\n    if(pct===null) return;\n    const normalized=Math.max(0,Math.min(100,Math.round(pct*100)/100));\n    SCORM12.set('cmi.core.score.raw',normalized);\n    SCORM12.set('cmi.core.score.min',0);\n    SCORM12.set('cmi.core.score.max',100);\n  }\n  function applyStatus(st){\n    const result=st.result||{};\n    const verb=verbTail(st.verb?.id);\n    const finalEvent=result.completion===true || verb==='completed' || verb==='passed' || verb==='failed';\n    if(!finalEvent) return;\n    const pct=percent(result.score);\n    if(statusPolicy==='completion'){\n      SCORM12.set('cmi.core.lesson_status','completed');\n      return;\n    }\n    if(statusPolicy==='score'){\n      if(pct!==null) SCORM12.set('cmi.core.lesson_status',pct>=mastery?'passed':'failed');\n      else if(typeof result.success==='boolean') SCORM12.set('cmi.core.lesson_status',result.success?'passed':'failed');\n      else if(verb==='passed') SCORM12.set('cmi.core.lesson_status','passed');\n      else if(verb==='failed') SCORM12.set('cmi.core.lesson_status','failed');\n      else if(result.completion===true || verb==='completed') SCORM12.set('cmi.core.lesson_status','completed');\n      return;\n    }\n    if(typeof result.success==='boolean'){\n      SCORM12.set('cmi.core.lesson_status',result.success?'passed':'failed');\n    }else if(verb==='passed'){\n      SCORM12.set('cmi.core.lesson_status','passed');\n    }else if(verb==='failed'){\n      SCORM12.set('cmi.core.lesson_status','failed');\n    }else if(result.completion===true || verb==='completed'){\n      if(pct!==null) SCORM12.set('cmi.core.lesson_status',pct>=mastery?'passed':'failed');\n      else SCORM12.set('cmi.core.lesson_status','completed');\n    }\n  }\n  function handle(event){\n    const st=event?.data?.statement || event?.statement || null;\n    if(!st || isSubcontent(st)) return;\n    setScore(st.result?.score);\n    applyStatus(st);\n    SCORM12.commit();\n    if(enableResume) void saveState('xAPI');\n  }\n\n  function bytesToBase64(bytes){\n    let binary='';\n    const chunk=0x8000;\n    for(let i=0;i<bytes.length;i+=chunk){\n      binary+=String.fromCharCode.apply(null,bytes.subarray(i,Math.min(i+chunk,bytes.length)));\n    }\n    return btoa(binary);\n  }\n  function base64ToBytes(value){\n    const binary=atob(value);\n    const bytes=new Uint8Array(binary.length);\n    for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);\n    return bytes;\n  }\n  async function compressText(text){\n    if(typeof CompressionStream!=='function') return null;\n    const stream=new Blob([new TextEncoder().encode(text)]).stream().pipeThrough(new CompressionStream('deflate'));\n    const bytes=new Uint8Array(await new Response(stream).arrayBuffer());\n    return bytesToBase64(bytes);\n  }\n  async function decompressText(value){\n    if(typeof DecompressionStream!=='function') throw new Error('Décompression non disponible dans ce navigateur.');\n    const stream=new Blob([base64ToBytes(value)]).stream().pipeThrough(new DecompressionStream('deflate'));\n    return new TextDecoder().decode(await new Response(stream).arrayBuffer());\n  }\n  function normalizeStateValue(value){\n    if(value===undefined || value===null) return null;\n    return typeof value==='string' ? value : JSON.stringify(value);\n  }\n  function runtimeContexts(){\n    const result=[];\n    const seen=new Set();\n    const queue=[window];\n    while(queue.length && result.length<20){\n      const ctx=queue.shift();\n      if(!ctx || seen.has(ctx)) continue;\n      seen.add(ctx);\n      result.push(ctx);\n      try{\n        const frames=ctx.document?.querySelectorAll?.('iframe')||[];\n        for(const frame of frames){\n          try{ if(frame.contentWindow && !seen.has(frame.contentWindow)) queue.push(frame.contentWindow); }catch(e){}\n        }\n      }catch(e){}\n    }\n    return result;\n  }\n  function integrationEntry(ctx){\n    try{\n      const contents=ctx?.H5PIntegration?.contents;\n      if(!contents || typeof contents!=='object') return null;\n      const exact=contents['cid-'+contentId];\n      if(exact) return exact;\n      const values=Object.values(contents);\n      return values.length===1?values[0]:null;\n    }catch(e){ return null; }\n  }\n  function captureUserData(){\n    const contexts=runtimeContexts();\n    for(const ctx of contexts){\n      try{\n        const instances=Array.isArray(ctx?.H5P?.instances)?ctx.H5P.instances:[];\n        for(const instance of instances){\n          if(!instance || typeof instance.getCurrentState!=='function') continue;\n          const direct=normalizeStateValue(instance.getCurrentState());\n          if(direct!==null){\n            return [{dataType:'state',subContentId:'0',state:direct}];\n          }\n        }\n      }catch(error){ console.warn('Lecture directe de l’état H5P impossible',error); }\n    }\n    for(const ctx of contexts){\n      const entry=integrationEntry(ctx);\n      const source=entry?.contentUserData;\n      if(!source || typeof source!=='object') continue;\n      const records=[];\n      // Format réellement utilisé par H5P core 1.x : {0:{state:'JSON'}, subId:{dataType:'JSON'}}\n      if(!Array.isArray(source)){\n        for(const [subId,bucket] of Object.entries(source)){\n          if(!bucket || typeof bucket!=='object') continue;\n          for(const [dataType,value] of Object.entries(bucket)){\n            const state=normalizeStateValue(value);\n            if(state===null) continue;\n            records.push({dataType,subContentId:String(subId),state});\n          }\n        }\n      }else{\n        // Compatibilité avec d’anciennes structures produites par le POC.\n        for(const item of source){\n          if(!item || typeof item!=='object') continue;\n          const state=normalizeStateValue(item.state!==undefined?item.state:item.previousState);\n          if(state===null) continue;\n          records.push({dataType:item.dataType||'state',subContentId:String(item.subContentId??'0'),state});\n        }\n      }\n      if(records.length){\n        return records;\n      }\n    }\n    return null;\n  }\n  function restoreUserData(payload){\n    if(!payload || !Array.isArray(payload.records)) return null;\n    // H5P Standalone 3.8.2 transmet contentUserData tel quel au core H5P.\n    // Ce core attend un objet indexé par subContentId puis dataType.\n    const restored={};\n    for(const item of payload.records){\n      if(!item || typeof item!=='object') continue;\n      const subId=String(item.subContentId==='*'||item.subContentId===undefined?'0':item.subContentId);\n      const dataType=item.dataType||'state';\n      const state=normalizeStateValue(item.state);\n      if(state===null) continue;\n      if(!restored[subId]) restored[subId]={};\n      restored[subId][dataType]=state;\n    }\n    return Object.keys(restored).length?restored:null;\n  }\n  async function packState(payload){\n    const json=JSON.stringify(payload);\n    let best=RAW_PREFIX+json;\n    try{\n      const zipped=await compressText(json);\n      if(zipped){\n        const candidate=ZIP_PREFIX+zipped;\n        if(candidate.length<best.length) best=candidate;\n      }\n    }catch(error){ console.warn('Compression suspend_data impossible',error); }\n    return {value:best.length<=suspendLimit?best:null,length:best.length,rawLength:(RAW_PREFIX+json).length};\n  }\n  async function unpackState(value){\n    if(!value) return null;\n    let json=value;\n    if(value.startsWith(RAW_PREFIX)) json=value.slice(RAW_PREFIX.length);\n    else if(value.startsWith(ZIP_PREFIX)) json=await decompressText(value.slice(ZIP_PREFIX.length));\n    try{ return JSON.parse(json); }catch(error){ throw new Error('État de reprise illisible.'); }\n  }\n  async function loadState(){\n    if(!enableResume) return null;\n    SCORM12.get('cmi.core.entry');\n    const stored=SCORM12.get('cmi.suspend_data');\n    if(!stored){\n      return null;\n    }\n    try{\n      const payload=await unpackState(stored);\n      lastPackedState=stored;\n      const restored=restoreUserData(payload);\n      return restored;\n    }catch(error){\n      console.warn(error);\n      setRuntimeMessage('La progression précédente n’a pas pu être restaurée. L’activité reste utilisable.',true);\n      return null;\n    }\n  }\n  async function saveState(reason){\n    if(!enableResume || closing) return false;\n    const records=captureUserData();\n    if(!records){\n      return false;\n    }\n    const packed=await packState({v:1,records});\n    if(!packed.value){\n      setRuntimeMessage('La progression actuelle est trop volumineuse pour SCORM 1.2 ('+packed.length+' caractères après optimisation, limite '+suspendLimit+'). Le dernier état sauvegardable est conservé.');\n      console.warn('suspend_data overflow',reason,packed);\n      return false;\n    }\n    if(!SCORM12.set('cmi.suspend_data',packed.value)){\n      setRuntimeMessage('Le LMS a refusé l’écriture de cmi.suspend_data.'+scormErrorText(),true);\n      return false;\n    }\n    if(!SCORM12.commit()){\n      setRuntimeMessage('Le LMS a refusé la validation de la progression.'+scormErrorText(),true);\n      return false;\n    }\n    lastPackedState=packed.value;\n    setRuntimeMessage('');\n    return true;\n  }\n  function saveStateSync(){\n    if(!enableResume) return;\n    const records=captureUserData();\n    if(records){\n      const raw=RAW_PREFIX+JSON.stringify({v:1,records});\n      if(raw.length<=suspendLimit){\n        lastPackedState=raw;\n        SCORM12.set('cmi.suspend_data',raw);\n        SCORM12.commit();\n        return;\n      }\n    }\n    if(lastPackedState){\n      SCORM12.set('cmi.suspend_data',lastPackedState);\n      SCORM12.commit();\n    }\n  }\n  function closeSession(){\n    if(closing) return;\n    closing=true;\n    if(firstSaveTimer) clearTimeout(firstSaveTimer);\n    if(saveTimer) clearInterval(saveTimer);\n    saveStateSync();\n    SCORM12.finish();\n  }\n\n  async function boot(){\n    document.documentElement.lang=runtimeLanguage||'en';\n    SCORM12.init();\n    const restored=await loadState();\n    const options={\n      id:contentId,\n      h5pJsonPath:'./h5p',\n      contentJsonPath:'./h5p/content',\n      librariesPath:'./h5p',\n      frameJs:'./player/frame.bundle.js',\n      frameCss:'./player/styles/h5p.css',\n      customCss:['./custom/custom.css'],\n      frame:false,\n      copyright:false,\n      export:false,\n      fullScreen:true,\n      reportingIsEnabled:true\n    };\n    if(runtimeTranslations) options.translations=runtimeTranslations;\n    if(enableResume){\n      options.saveFreq=saveFreq;\n      options.contentUserData=restored||{'0':{state:'{}'}};\n    }\n    const container=document.getElementById('h5p-container');\n    try{\n      await new H5PStandalone.H5P(container,options);\n      if(window.H5P && H5P.externalDispatcher){ H5P.externalDispatcher.on('xAPI',handle); }\n      if(enableResume){\n        firstSaveTimer=setTimeout(()=>{ void saveState('initial'); },1000);\n        saveTimer=setInterval(()=>{ void saveState('interval'); },Math.max(5,saveFreq)*1000);\n      }\n    }catch(error){\n      document.getElementById('runtime-error').textContent='Erreur H5P : '+error.message;\n      console.error(error);\n    }\n  }\n  window.addEventListener('pagehide',closeSession);\n  window.addEventListener('beforeunload',closeSession);\n  window.addEventListener('DOMContentLoaded',boot);\n})();\n`;
  }

  function launchHtml(title, language) {
    const safeTitle = escapeHtml(title);
    const safeLanguage = escapeHtml(language || 'en');
    return `<!doctype html>\n<html lang="${safeLanguage}">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>${safeTitle}</title>\n<style>html,body{margin:0;padding:0;background:#fff}#h5p-container{width:100%}#runtime-error{font-family:Arial,sans-serif;color:#8a1f1f;padding:12px}#runtime-status{font-family:Arial,sans-serif;background:#fff5d8;border:1px solid #d3a33b;color:#5c450d;margin:10px;padding:10px 12px;border-radius:6px;font-size:14px;line-height:1.4}#runtime-status[hidden]{display:none}</style>\n</head>\n<body>\n<div id="runtime-error"></div>\n<div id="runtime-status" hidden></div>\n<div id="h5p-container"></div>\n<script src="./scorm/scorm12.js"></script>\n<script src="./player/main.bundle.js"></script>\n<script src="./scorm/h5p-scorm-bridge.js"></script>\n</body>\n</html>\n`;
  }

  function xmlEscape(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&apos;');
  }

  function manifestXml(title, masteryScore, statusPolicy, filePaths) {
    const files = filePaths
      .filter(path => path !== 'imsmanifest.xml')
      .sort()
      .map(path => `      <file href="${xmlEscape(path)}"/>`)
      .join('\n');
    const mastery = statusPolicy === 'completion' ? '' : `\n        <adlcp:masteryscore>${Number(masteryScore)}</adlcp:masteryscore>`;
    return `<?xml version="1.0" encoding="UTF-8"?>\n<manifest identifier="H5P_SCORM_PACKAGE" version="1.0"\n  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"\n  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"\n  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n  <metadata>\n    <schema>ADL SCORM</schema>\n    <schemaversion>1.2</schemaversion>\n  </metadata>\n  <organizations default="ORG-1">\n    <organization identifier="ORG-1">\n      <title>${xmlEscape(title)}</title>\n      <item identifier="ITEM-1" identifierref="RES-1" isvisible="true">\n        <title>${xmlEscape(title)}</title>${mastery}\n      </item>\n    </organization>\n  </organizations>\n  <resources>\n    <resource identifier="RES-1" type="webcontent" adlcp:scormtype="sco" href="index.html">\n${files}\n    </resource>\n  </resources>\n</manifest>\n`;
  }

  function cleanFilename(name) {
    return name
      .replace(/\.h5p$/i, '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'h5p-scorm';
  }

  async function generateScorm() {
    if (!state.analysis?.ok || !state.zip) return;
    generateBtn.disabled = true;
    clearLog();
    resetGenerationProgress();
    try {
      const out = new JSZip();
      const title = el('courseTitle').value.trim() || state.analysis.h5pJson?.title || 'Activité H5P';
      const masteryScore = Math.max(0, Math.min(100, Number(el('masteryScore').value) || 0));
      const markIncomplete = el('markIncomplete').checked;
      const language = state.analysis.language.selected;
      const statusPolicy = el('statusPolicy').value || 'auto';
      const enableResume = el('enableResume').checked;
      const showRuntimeWarnings = el('showRuntimeWarnings').checked;
      const resumeProfile = suspendDataProfile();
      const suspendLimit = enableResume ? resumeProfile.limit : STRICT_SUSPEND_DATA_LIMIT;
      const saveFreq = Math.max(5, Math.min(300, Number(el('saveFreq').value) || 10));

      setGenerationProgress(3, 'Préparation');
      logLine(`Préparation de la localisation ${language}…`);
      const localized = await localizeContent(state.zip, state.analysis);
      logLine(`Localisation : ${localized.stats.replaced} valeur(s) remplacée(s), ${localized.stats.added} valeur(s) ajoutée(s), ${localized.stats.preserved} valeur(s) personnalisée(s) préservée(s).`);

      setGenerationProgress(8, 'Copie du contenu H5P');
      logLine('Copie du contenu H5P dans le package SCORM…');
      const paths = Object.keys(state.zip.files);
      let copied = 0;
      for (const path of paths) {
        const entry = state.zip.files[path];
        if (entry.dir) continue;
        if (!safeZipPath(path)) throw new Error(`Chemin non sûr refusé : ${path}`);
        if (path === 'h5p.json' || path === 'content/content.json') continue;
        const data = await entry.async('uint8array');
        out.file(`h5p/${path}`, data);
        copied += 1;
      }

      const outputH5pJson = cloneJson(state.analysis.h5pJson);
      outputH5pJson.language = language;
      out.file('h5p/h5p.json', JSON.stringify(outputH5pJson, null, 2));
      out.file('h5p/content/content.json', JSON.stringify(localized.content));
      logLine(`${copied + 2} fichiers H5P copiés ou reconstruits.`);

      setGenerationProgress(15, 'Intégration du lecteur H5P');
      await fetchPlayerDist(out);
      setGenerationProgress(35, 'Assemblage du package');

      const css = [state.importedCss, el('cssText').value].filter(Boolean).join('\n\n');
      out.file('custom/custom.css', css || '/* Aucun style personnalisé */\n');
      out.file('index.html', launchHtml(title, language));
      out.file('scorm/scorm12.js', scormApiSource(markIncomplete, enableResume));
      out.file('scorm/h5p-scorm-bridge.js', bridgeSource(masteryScore, language, statusPolicy, saveFreq, enableResume, showRuntimeWarnings, suspendLimit));
      out.file('localization-report.json', JSON.stringify(localized.stats, null, 2));

      const generationReport = {
        generator: `H5P vers SCORM ${APP_VERSION}`,
        player: `h5p-standalone ${PLAYER_VERSION}`,
        runtime: {
          profileId: RUNTIME_PROFILE_ID,
          h5pStandaloneVersion: PLAYER_VERSION,
          declaredCoreApiCeiling: { ...H5P_CORE_API_SUPPORTED },
          maxRequiredCoreApi: state.analysis.runtimeCompatibility?.maxRequiredCoreApi || null,
          compatibilityCheckedLibraries: state.analysis.runtimeCompatibility?.checkedLibraries || 0
        },
        generatedAt: new Date().toISOString(),
        title,
        language,
        mainLibrary: state.analysis.mainKey,
        statusPolicy,
        masteryScore: statusPolicy === 'completion' ? null : masteryScore,
        resume: {
          enabled: enableResume,
          saveFrequencySeconds: enableResume ? saveFreq : null,
          profile: enableResume ? resumeProfile.key : null,
          profileLabel: enableResume ? resumeProfile.label : null,
          suspendDataLimit: enableResume ? suspendLimit : null,
          experimentalProfile: enableResume ? resumeProfile.experimental : false,
          compression: enableResume ? 'CompressionStream deflate si disponible, sinon JSON brut' : null
        },
        score: { normalizedTo100: true, min: 0, max: 100 },
        localization: localized.stats
      };
      out.file('generation-report.json', JSON.stringify(generationReport, null, 2));
      out.file('README.txt', `Package généré par H5P vers SCORM ${APP_VERSION}\nLecteur : h5p-standalone ${PLAYER_VERSION}\nPlafond H5P Core API déclaré : ${formatCoreApi(H5P_CORE_API_SUPPORTED)}\nTitre : ${title}\nLangue : ${language}\nPolitique de statut : ${statusPolicy}\nSeuil : ${statusPolicy === 'completion' ? 'sans objet' : masteryScore + '%'}\nReprise : ${enableResume ? 'activée, sauvegarde toutes les ' + saveFreq + ' s' : 'désactivée'}\nProfil de reprise : ${enableResume ? resumeProfile.label : 'sans objet'}\nLimite suspend_data : ${enableResume ? suspendLimit + ' caractères' : 'sans objet'}\nScore SCORM : normalisé sur 100\n`);

      const currentPaths = Object.keys(out.files).filter(path => !out.files[path].dir);
      out.file('imsmanifest.xml', manifestXml(title, masteryScore, statusPolicy, currentPaths));

      logLine('Compression du ZIP SCORM…');
      setGenerationProgress(40, 'Compression du ZIP SCORM');
      const blob = await out.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
        streamFiles: true
      }, meta => {
        const overall = 40 + (Math.max(0, Math.min(100, meta.percent)) * 0.6);
        setGenerationProgress(overall, 'Compression du ZIP SCORM');
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cleanFilename(state.file.name)}-scorm12.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      setGenerationProgress(100, 'Terminé');
      logLine(`Terminé : ${a.download}`);
    } catch (error) {
      console.error(error);
      generationProgressPhase.textContent = 'Échec';
      logLine(`Échec de génération : ${error.message}`);
    } finally {
      generateBtn.disabled = !state.analysis?.ok;
    }
  }

  async function handleH5PFile(file) {
    clearPreview();
    state.file = file || null;
    state.zip = null;
    state.analysis = null;
    generateBtn.disabled = true;
    analyzeBtn.disabled = !state.file;
    resetGenerationProgress();
    const dropZone = el('h5pDropZone');
    if (!state.file) {
      el('fileMeta').textContent = 'Aucun fichier chargé.';
      if (el('dropFileName')) el('dropFileName').textContent = 'Glissez-déposez un fichier .h5p ici';
      dropZone?.classList.remove('has-file');
      return;
    }
    const accepted = /\.(h5p|zip)$/i.test(state.file.name);
    if (!accepted) {
      state.file = null;
      analyzeBtn.disabled = true;
      dropZone?.classList.remove('has-file');
      if (el('dropFileName')) el('dropFileName').textContent = 'Glissez-déposez un fichier .h5p ici';
      el('fileMeta').textContent = 'Format non reconnu. Sélectionnez un fichier .h5p.';
      diagnostic.className = 'diagnostic status-error';
      diagnostic.textContent = 'Le fichier déposé n’a pas une extension .h5p ou .zip.';
      return;
    }
    el('fileMeta').textContent = `${state.file.name} - ${(state.file.size / 1024 / 1024).toFixed(2)} Mo`;
    if (el('dropFileName')) el('dropFileName').textContent = state.file.name;
    dropZone?.classList.add('has-file');
    const inferred = state.file.name.replace(/\.h5p$/i, '').replace(/[-_]+/g, ' ').trim();
    if (inferred) el('courseTitle').value = inferred;
    await loadAndAnalyze();
  }

  h5pFile.addEventListener('change', async () => {
    await handleH5PFile(h5pFile.files?.[0] || null);
  });

  const dropZone = el('h5pDropZone');
  if (dropZone) {
    const prevent = event => { event.preventDefault(); event.stopPropagation(); };
    for (const eventName of ['dragenter', 'dragover']) {
      dropZone.addEventListener(eventName, event => {
        prevent(event);
        dropZone.classList.add('is-dragover');
      });
    }
    for (const eventName of ['dragleave', 'drop']) {
      dropZone.addEventListener(eventName, event => {
        prevent(event);
        dropZone.classList.remove('is-dragover');
      });
    }
    dropZone.addEventListener('drop', async event => {
      const file = event.dataTransfer?.files?.[0] || null;
      if (file) await handleH5PFile(file);
    });
  }

  cssFile.addEventListener('change', async () => {
    const file = cssFile.files?.[0];
    state.importedCss = file ? await file.text() : '';
    if (file) logLine(`CSS importé : ${file.name}`);
    updatePreviewCss();
  });

  function updatePreviewCss() {
    preview.updateCss([state.importedCss,el('cssText').value].filter(Boolean).join('\n\n'));
  }
  el('cssText').addEventListener('input', () => {
    clearTimeout(cssDebounce);
    cssDebounce = setTimeout(updatePreviewCss, 180);
  });
  el('previewRestart').addEventListener('click', () => { void launchPreview(); });
  function setPreviewExpanded(expanded) {
    const viewport=el('previewViewport');
    viewport.classList.toggle('preview-is-expanded',expanded);
    el('previewExpand').textContent=expanded ? 'Réduire' : 'Agrandir';
    document.body.classList.toggle('preview-expanded',expanded);
    el('previewCollapse').hidden=!expanded;
    preview.notifyResize();
  }
  el('previewCollapse').addEventListener('click', () => setPreviewExpanded(false));
  el('previewExternalVideos').addEventListener('change', () => {void launchPreview();});
  el('previewExpand').addEventListener('click', () => {
    setPreviewExpanded(!el('previewViewport').classList.contains('preview-is-expanded'));
  });
  document.addEventListener?.('keydown', event => {
    if (event.key === 'Escape' && el('previewViewport').classList.contains('preview-is-expanded')) {
      setPreviewExpanded(false);
    }
  });

  el('languageOverride').addEventListener('change', async () => {
    if (state.file) await loadAndAnalyze();
  });

  for (const id of ['statusPolicy', 'enableResume', 'saveFreq', 'resumeProfile']) {
    el(id).addEventListener('change', () => {
      updateConditionalFields();
      if (state.analysis) renderDiagnostic(state.analysis);
    });
  }

  document.addEventListener?.('click', event => {
    const help = event.target.closest?.('.help');
    document.querySelectorAll?.('.help[aria-expanded=\"true\"]').forEach(item => {
      if (item !== help) item.setAttribute('aria-expanded', 'false');
    });
    if (help) {
      event.preventDefault();
      help.setAttribute('aria-expanded', help.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
    }
  });
  document.addEventListener?.('keydown', event => {
    if (event.key === 'Escape') {
      document.querySelectorAll?.('.help[aria-expanded=\"true\"]').forEach(item => item.setAttribute('aria-expanded', 'false'));
    }
  });

  updateConditionalFields();
  analyzeBtn.addEventListener('click', loadAndAnalyze);
  generateBtn.addEventListener('click', generateScorm);
})();
