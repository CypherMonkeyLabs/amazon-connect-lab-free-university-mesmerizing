#!/usr/bin/env python3
"""Check THIRD_PARTY_MANIFEST.json hashes and notices.

  python3 scripts/licence_manifest.py
  python3 scripts/licence_manifest.py --write
"""
import hashlib
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
MAN = ROOT / "THIRD_PARTY_MANIFEST.json"
SCAN = ["web/vendor", "campus/vendor"]

COMPONENTS = [
    {
        "name": "Three.js",
        "version": "r170",
        "licence": "MIT",
        "url": "https://github.com/mrdoob/three.js/releases/tag/r170",
        "licence_file": "NOTICE.md",
        "match": ("three.module.min.js", "OrbitControls.js", "EffectComposer.js", "MaskPass.js", "Pass.js", "RenderPass.js", "ShaderPass.js", "UnrealBloomPass.js", "CopyShader.js", "LuminosityHighPassShader.js"),
    },
    {
        "name": "anime.js",
        "version": "4.2.2",
        "licence": "MIT",
        "url": "https://github.com/juliangarnier/anime",
        "licence_file": "web/vendor/LICENSE-anime.md",
        "match": ("anime.esm.min.js", "LICENSE-anime.md"),
    },
    {
        "name": "D3",
        "version": "7.9.0",
        "licence": "ISC",
        "url": "https://github.com/d3/d3",
        "licence_file": "web/vendor/LICENSE-d3",
        "match": ("d3.min.js", "d3.entry.js", "LICENSE-d3"),
    },
    {
        "name": "Rough.js",
        "version": "unconfirmed",
        "licence": "MIT",
        "url": "https://github.com/rough-stuff/rough",
        "licence_file": "web/vendor/LICENSE-rough.js",
        "match": ("rough.esm.js", "LICENSE-rough.js"),
    },
    {
        "name": "canvas-confetti",
        "version": "1.9.4",
        "licence": "ISC",
        "url": "https://github.com/catdad/canvas-confetti",
        "licence_file": "web/vendor/LICENSE-canvas-confetti",
        "match": ("confetti.module.mjs", "LICENSE-canvas-confetti"),
    },
]


def sha(path):
    digest = hashlib.sha256()
    digest.update(path.read_bytes())
    return digest.hexdigest()


def build():
    files = []
    for folder in SCAN:
        for path in sorted((ROOT / folder).rglob("*")):
            if path.is_file():
                files.append(path.relative_to(ROOT).as_posix())
    components = []
    claimed = set()
    for spec in COMPONENTS:
        group = []
        for rel in files:
            name = pathlib.PurePosixPath(rel).name
            if name in spec["match"]:
                group.append({"path": rel, "sha256": sha(ROOT / rel)})
                claimed.add(rel)
        components.append({
            "name": spec["name"],
            "version": spec["version"],
            "licence": spec["licence"],
            "url": spec["url"],
            "licence_file": spec["licence_file"],
            "files": group,
        })
    missing = [rel for rel in files if rel not in claimed]
    if missing:
        raise SystemExit("unclaimed vendored files: " + ", ".join(missing))
    MAN.write_text(json.dumps({"components": components}, indent=2) + "\n")
    print("wrote", MAN, "files", len(files))


def main():
    if "--write" in sys.argv:
        build()
        return 0
    data = json.loads(MAN.read_text())
    listed = {item["path"]: item for comp in data["components"] for item in comp["files"]}
    problems = []
    for path, item in listed.items():
        file = ROOT / path
        if not file.is_file():
            problems.append(f"listed but missing: {path}")
        elif sha(file) != item["sha256"]:
            problems.append(f"hash mismatch: {path}")
    for folder in SCAN:
        for path in sorted((ROOT / folder).rglob("*")):
            if path.is_file() and path.relative_to(ROOT).as_posix() not in listed:
                problems.append(f"vendored file not in manifest: {path.relative_to(ROOT)}")
    for comp in data["components"]:
        for key in ("name", "version", "licence", "url", "licence_file"):
            if not comp.get(key):
                problems.append(f"{comp.get('name')}: missing {key}")
        licence = comp.get("licence_file") or ""
        if licence and not licence.startswith("(") and not (ROOT / licence).is_file():
            problems.append(f"{comp['name']}: licence file missing {licence}")
        if str(comp.get("version")) == "unconfirmed":
            print("UNCONFIRMED version:", comp["name"])
    notices = (ROOT / "THIRD_PARTY_NOTICES.md").read_text()
    if re.search(r"\bverify\b", notices, re.I):
        problems.append("THIRD_PARTY_NOTICES.md still contains an unresolved check word")
    for problem in problems:
        print("FAIL", problem)
    print("manifest:", len(listed), "files,", len(data["components"]), "components,", len(problems), "problems")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
