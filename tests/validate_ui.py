from pathlib import Path
from html.parser import HTMLParser
import json

ROOT = Path(__file__).resolve().parents[1]
html = (ROOT / 'index.html').read_text(encoding='utf-8')
app = (ROOT / 'app.js').read_text(encoding='utf-8')
runtime_profile = json.loads((ROOT / 'RUNTIME_PROFILE.json').read_text(encoding='utf-8'))
manifest_text = (ROOT / 'MAINTENANCE_MANIFEST.md').read_text(encoding='utf-8')

class Collector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.help_count = 0
        self.help_with_text = 0
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if 'id' in d:
            self.ids.add(d['id'])
        classes = set((d.get('class') or '').split())
        if tag == 'button' and 'help' in classes:
            self.help_count += 1
            if d.get('data-help') and d.get('aria-label'):
                self.help_with_text += 1

parser = Collector()
parser.feed(html)
required = {
    'h5pDropZone', 'h5pFile', 'cssFile', 'cssText', 'courseTitle', 'languageOverride',
    'statusPolicy', 'masteryScore', 'saveFreq', 'resumeProfile', 'markIncomplete',
    'enableResume', 'showRuntimeWarnings', 'diagnostic', 'generationProgress', 'generateBtn'
}
missing = required - parser.ids
assert not missing, f'IDs UI manquants: {sorted(missing)}'
assert parser.help_count >= 15, f'Nombre de bulles d aide insuffisant: {parser.help_count}'
assert parser.help_count == parser.help_with_text, 'Une bulle d aide ne contient pas data-help/aria-label'
assert html.index('src/player-assets.js') < html.index('src="app.js"'), 'Le manifeste doit précéder app.js'
assert html.index('src/portable-package.js') < html.index('src="app.js"'), 'La copie portable doit précéder app.js'
assert 'debugResume' not in html and 'debugResume' not in app, 'Ancien diagnostic visuel de reprise encore présent'
assert "const APP_VERSION = '1.0.1'" in app, 'Version applicative incorrecte'
assert 'MOODLE_EXTENDED_SUSPEND_DATA_LIMIT = 64000' in app, 'Profil Moodle 64K absent'
assert 'H5P_CORE_API_SUPPORTED = runtimeProfile.supportedCoreApi' in app, 'Plafond Core API non issu du profil'
assert 'incompatibleCoreApi' in (ROOT / 'src/h5p-analysis.js').read_text(encoding='utf-8'), 'Contrôle Core API absent du module d’analyse'
assert runtime_profile['applicationVersion'] == '1.0.1', 'RUNTIME_PROFILE version incohérente'
assert runtime_profile['player']['version'] == '3.8.2', 'RUNTIME_PROFILE lecteur incohérent'
assert runtime_profile['h5pCoreApi']['declaredCompatibilityCeiling'] == {'majorVersion': 1, 'minorVersion': 28}, 'RUNTIME_PROFILE Core API incohérente'
assert 'Instruction de prise de relais pour une autre instance de ChatGPT' in manifest_text, 'Protocole de reprise ChatGPT absent'
assert 'Ne jamais utiliser `@latest`' in manifest_text, 'Règle de dépendance figée absente'
assert "SCORM12.set('cmi.core.score.max',100)" in app, 'Normalisation du score absente'
print('Interface V1 : OK')
