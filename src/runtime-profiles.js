/* Profil H5P et contrôles Core API. Aucun accès au DOM ni au réseau. */
(function (root) {
  'use strict';
  const defaultProfile = Object.freeze({
    id: 'h5p-standalone-3.8.2-core-1.28',
    playerVersion: '3.8.2',
    supportedCoreApi: Object.freeze({ majorVersion: 1, minorVersion: 28 }),
    validation: 'plafond-déclaré-non-certification-universelle'
  });

  // Le catalogue accepte de futurs profils, mais un seul est disponible dans ce lot.
  const profiles = Object.freeze([defaultProfile]);
  function getProfile(id) { return profiles.find(profile => profile.id === id) || null; }

  function normalizeCoreApi(value) {
    if (value == null) return null;
    const majorVersion = Number(value.majorVersion);
    const minorVersion = Number(value.minorVersion);
    if (!Number.isInteger(majorVersion) || majorVersion < 0 || !Number.isInteger(minorVersion) || minorVersion < 0) {
      return { invalid: true, raw: value };
    }
    return { majorVersion, minorVersion };
  }

  function compareCoreApi(left, right) {
    if (left.majorVersion !== right.majorVersion) return left.majorVersion - right.majorVersion;
    return left.minorVersion - right.minorVersion;
  }

  function formatCoreApi(value) {
    if (!value || value.invalid) return 'non renseignée';
    return `${value.majorVersion}.${value.minorVersion}`;
  }

  function assessCoreApi(requiredKeys, inventory, profile = defaultProfile) {
    const checks = [...requiredKeys]
      .map(key => inventory.get(key))
      .filter(Boolean)
      .map(record => ({ record, requirement: normalizeCoreApi(record.library?.coreApi) }));
    const invalid = checks.filter(item => item.requirement?.invalid);
    const incompatible = checks.filter(item => item.requirement && !item.requirement.invalid && compareCoreApi(item.requirement, profile.supportedCoreApi) > 0);
    const declared = checks.filter(item => item.requirement && !item.requirement.invalid);
    const maxRequiredCoreApi = declared.reduce((max, item) => {
      if (!max || compareCoreApi(item.requirement, max) > 0) return item.requirement;
      return max;
    }, null);
    return { checks, invalid, incompatible, declared, maxRequiredCoreApi };
  }

  const api = Object.freeze({ defaultProfile, profiles, getProfile, normalizeCoreApi, compareCoreApi, formatCoreApi, assessCoreApi });
  const modules = root.H5PConverterModules || (root.H5PConverterModules = {});
  modules.compatibility = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(globalThis);
