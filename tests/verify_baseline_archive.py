#!/usr/bin/env python3
"""Check that the exact upstream snapshot is kept for audit and rollback.

This does NOT enforce that the future development files stay identical to V1.
"""
from pathlib import Path
import hashlib
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "baseline/H5P2SCorm-main-v1.0.1.zip"
EXPECTED_SHA256 = "eb40096d4bd5b977f1bec6efd8dd4f2ae14fe27345811bd51a22e0269aa7e1b2"

assert SOURCE.is_file(), "Archive de provenance manquante"
actual = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
assert actual == EXPECTED_SHA256, f"Archive modifiée ou corrompue : {actual}"
with zipfile.ZipFile(SOURCE) as zf:
    bad = zf.testzip()
    assert bad is None, f"Archive de référence endommagée : {bad}"
    names = set(zf.namelist())
    for file in ["VERSION", "app.js", "index.html", "styles.css", "RUNTIME_PROFILE.json", "tests/runtime-smoke.mjs"]:
        assert "H5P2SCorm-main/" + file in names, f"Fichier V1 absent : {file}"
print("Archive originale V1.0.1 et SHA-256 : OK")
