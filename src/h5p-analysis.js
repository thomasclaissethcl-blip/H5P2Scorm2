/* Analyse statique d'un paquet H5P, sans dépendance au DOM ni exécution de scripts. */
(function (root) {
  'use strict';
  const compatibility = root.H5PConverterModules?.compatibility;
  if (!compatibility) throw new Error('Charger runtime-profiles.js avant h5p-analysis.js.');
  const dependencies = root.H5PConverterModules?.dependencies;
  if (!dependencies) throw new Error('Charger h5p-dependencies.js avant h5p-analysis.js.');
  const { dependencyKey, readDependencies } = dependencies;
  const { formatCoreApi } = compatibility;

  function safeZipPath(path) {
    const normalized = path.replaceAll('\\', '/');
    if (!normalized || normalized.startsWith('/') || /^[A-Za-z]:\//.test(normalized)) return false;
    const parts = normalized.split('/');
    return !parts.some(part => part === '..');
  }

  function normalizeLanguageCode(value) {
    const raw = String(value || '').trim().replaceAll('_', '-').toLowerCase();
    if (!raw || raw === 'und' || raw === 'auto') return '';
    return raw;
  }

  function languageCandidates(value) {
    const normalized = normalizeLanguageCode(value);
    if (!normalized) return [];
    const candidates = [normalized];
    const base = normalized.split('-')[0];
    if (base && base !== normalized) candidates.push(base);
    return candidates;
  }

  function resolveLanguage(h5pJson, contentJson, options = {}) {
    const override = normalizeLanguageCode(options.languageOverride);
    const declared = normalizeLanguageCode(h5pJson?.language);
    const metadata = normalizeLanguageCode(
      contentJson?.metadata?.defaultLanguage ||
      h5pJson?.metadata?.defaultLanguage ||
      h5pJson?.defaultLanguage
    );
    const browser = normalizeLanguageCode(options.browserLanguage);
    const selected = override || declared || metadata || browser || 'en';
    return {
      override,
      declared,
      metadata,
      browser,
      selected,
      source: override ? 'forcée' : declared ? 'h5p.json' : metadata ? 'métadonnées' : browser ? 'navigateur' : 'repli'
    };
  }

  function availableLanguagesForFolder(allPaths, folder) {
    const prefix = `${folder}/language/`;
    return [...new Set(allPaths
      .filter(path => path.startsWith(prefix) && path.endsWith('.json'))
      .map(path => path.slice(prefix.length, -'.json'.length).toLowerCase()))]
      .sort();
  }

  function translationPathFor(record, language) {
    for (const candidate of languageCandidates(language)) {
      if (record.languages.includes(candidate)) return `${record.folder}/language/${candidate}.json`;
    }
    return null;
  }

  async function parseJsonFile(zip, path, required = true) {
    const entry = zip.file(path);
    if (!entry) {
      if (required) throw new Error(`Fichier requis absent : ${path}`);
      return null;
    }
    const text = await entry.async('string');
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error(`JSON invalide dans ${path} : ${error.message}`);
    }
  }

  async function analyzeH5P(zip, options = {}) {
    const profile = options.runtimeProfile || compatibility.defaultProfile;
    if (!profile?.supportedCoreApi || !profile?.id || !profile?.playerVersion) {
      throw new Error('Profil de lecture H5P invalide.');
    }
    const issues = [];
    const warnings = [];
    const allPaths = Object.keys(zip.files);

    const unsafePaths = allPaths.filter(path => !safeZipPath(path));
    if (unsafePaths.length) {
      issues.push(`Chemins non sûrs détectés dans l’archive : ${unsafePaths.slice(0, 5).join(', ')}`);
    }

    let h5pJson;
    let contentJson;
    try {
      h5pJson = await parseJsonFile(zip, 'h5p.json');
    } catch (error) {
      issues.push(error.message);
    }
    try {
      contentJson = await parseJsonFile(zip, 'content/content.json');
    } catch (error) {
      issues.push(error.message);
    }

    if (!h5pJson || !contentJson) {
      return { ok: false, issues, warnings, libraries: [], missing: [], h5pJson, contentJson };
    }

    if (!h5pJson.mainLibrary) issues.push('h5p.json ne contient pas mainLibrary.');
    if (!h5pJson.language) warnings.push('h5p.json ne contient pas language. La langue sera déterminée par une autre source.');
    if (!Array.isArray(h5pJson.embedTypes) || h5pJson.embedTypes.length === 0) issues.push('h5p.json ne contient pas embedTypes.');
    if (!Array.isArray(h5pJson.preloadedDependencies)) issues.push('h5p.json ne contient pas de tableau preloadedDependencies.');

    const folderNames = new Set(
      allPaths
        .map(path => path.split('/')[0])
        .filter(Boolean)
    );

    const libraries = [];
    const inventory = new Map();

    for (const folder of folderNames) {
      const libPath = `${folder}/library.json`;
      if (!zip.file(libPath)) continue;
      try {
        const lib = await parseJsonFile(zip, libPath);
        const key = `${lib.machineName}-${Number(lib.majorVersion)}.${Number(lib.minorVersion)}`;
        const record = {
          folder,
          key,
          library: lib,
          dependencies: readDependencies(lib),
          languages: availableLanguagesForFolder(allPaths, folder),
          hasSemantics: Boolean(zip.file(`${folder}/semantics.json`))
        };
        libraries.push(record);
        inventory.set(key, record);
      } catch (error) {
        issues.push(error.message);
      }
    }

    const { required, missing } = dependencies.resolveDependencies(h5pJson, inventory);

    if (missing.length) {
      issues.push(`${missing.length} dépendance(s) d’exécution sont absentes du package.`);
    }

    if (libraries.length === 0) {
      issues.push('Aucune bibliothèque H5P avec library.json n’a été trouvée dans l’archive.');
    }

    const mainDependency = readDependencies(h5pJson).find(dep => dep.machineName === h5pJson.mainLibrary);
    const mainKey = mainDependency ? dependencyKey(mainDependency) : null;
    if (h5pJson.mainLibrary && (!mainKey || !inventory.has(mainKey))) {
      issues.push(`La bibliothèque principale ${h5pJson.mainLibrary} n’est pas présente.`);
    }

    const runtimeRecordKeys = new Set(required.keys());
    if (mainKey) runtimeRecordKeys.add(mainKey);
    const assessed = compatibility.assessCoreApi(runtimeRecordKeys, inventory, profile);
    const coreApiChecks = assessed.checks;
    const invalidCoreApi = assessed.invalid;
    const incompatibleCoreApi = assessed.incompatible;
    const declaredCoreApi = assessed.declared;
    const maxRequiredCoreApi = assessed.maxRequiredCoreApi;

    if (invalidCoreApi.length) {
      issues.push(`${invalidCoreApi.length} bibliothèque(s) requise(s) déclarent un coreApi invalide. La génération est bloquée car la compatibilité du runtime ne peut pas être vérifiée.`);
    }
    if (incompatibleCoreApi.length) {
      issues.push(`${incompatibleCoreApi.length} bibliothèque(s) requise(s) demandent une H5P Core API plus récente que ${formatCoreApi(profile.supportedCoreApi)}, plafond déclaré du runtime embarqué.`);
    }

    const language = resolveLanguage(h5pJson, contentJson, options);
    const localizationLibraries = [...required.keys()]
      .map(key => inventory.get(key))
      .filter(Boolean)
      .filter(record => record.hasSemantics);
    const translatedLibraries = localizationLibraries.filter(record => translationPathFor(record, language.selected));
    const untranslatedLibraries = localizationLibraries.filter(record => !translationPathFor(record, language.selected));

    if (languageCandidates(language.selected)[0] !== 'en' && untranslatedLibraries.length) {
      warnings.push(`${untranslatedLibraries.length} bibliothèque(s) avec semantics.json n’ont pas de traduction ${language.selected} dans le package. Leurs valeurs par défaut peuvent rester dans la langue source.`);
    }

    const coreLanguage = languageCandidates(language.selected).at(-1) || language.selected;
    if (coreLanguage !== 'en' && !(options.coreTranslations || {})[coreLanguage]) {
      warnings.push(`La version actuelle ne fournit pas encore de traduction système H5P pour « ${language.selected} ». Les libellés système du lecteur resteront en anglais.`);
    }

    const totalUncompressed = allPaths.reduce((sum, path) => {
      const entry = zip.files[path];
      return sum + (entry?._data?.uncompressedSize || 0);
    }, 0);
    if (allPaths.length > 10000) {
      issues.push('Le package contient plus de 10 000 entrées ZIP. La génération est bloquée par précaution.');
    }
    if (totalUncompressed > 512 * 1024 * 1024) {
      issues.push('Le contenu dépasse 512 Mo décompressés. La génération est bloquée par précaution.');
    } else if (totalUncompressed > 250 * 1024 * 1024) {
      warnings.push('Le contenu dépasse 250 Mo décompressés. La génération en mémoire peut être instable sur certains navigateurs.');
    }

    return {
      ok: issues.length === 0,
      issues,
      warnings,
      libraries,
      inventory,
      missing,
      h5pJson,
      contentJson,
      required: [...required.keys()],
      mainKey,
      language,
      localizationLibraries,
      translatedLibraries,
      untranslatedLibraries,
      runtimeCompatibility: {
        profileId: profile.id,
        playerVersion: profile.playerVersion,
        supportedCoreApi: { ...profile.supportedCoreApi },
        checkedLibraries: coreApiChecks.length,
        declaredLibraries: declaredCoreApi.length,
        maxRequiredCoreApi,
        incompatible: incompatibleCoreApi.map(item => ({ key: item.record.key, requirement: item.requirement })),
        invalid: invalidCoreApi.map(item => ({ key: item.record.key }))
      },
      totalEntries: allPaths.length,
      totalUncompressed
    };
  }


  const api = Object.freeze({
    safeZipPath, normalizeLanguageCode, languageCandidates, resolveLanguage,
    availableLanguagesForFolder, translationPathFor, parseJsonFile, analyzeH5P
  });
  root.H5PConverterModules.analysis = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(globalThis);
