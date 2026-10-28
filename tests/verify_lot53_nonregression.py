#!/usr/bin/env python3
"""Vérifie les composants non concernés par le lot 6.1, sur le gel 5.3."""
from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'tests/fixtures/lot53-protected-components.json').read_text())
sha=lambda data:hashlib.sha256(data).hexdigest()
for path,digest in manifest['protectedFiles'].items():
    assert sha((root/path).read_bytes())==digest,f'Régression du composant validé : {path}'
app=(root/'app.js').read_text()
block=manifest['protectedScormFunctionBlock']
text=app[app.index(block['start']):app.index(block['end'])]
assert sha(text.encode())==block['sha256'],'Le pont SCORM 5.3 a changé sans requalification.'
print('Lot 6.1 : fichiers fonctionnels protégés et fonctions SCORM identiques au lot 5.3 : OK')
