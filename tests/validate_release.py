from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]

version = (ROOT / 'VERSION').read_text(encoding='utf-8').strip()
app = (ROOT / 'app.js').read_text(encoding='utf-8')
html = (ROOT / 'index.html').read_text(encoding='utf-8')
readme = (ROOT / 'README.md').read_text(encoding='utf-8')
profile = json.loads((ROOT / 'RUNTIME_PROFILE.json').read_text(encoding='utf-8'))

assert version == '1.0.1', f'VERSION inattendue: {version}'
assert f"const APP_VERSION = '{version}'" in app, 'APP_VERSION incohérente avec VERSION'
assert f'Version {version}' in html, 'Version visible de l interface incohérente'
assert readme.startswith(f'# H5P vers SCORM 1.2 - version {version}'), 'README version incohérente'
assert profile['applicationVersion'] == version, 'RUNTIME_PROFILE version incohérente'

profiles_js = (ROOT / 'src/runtime-profiles.js').read_text(encoding='utf-8')
analysis_js = (ROOT / 'src/h5p-analysis.js').read_text(encoding='utf-8')
player_match = re.search(r"playerVersion: '([^']+)'", profiles_js)
assert player_match, 'Version du lecteur introuvable dans le catalogue'
player_version = player_match.group(1)
assert profile['player']['version'] == player_version, 'Version du lecteur incohérente'
assert f'h5p-standalone@${{PLAYER_VERSION}}' in app, 'URL lecteur non liée au profil figé'
core_match = re.search(r'supportedCoreApi: Object\.freeze\(\{ majorVersion: (\d+), minorVersion: (\d+) \}\)', profiles_js)
assert core_match, 'Plafond Core API absent du catalogue'
core = {'majorVersion': int(core_match.group(1)), 'minorVersion': int(core_match.group(2))}
assert profile['h5pCoreApi']['declaredCompatibilityCeiling'] == core, 'Plafond Core API incohérent'
assert f"id: '{profile['runtimeProfileId']}'" in profiles_js, 'ID du profil différent du RUNTIME_PROFILE.json'
assert 'const runtimeProfile = modules.compatibility.defaultProfile;' in app, 'Profil non partagé avec app.js'
assert 'modules.analysis.analyzeH5P(zip' in app, 'Analyseur modulaire non utilisé'
assert 'assessCoreApi' in analysis_js and 'assessCoreApi' in profiles_js, 'Diagnostic Core API non raccordé'
assert html.index('src/runtime-profiles.js') < html.index('src/engine-catalog.js') < html.index('src/h5p-dependencies.js') < html.index('src/h5p-analysis.js') < html.index('src="app.js"'), 'Ordre de chargement invalide'

for required in [
    'MAINTENANCE_MANIFEST.md', 'RUNTIME_PROFILE.json', 'COMPATIBILITY.md', 'MOODLE.md',
    'CHANGELOG.md', 'THIRD_PARTY_NOTICES.md'
]:
    assert (ROOT / required).is_file(), f'Fichier de release manquant: {required}'

assert '@latest' not in app + profiles_js + analysis_js, 'Les modules ne doivent pas dépendre de @latest'
assert '@latest' not in html, 'index.html ne doit pas dépendre de @latest'

print(f'Release {version} cohérente : OK')
