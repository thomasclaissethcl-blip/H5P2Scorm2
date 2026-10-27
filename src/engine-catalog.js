/* Catalogue moteur H5P : enrichissement documentaire sans changer le runtime actif.
 * Aucun accès au réseau, au DOM ou à des bibliothèques externes.
 * Les candidats non qualifiés ne sont jamais activés automatiquement.
 */
(function (root) {
  'use strict';
  const compatibility = root.H5PConverterModules?.compatibility;
  if (!compatibility) throw new Error('Charger runtime-profiles.js avant engine-catalog.js.');
  const reference = compatibility.defaultProfile;
  const profiles = Object.freeze([
    Object.freeze({
      id: reference.id,
      player: 'H5P Standalone', playerVersion: reference.playerVersion,
      coreApiCeiling: Object.freeze({ ...reference.supportedCoreApi }),
      status: 'reference', selectable: true, previewTrial: false,
      evidence: 'Recette utilisateur ciblée : H5P.GameMap 1.9.8, Firefox, GitHub Pages (lot 3.6).',
      note: 'Le plafond Core API est déclaré, pas vérifié sur toutes les bibliothèques.'
    }),
    Object.freeze({
      id: 'h5p-standalone-3.8.1-candidate',
      player: 'H5P Standalone', playerVersion: '3.8.1',
      coreApiCeiling: null, status: 'candidate', selectable: false, previewTrial: true,
      evidence: 'Version publiée, mais non qualifiée avec ce convertisseur.',
      note: 'Manifeste des ressources, compatibilité Core API et tests fonctionnels à établir.'
    }),
    Object.freeze({
      id: 'h5p-standalone-3.8.0-candidate',
      player: 'H5P Standalone', playerVersion: '3.8.0',
      coreApiCeiling: null, status: 'candidate', selectable: false, previewTrial: true,
      evidence: 'Version publiée, mais non qualifiée avec ce convertisseur.',
      note: 'La composition des ressources peut différer de la 3.8.2.'
    })
  ]);

  // Les moteurs candidats peuvent être essayés manuellement UNIQUEMENT en aperçu.
  // Leur plafond Core API et leur fonctionnement ne sont pas qualifiés.
  function previewProfile(id) {
    return profiles.find(p => p.id === id && (p.status === 'reference' ||
      (p.status === 'candidate' && p.previewTrial === true))) || null;
  }
  function canExportWithPreview(id) {
    const p = previewProfile(id);
    return Boolean(p && p.status === 'reference' && p.id === reference.id && p.selectable);
  }
  function availableProfiles(requiredCoreApi, pool = profiles) {
    const normalized = compatibility.normalizeCoreApi(requiredCoreApi);
    if (normalized?.invalid) return [];
    return pool.filter(p => p.selectable === true && p.status === 'reference' &&
      p.coreApiCeiling && (!normalized || compatibility.compareCoreApi(normalized, p.coreApiCeiling) <= 0));
  }

  // Ne choisit pas un candidat, même si sa version est supérieure ou antérieure.
  function selectProfile(requiredCoreApi, pool = profiles) {
    return availableProfiles(requiredCoreApi, pool)[0] || null;
  }

  function textOrNull(value) {
    if (value === undefined || value === null || value === '') return null;
    return String(value);
  }
  function toVersion(library) {
    if (!library || typeof library !== 'object') return null;
    const parts = [library.majorVersion, library.minorVersion, library.patchVersion];
    return parts.map((p, i) => {
      const n = Number(p);
      return Number.isInteger(n) && n >= 0 ? String(n) : (i === 2 ? '?' : 'inconnue');
    }).join('.');
  }
  function buildReport(analysis, {previewProfileId = reference.id} = {}) {
    if (!analysis || typeof analysis !== 'object') throw new TypeError('Analyse H5P requise.');
    const required = new Set(analysis.required || []);
    const libraries = (analysis.libraries || []).map(record => {
      const lib = record.library || {};
      const api = compatibility.normalizeCoreApi(lib.coreApi);
      const deps = record.dependencies || [];
      return {
        machineName: textOrNull(lib.machineName),
        version: toVersion(lib),
        key: textOrNull(record.key),
        folder: textOrNull(record.folder),
        role: record.key === analysis.mainKey ? 'principale' : required.has(record.key) ? 'execution' : 'embarquee_non_requise',
        coreApiDeclared: api?.invalid ? 'invalide' : api ? compatibility.formatCoreApi(api) : null,
        dependencies: deps.map(dep => ({
          machineName: textOrNull(dep.machineName),
          majorVersion: dep.majorVersion ?? null,
          minorVersion: dep.minorVersion ?? null,
          kind: textOrNull(dep.kind) || null
        }))
      };
    });
    const rc = analysis.runtimeCompatibility || {};
    const requiredCore = rc.maxRequiredCoreApi ? { ...rc.maxRequiredCoreApi } : null;
    const selected = selectProfile(requiredCore);
    const runtime = profiles.find(p => p.id === rc.profileId) || profiles[0];
    const warnings = [...(analysis.warnings || [])];
    if (!requiredCore) warnings.push('Core API maximale non déterminée : absence de déclaration pour les bibliothèques pertinentes.');
    if (selected && selected.id !== runtime.id) warnings.push('Sélection et runtime actif différents : aucun moteur de substitution n’est lancé.');
    const preview = previewProfile(previewProfileId);
    if (!preview) warnings.push('Profil de prévisualisation inconnu : le lecteur de référence doit être utilisé.');
    else if (!canExportWithPreview(preview.id)) warnings.push('Prévisualisation expérimentale sur un moteur non qualifié. Export SCORM désactivé tant que ce moteur est sélectionné.');
    return {
      schemaVersion: 1,
      activity: {
        title: textOrNull(analysis.h5pJson?.title),
        mainLibrary: textOrNull(analysis.h5pJson?.mainLibrary),
        mainKey: textOrNull(analysis.mainKey),
        language: textOrNull(analysis.language?.selected)
      },
      runtime: {
        activeProfileId: textOrNull(rc.profileId) || reference.id,
        playerVersion: textOrNull(rc.playerVersion) || reference.playerVersion,
        supportedCoreApiDeclared: rc.supportedCoreApi ? { ...rc.supportedCoreApi } : { ...reference.supportedCoreApi },
        maximumCoreApiRequired: requiredCore,
        status: runtime.status,
        qualification: runtime.evidence,
        // Analyse statique du paquet, pas certification de rendu ou du LMS.
        diagnostic: analysis.ok ? 'analyse_statique_admissible' : 'analyse_statique_bloquee'
      },
      eligibleProfileIds: availableProfiles(requiredCore).map(p => p.id),
      preview: {
        requestedProfileId: preview ? preview.id : reference.id,
        playerVersion: preview ? preview.playerVersion : reference.playerVersion,
        mode: preview && preview.previewTrial ? 'essai_manuel_non_qualifie' : 'reference_validee',
        exportAllowedWithPreview: Boolean(preview && canExportWithPreview(preview.id)),
        scope: 'Le moteur choisi dans la visionneuse ne remplace jamais silencieusement le moteur du SCORM.'
      },
      catalogue: profiles.map(p => ({
        id: p.id, player: p.player, version: p.playerVersion,
        declaredCoreApiCeiling: p.coreApiCeiling ? { ...p.coreApiCeiling } : null,
        status: p.status, selectable: p.selectable, previewTrial: Boolean(p.previewTrial), evidence: p.evidence, note: p.note
      })),
      libraries,
      missing: (analysis.missing || []).map(dep => ({key: textOrNull(dep.key), kind: textOrNull(dep.kind)})),
      issues: [...(analysis.issues || [])],
      warnings,
      compatibleByDeclaredRequirementsOnly: Boolean(analysis.ok),
      limitations: [
        'Le diagnostic Core API ne prouve pas la compatibilité fonctionnelle de toutes les bibliothèques.',
        'H5P Editor est non requis pour la lecture ou la conversion et n’est pas embarqué.',
        'Les candidats non qualifiés sont affichés mais indisponibles pour la lecture et l’export.'
      ]
    };
  }

  function validateCatalogue(pool = profiles) {
    const ids = new Set();
    for (const p of pool) {
      if (!p || typeof p.id !== 'string' || ids.has(p.id)) return false;
      ids.add(p.id);
      if (!/^\d+\.\d+\.\d+$/.test(p.playerVersion)) return false;
      if (p.selectable && (!p.coreApiCeiling || p.status !== 'reference' || p.previewTrial)) return false;
      if (p.previewTrial && (p.status !== 'candidate' || p.selectable || p.coreApiCeiling !== null)) return false;
      if (p.coreApiCeiling && compatibility.normalizeCoreApi(p.coreApiCeiling)?.invalid) return false;
    }
    return pool.some(p => p.id === reference.id && p.selectable && p.playerVersion === reference.playerVersion);
  }
  if (!validateCatalogue()) throw new Error('Catalogue de moteurs H5P incohérent.');
  const api = Object.freeze({profiles, availableProfiles, selectProfile, previewProfile, canExportWithPreview, buildReport, validateCatalogue});
  const modules = root.H5PConverterModules || (root.H5PConverterModules = {});
  modules.engineCatalog = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(globalThis);
