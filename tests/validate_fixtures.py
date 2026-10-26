from pathlib import Path
import json
import zipfile

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "test-fixtures"
SUPPORTED_CORE_API = (1, 28)


def read_json(zf, path):
    return json.loads(zf.read(path).decode("utf-8"))


def dep_key(dep):
    return f"{dep['machineName']}-{int(dep['majorVersion'])}.{int(dep['minorVersion'])}"


def analyze(path):
    result = {"errors": [], "missing": [], "core_api_incompatible": []}
    with zipfile.ZipFile(path) as zf:
        names = set(zf.namelist())
        if "h5p.json" not in names:
            result["errors"].append("h5p.json absent")
            return result
        if "content/content.json" not in names:
            result["errors"].append("content/content.json absent")
            return result
        h5p = read_json(zf, "h5p.json")
        inventory = {}
        for name in names:
            if not name.endswith("/library.json"):
                continue
            lib = read_json(zf, name)
            key = f"{lib['machineName']}-{int(lib['majorVersion'])}.{int(lib['minorVersion'])}"
            inventory[key] = lib
        required = {}
        queue = list(h5p.get("preloadedDependencies") or []) + list(h5p.get("dynamicDependencies") or [])
        while queue:
            dep = queue.pop(0)
            key = dep_key(dep)
            if key in required:
                continue
            required[key] = dep
            lib = inventory.get(key)
            if lib:
                queue.extend(lib.get("preloadedDependencies") or [])
                queue.extend(lib.get("dynamicDependencies") or [])
        result["missing"] = sorted(key for key in required if key not in inventory)
        if result["missing"]:
            result["errors"].append("dépendances manquantes")
        for key in required:
            lib = inventory.get(key)
            if not lib or not lib.get("coreApi"):
                continue
            core = lib["coreApi"]
            try:
                req = (int(core["majorVersion"]), int(core["minorVersion"]))
            except (KeyError, TypeError, ValueError):
                result["errors"].append("coreApi invalide")
                continue
            if req > SUPPORTED_CORE_API:
                result["core_api_incompatible"].append((key, req))
        if result["core_api_incompatible"]:
            result["errors"].append("coreApi incompatible")
        main = h5p.get("mainLibrary")
        if main and not any(key.startswith(main + "-") for key in inventory):
            result["errors"].append("bibliothèque principale absente")
    return result


def main():
    expected_ok = ["poc-valid.h5p", "poc-language.h5p", "poc-resume.h5p"]
    for name in expected_ok:
        result = analyze(FIXTURES / name)
        assert not result["errors"], f"{name}: {result}"
        print(f"OK {name}")

    missing = analyze(FIXTURES / "poc-missing-dependency.h5p")
    assert "H5P.DoesNotExist-1.0" in missing["missing"], missing
    print("OK poc-missing-dependency.h5p")

    invalid = analyze(FIXTURES / "poc-invalid.h5p")
    assert "h5p.json absent" in invalid["errors"], invalid
    print("OK poc-invalid.h5p")

    future = analyze(FIXTURES / "poc-coreapi-future.h5p")
    assert "coreApi incompatible" in future["errors"], future
    assert future["core_api_incompatible"][0][1] == (1, 29), future
    print("OK poc-coreapi-future.h5p (blocage Core API attendu)")


if __name__ == "__main__":
    main()
