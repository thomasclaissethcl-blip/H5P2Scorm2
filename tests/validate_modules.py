#!/usr/bin/env python3
"""Compare the new H5P analysis with the exact upstream V1.0.1 on ZIP fixtures.

No npm install nor network needed. The in-memory FakeZip exposed to both analyzers
mirrors the JSZip methods consumed by the original analyzer.
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def build_fixture(zip_path: Path) -> dict:
    with zipfile.ZipFile(zip_path) as zf:
        files = {}
        for info in zf.infolist():
            data = zf.read(info) if not info.is_dir() else b""
            is_text = info.filename.endswith('.json')
            files[info.filename] = {
                'size': info.file_size,
                'dir': info.is_dir(),
                'text': data.decode('utf-8') if is_text else None,
            }
    return files


def main():
    node = shutil.which('node')
    if not node:
        print('Node.js introuvable')
        return 1
    source_zip = ROOT / 'baseline/H5P2SCorm-main-v1.0.1.zip'
    with zipfile.ZipFile(source_zip) as zf:
        old_app = zf.read('H5P2SCorm-main/app.js').decode('utf-8')
    fixtures = {p.name: build_fixture(p) for p in sorted((ROOT / 'test-fixtures').glob('*.h5p'))}
    payload = json.dumps({'baselineApp': old_app, 'fixtures': fixtures}, ensure_ascii=False)
    proc = subprocess.run([node, 'tests/module-analysis-regression.mjs'], cwd=ROOT,
                          input=payload, text=True, capture_output=True, check=False, timeout=60)
    print(proc.stdout, end='')
    print(proc.stderr, end='', file=sys.stderr)
    return proc.returncode


if __name__ == '__main__':
    raise SystemExit(main())
