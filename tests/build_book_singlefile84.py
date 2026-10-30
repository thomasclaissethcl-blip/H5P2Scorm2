#!/usr/bin/env python3
"""Crée un conteneur temporaire pour vérifier un vrai Interactive Book en monofichier.
Source: ZIP SCORM déjà fourni, exclusivement ses fichiers H5P et le lecteur, sans pont SCORM.
Fichier de test externe au dépôt, à usage de qualification.
"""
from pathlib import Path
import zipfile, json,base64,sys
source=Path(sys.argv[1]); destination=Path(sys.argv[2]);
records={}
with zipfile.ZipFile(source) as z:
    for entry in z.infolist():
        path=entry.filename
        if entry.is_dir() or not path.startswith(('h5p/','player/','custom/')): continue
        if path in records: raise ValueError(f'Doublon : {path}')
        data=z.read(entry)
        import mimetypes
        mime=mimetypes.guess_type(path)[0] or 'application/octet-stream'
        records[path]={'size':len(data),'mime':mime,'base64':base64.b64encode(data).decode('ascii')}
total=sum(v['size'] for v in records.values())
assert total<32*1024*1024, f'Dépassement limite: {total}'
assert all(k in records for k in ('h5p/h5p.json','h5p/content/content.json','player/main.bundle.js','player/frame.bundle.js','player/styles/h5p.css'))
main=json.loads(base64.b64decode(records['h5p/h5p.json']['base64']))
assert str(main['mainLibrary']).startswith('H5P.InteractiveBook')
result={'schemaVersion':1,'kind':'resource-container-only','records':records,'fileCount':len(records),'totalBytes':total}
destination.write_text(json.dumps(result,ensure_ascii=False,separators=(',',':')),encoding='utf8')
print(f'Livre: {len(records)} fichiers, {total} octets, principal {main["mainLibrary"]}',flush=True)
