#!/usr/bin/env python3
"""Run V1 regression checks without installing dependencies.

Usage:
    python tests/run_all.py
    python tests/run_all.py --report artifacts/test-report.json

No assertions about future modules are made here; new modules get their own tests.
"""

from __future__ import annotations

import argparse
import json
import platform
from pathlib import Path
import shutil
import subprocess
import sys
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    parser = argparse.ArgumentParser(description="Contrôles de non-régression H5P Converter")
    parser.add_argument("--report", metavar="FICHIER", help="Rapport JSON (chemin relatif à la racine du projet ou absolu)")
    args = parser.parse_args()

    node = shutil.which("node")
    suites = [
        ("fixtures-h5p", [sys.executable, "tests/validate_fixtures.py"]),
        ("coherence-release", [sys.executable, "tests/validate_release.py"]),
        ("structure-interface", [sys.executable, "tests/validate_ui.py"]),
        ("modules-analyse-parite", [sys.executable, "tests/validate_modules.py"]),
        ("runtime-scorm", [node, "tests/runtime-smoke.mjs"] if node else None),
        ("module-visionneuse", [node, "tests/preview-module.mjs"] if node else None),
        ("youtube-consentement", [node, "tests/youtube-preview.mjs"] if node else None),
        ("syntaxe-visionneuse", [node, "--check", "src/h5p-preview.js"] if node else None),
        ("syntaxe-frame-isole", [node, "--check", "src/preview-frame.js"] if node else None),
        ("syntaxe-dependances-h5p", [node, "--check", "src/h5p-dependencies.js"] if node else None),
        ("syntaxe-modules-h5p", [node, "--check", "src/h5p-analysis.js"] if node else None),
        ("syntaxe-profils-h5p", [node, "--check", "src/runtime-profiles.js"] if node else None),
        ("syntaxe-javascript", [node, "--check", "app.js"] if node else None),
        ("archive-source", [sys.executable, "tests/verify_baseline_archive.py"]),
    ]
    results = []
    for name, cmd in suites:
        print(f"\n== {name} ==", flush=True)
        if cmd is None:
            result = {"test": name, "status": "failure", "return_code": None, "output": "Node.js introuvable"}
        else:
            try:
                run = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, check=False, timeout=120)
                result = {
                    "test": name,
                    "status": "success" if run.returncode == 0 else "failure",
                    "return_code": run.returncode,
                    "output": (run.stdout + run.stderr).strip(),
                }
            except (OSError, subprocess.TimeoutExpired) as exc:
                result = {"test": name, "status": "failure", "return_code": None, "output": str(exc)}
        print(result["output"] or "OK (aucune sortie)", flush=True)
        print("RÉSULTAT :", result["status"].upper(), flush=True)
        results.append(result)

    success = sum(entry["status"] == "success" for entry in results)
    report = {
        "schema_version": 1,
        "date_utc": datetime.now(timezone.utc).isoformat(),
        "scope": "Lot 3 : socle V1.0.1, modules lot 2, prototype de visionneuse, isolation, cache et contrôle SCORM",
        "python": platform.python_version(),
        "node": None,
        "summary": {"passed": success, "failed": len(results) - success, "total": len(results)},
        "results": results,
        "limitations": [
            "Tests principalement unitaires et structurels, pas de validation de lecture H5P dans un vrai navigateur.",
            "Aucune exécution du SCORM dans Moodle ou dans un autre LMS.",
            "Visionneuse expérimentale : tests navigateur avec substitut, aucun vrai H5P Standalone ni contenu H5P complexe validé dans cet environnement.",
            "Les exports HTML futurs ne sont pas encore développés.",
        ],
    }
    if node:
        p = subprocess.run([node, "--version"], capture_output=True, text=True, check=False)
        report["node"] = p.stdout.strip()
    if args.report:
        destination = Path(args.report)
        if not destination.is_absolute():
            destination = ROOT / destination
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print("Rapport :", destination, flush=True)

    print(f"\nBILAN : {success}/{len(results)} vérifications réussies", flush=True)
    return 0 if success == len(results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
