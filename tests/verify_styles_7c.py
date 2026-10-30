from pathlib import Path
import hashlib
root=Path(__file__).resolve().parents[1]
styles=(root/'styles.css').read_text(encoding='utf-8')
# Historic 7c CSS is still an exact prefix: the 8.5b UI adds a self-contained
# SCORM Studio design-system layer AFTER it, without changing preview/fullscreen rules.
marker='\n\n/* UI 8.5b : design system SCORM Studio v6 et parcours validé */\n'
assert marker in styles,'Nouvelle couche de theme absente'
old,new=styles.split(marker,1)
# Frozen SHA-256 of the original 8.4b CSS (after the two authorized 7c adjustments).
EXPECTED='ab0c35c366235d82ee18a5f6688183d9e79687e193502a61e719541c5ab490fa'
assert hashlib.sha256(old.encode()).hexdigest()==EXPECTED,'Régression dans les règles CSS historiques'
assert '--accent:#75e0ca' in new and '--accent:#087e70' in new,'Tokens de la charte manquants'
assert 'preview-viewport:fullscreen' in old and 'preview-viewport.preview-is-expanded' in old,'Plein écran H5P manquant'
print('Socle CSS historique protégé ; couche UI 8.5b autorisée : OK')
