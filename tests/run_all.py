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
        ("plan-sous-scores", [node, "tests/scorm-score-plan.mjs"] if node else None),
        ("agregation-reprise", [node, "tests/scorm-aggregation52.mjs"] if node else None),
        ("plan-h5p-imbriques", [node, "tests/scorm-score-plan-nested.mjs"] if node else None),
        ("agregation-imbriquee", [node, "tests/scorm-aggregation-nested.mjs"] if node else None),
        ("syntaxe-plan-scores", [node, "--check", "src/scorm-score-plan.js"] if node else None),
        ("scorm-scoring", [node, "tests/scorm-scoring.mjs"] if node else None),
        ("runtime-agregation-et-reprise", [node, "tests/scorm-runtime-aggregate52.mjs"] if node else None),
        ("runtime-question-set-imbrique", [node, "tests/scorm-runtime-nested52b.mjs"] if node else None),
        ("preuve-secours-scorm53", [node, "tests/scorm-fallback53.mjs"] if node else None),
        ("runtime-scorm-scoring", [node, "tests/scorm-runtime-scoring.mjs"] if node else None),
        ("runtime-scorm", [node, "tests/runtime-smoke.mjs"] if node else None),
        ("catalogue-moteurs", [node, "tests/engine-catalog.mjs"] if node else None),
        ("qualification-manuelle", [node, "tests/engine-qualification.mjs"] if node else None),
        ("essais-moteurs", [node, "tests/engine-trials.mjs"] if node else None),
        ("module-visionneuse", [node, "tests/preview-module.mjs"] if node else None),
        ("youtube-consentement", [node, "tests/youtube-preview.mjs"] if node else None),
        ("syntaxe-visionneuse", [node, "--check", "src/h5p-preview.js"] if node else None),
        ("syntaxe-frame-isole", [node, "--check", "src/preview-frame.js"] if node else None),
        ("syntaxe-dependances-h5p", [node, "--check", "src/h5p-dependencies.js"] if node else None),
        ("syntaxe-modules-h5p", [node, "--check", "src/h5p-analysis.js"] if node else None),
        ("syntaxe-scoring", [node, "--check", "src/scorm-scoring.js"] if node else None),
        ("syntaxe-qualification-moteurs", [node, "--check", "src/engine-qualification.js"] if node else None),
        ("syntaxe-catalogue-moteurs", [node, "--check", "src/engine-catalog.js"] if node else None),
        ("syntaxe-profils-h5p", [node, "--check", "src/runtime-profiles.js"] if node else None),
        ("syntaxe-javascript", [node, "--check", "app.js"] if node else None),
        ("ressources-lecteur-partagees", [node, "tests/player-assets6.mjs"] if node else None),
        ("copie-h5p-portable", [node, "tests/portable-package6.mjs"] if node else None),
        ("protection-composants-lot53", [sys.executable, "tests/verify_lot53_nonregression.py"]),
        ("css-grille-7c-delta-autorise", [sys.executable, "tests/verify_styles_7c.py"]),
        ("parametres-css-export-7b", [node, "tests/export-layout7b.mjs"] if node else None),
        ("quatre-marges-independantes-7c", [node, "tests/export-layout7c.mjs"] if node else None),
        ("marges-responsive-7d", [node, "tests/export-layout7d.mjs"] if node else None),
        ("conteneur-ressources-8-2", [node, "tests/html-singlefile-resources82.mjs"] if node else None),
        ("prototype-interactif-monofichier-8-3", [node, "tests/html-singlefile-player83.mjs"] if node else None),
        ("medias-images-monofichier-8-3b", [node, "tests/html-singlefile-media83b.mjs"] if node else None),
        ("youtube-referrer-monofichier-8-3c", [node, "tests/html-singlefile-youtube83c.mjs"] if node else None),
        ("progression-collecteur-monofichier-8-4b", [node, "tests/resource-collector-progress85.mjs"] if node else None),
        ("nettoyage-interface-et-modules-8-4b", [node, "tests/ui-cleanup85.mjs"] if node else None),
        ("qualification-statique-interactive-video-8-4b", [node, "tests/interactive-video-static85.mjs"] if node else None),
        ("experience-apprenant-et-journal-8-4a", [node, "tests/html-singlefile-clean84.mjs"] if node else None),
        ("syntaxe-lecteur-monofichier-8-3", [node, "--check", "src/html-singlefile-player.js"] if node else None),
        ("syntaxe-conteneur-ressources-8-2", [node, "--check", "src/html-singlefile-resources.js"] if node else None),
        ("syntaxe-module-presentation", [node, "--check", "src/export-layout.js"] if node else None),
        ("lanceur-html-multifichier", [node, "tests/html-multifile7.mjs"] if node else None),
        ("syntaxe-module-html", [node, "--check", "src/html-multifile.js"] if node else None),
        ("ui-generation-et-apercu-85c", [node, "tests/ui85c_contract.mjs"] if node else None),
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
        "scope": "Lot 8.4b : nettoyage des parcours obsolètes et qualification monofichier composite",
        "python": platform.python_version(),
        "node": None,
        "summary": {"passed": success, "failed": len(results) - success, "total": len(results)},
        "results": results,
        "limitations": [
            "Tests principalement unitaires et structurels, pas de validation de lecture H5P dans un vrai navigateur.",
            "Aucune exécution du SCORM dans Moodle ou dans un autre LMS.",
            "Visionneuse expérimentale : tests navigateur avec substitut, aucun vrai H5P Standalone ni contenu H5P complexe validé dans cet environnement.",
            "Le HTML multifichier nécessite une recette HTTP(S) et Moodle dans des environnements réels, selon leurs règles de sécurité.",
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
