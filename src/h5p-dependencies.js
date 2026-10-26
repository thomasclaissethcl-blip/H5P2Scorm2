/* Résolution des dépendances d’exécution H5P, distincte de l’interface. */
(function (root) {
  'use strict';
  function dependencyKey(dep) {
    return `${dep.machineName}-${dep.majorVersion}.${dep.minorVersion}`;
  }

  function readDependencies(obj) {
    const groups = [
      ['preloaded', obj?.preloadedDependencies],
      ['dynamic', obj?.dynamicDependencies]
    ];
    const result = [];
    for (const [kind, deps] of groups) {
      if (!Array.isArray(deps)) continue;
      for (const dep of deps) {
        if (dep?.machineName && Number.isFinite(Number(dep.majorVersion)) && Number.isFinite(Number(dep.minorVersion))) {
          result.push({
            kind,
            machineName: dep.machineName,
            majorVersion: Number(dep.majorVersion),
            minorVersion: Number(dep.minorVersion)
          });
        }
      }
    }
    return result;
  }

  function parseLibraryReference(value) {
    const match = String(value || '').trim().match(/^(.+?)\s+(\d+)\.(\d+)(?:\.(\d+))?$/);
    if (!match) return null;
    return {
      machineName: match[1],
      majorVersion: Number(match[2]),
      minorVersion: Number(match[3]),
      key: `${match[1]}-${Number(match[2])}.${Number(match[3])}`
    };
  }

  function resolveDependencies(h5pJson, inventory) {
    const required = new Map();
    const queue = readDependencies(h5pJson);
    for (const dep of queue) required.set(dependencyKey(dep), dep);

    const visited = new Set();
    while (queue.length) {
      const dep = queue.shift();
      const key = dependencyKey(dep);
      if (visited.has(key)) continue;
      visited.add(key);
      const lib = inventory.get(key);
      if (!lib) continue;
      for (const child of lib.dependencies) {
        const childKey = dependencyKey(child);
        if (!required.has(childKey)) required.set(childKey, child);
        queue.push(child);
      }
    }

    const missing = [...required.entries()]
      .filter(([key]) => !inventory.has(key))
      .map(([key, dep]) => ({ key, ...dep }));

    return { required, missing };
  }

  const api = Object.freeze({ dependencyKey, readDependencies, parseLibraryReference, resolveDependencies });
  const modules = root.H5PConverterModules || (root.H5PConverterModules = {});
  modules.dependencies = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(globalThis);
