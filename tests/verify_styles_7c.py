#!/usr/bin/env python3
"""Autorise uniquement deux ajouts de grille pour afficher les quatre champs 7c."""
from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parents[1]
reference=(root/'tests/fixtures/styles-lot7b.css').read_bytes()
manifest=json.loads((root/'tests/fixtures/lot53-protected-components.json').read_text())
assert hashlib.sha256(reference).hexdigest()==manifest['protectedFiles']['styles.css'],'La référence 7b n est pas celle du gel 5.3'
source=reference.decode('utf-8')
old='.grid.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }'
assert source.count(old)==1
source=source.replace(old,old+'\n.grid.four { grid-template-columns: repeat(4, minmax(0, 1fr)); }')
old='.grid.two, .grid.three { grid-template-columns: 1fr; }'
assert source.count(old)==1
source=source.replace(old,'.grid.two, .grid.three, .grid.four { grid-template-columns: 1fr; }')
assert (root/'styles.css').read_text(encoding='utf-8')==source,'Régression CSS : styles.css diffère des deux ajouts 7c strictement autorisés'
print('Lot 7c : styles.css = référence 5.3/7b + deux seuls changements de grille contrôlés')
