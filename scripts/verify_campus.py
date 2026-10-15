#!/usr/bin/env python3
"""Count modular campus content and reject network dependencies."""
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CAMPUS = ROOT / "campus"

FORBIDDEN = [
    "cdn.jsdelivr.net",
    "unpkg.com",
    "cdnjs.cloudflare.com",
    "fonts.googleapis.com",
    "fonts.gstatic.com",
    "ajax.googleapis.com",
    "code.jquery.com",
    "googletagmanager.com",
    "google-analytics.com",
    "connect.facebook.net",
    "static.hotjar.com",
]


def load_json(path):
    return json.loads(path.read_text())


def main():
    problems = []
    html_path = CAMPUS / "index.html"
    if not html_path.exists():
        raise SystemExit("campus/index.html missing")
    for stale in (ROOT / "amazon-connect-lab.html", CAMPUS / "amazon-connect-lab.html"):
        if stale.exists():
            problems.append("duplicate entry still present: " + str(stale.relative_to(ROOT)))
    html = html_path.read_text()
    if html.count("<h1") != 1:
        problems.append("expected one h1, found %s" % html.count("<h1"))
    if "<link rel=\"stylesheet\" href=\"campus.css\">" not in html:
        problems.append("stylesheet is not in the head")
    if "three.module.min.js" not in html:
        problems.append("three import map missing")
    shell = load_json(CAMPUS / "data" / "shell.json")
    lessons = []
    figures = []
    flows = []
    for track in shell["tracks"]:
        pack = load_json(CAMPUS / "data" / "tracks" / (track["id"] + ".json"))
        lessons.extend(pack["lessons"])
        for lesson in pack["lessons"]:
            figures.extend(lesson.get("figures") or [])
            flows.extend(lesson.get("animated") or [])
    glossary = load_json(CAMPUS / "data" / "glossary.json")["terms"]
    for term in glossary:
        if term.get("mark"):
            figures.append(term["mark"])
    charts = load_json(CAMPUS / "data" / "charts.json")["charts"]
    for chart in charts:
        figures.append({"id": chart["figure"], "svg": chart["svg"], "caption": chart["caption"]})
    reference = load_json(CAMPUS / "data" / "reference.json")
    for fault in reference["faults"]:
        figures.append(fault["figure"])
        flows.append(fault["animated"])
    figures.extend(reference.get("blockFigures") or [])
    quiz = load_json(CAMPUS / "data" / "quiz.json")["questions"]
    cards = load_json(CAMPUS / "data" / "cards.json")["cards"]
    audio = load_json(CAMPUS / "data" / "audio.json")["clips"]
    counts = {
        "tracks": len(shell["tracks"]),
        "lessons": len(lessons),
        "labs": len(shell["labs"]),
        "quiz": len(quiz),
        "cards": len(cards),
        "scenarios": len(reference["scenarios"]),
        "glossary": len(glossary),
        "illustrations": len(figures),
        "animatedFlows": len(flows),
        "charts": len(charts),
        "audio": len(audio),
        "faults": len(reference["faults"]),
    }
    floors = {
        "tracks": 14, "lessons": 120, "labs": 20, "quiz": 300, "cards": 300,
        "scenarios": 20, "glossary": 40, "illustrations": 1500, "animatedFlows": 300,
        "charts": 20, "audio": 25, "faults": 30,
    }
    for key, floor in floors.items():
        if counts[key] < floor:
            problems.append(f"{key} has {counts[key]}, need {floor}")
        if shell["counts"][key] != counts[key]:
            problems.append(f"shell count {key} is {shell['counts'][key]} but files have {counts[key]}")
    ill_hashes = {}
    for item in figures:
        digest = hashlib.sha256(item["svg"].encode()).hexdigest()
        if digest in ill_hashes:
            problems.append("duplicate illustration " + item["id"])
            break
        ill_hashes[digest] = item["id"]
        if "<svg" not in item["svg"]:
            problems.append("illustration is not svg " + item["id"])
            break
    flow_hashes = {}
    kinds = set()
    for item in flows:
        digest = hashlib.sha256(item["svg"].encode()).hexdigest()
        if digest in flow_hashes:
            problems.append("duplicate animated flow " + item["id"])
            break
        flow_hashes[digest] = item["id"]
        if "animateMotion" not in item["svg"]:
            problems.append("flow missing animation " + item["id"])
            break
        kinds.add(item.get("kind"))
    for kind in ("call-path", "event-stream", "lambda-roundtrip", "routing-decision"):
        if kind not in kinds:
            problems.append("missing flow kind " + kind)
    for lesson in lessons:
        if len(lesson.get("figures") or []) < 3:
            problems.append("lesson needs 3 figures: " + lesson.get("id", "?"))
            break
        if len(lesson.get("animated") or []) < 1:
            problems.append("lesson needs an animated flow: " + lesson.get("id", "?"))
            break
        if not lesson.get("try"):
            problems.append("lesson needs Try it: " + lesson.get("id", "?"))
            break
        if not lesson.get("why") or not lesson.get("cite", {}).get("url"):
            problems.append("lesson missing why or cite: " + lesson.get("id", "?"))
        if not lesson.get("diagram") or not lesson.get("flow"):
            problems.append("lesson missing diagram or flow: " + lesson.get("id", "?"))
    for fault in reference["faults"]:
        for field in ("symptom", "cause", "fix", "url", "source"):
            if not fault.get(field):
                problems.append("fault missing " + field)
                break
    app = (CAMPUS / "app.js").read_text()
    if "confetti" not in app or "Try it" not in app:
        problems.append("missing confetti or Try it control")
    if "clearInterval" not in app or "haltTimers" not in app:
        problems.append("timer cleanup missing")
    tracks = {t["id"] for t in shell["tracks"]}
    for required in ("foundations", "bridge", "ecosystem"):
        if required not in tracks:
            problems.append("missing track " + required)
    if set(shell.get("iac") or {}) != tracks:
        problems.append("IaC snippet missing for a track")
    tips = load_json(CAMPUS / "data" / "tips.json")["tracks"]
    if set(tips) != tracks:
        problems.append("tips missing for a track")
    for track_id, pack in tips.items():
        if len(pack.get("tips") or []) < 3 or len(pack.get("traps") or []) < 3 or len(pack.get("sheet") or []) < 4:
            problems.append("thin cheat sheet " + track_id)
            break
        if not pack.get("url") or not pack.get("source"):
            problems.append("tips missing source " + track_id)
            break
    hero_js = (CAMPUS / "hero.js").read_text()
    if "bootHero" not in app or "mountHero" not in hero_js:
        problems.append("3D hero must start on the home view")
    if "UnrealBloomPass" not in hero_js or not (CAMPUS / "vendor" / "postprocessing" / "UnrealBloomPass.js").exists():
        problems.append("vendored UnrealBloomPass missing from the hero")
    if "svgPortrait" not in (CAMPUS / "data" / "atlas.json").read_text():
        problems.append("portrait diagrams missing")
    if "lessonHeading" not in app or not (CAMPUS / "lesson-titles.js").exists():
        problems.append("lesson heading translations missing")
    bodies = (CAMPUS / "lesson-bodies.js").read_text() if (CAMPUS / "lesson-bodies.js").exists() else ""
    if "lessonBody" not in app or "foundations-why" not in bodies or "eco-why" not in bodies:
        problems.append("opening lesson body translations missing")
    if 'data-layout=\\"portrait\\"' not in (CAMPUS / "data" / "atlas.json").read_text() and 'data-layout="portrait"' not in (CAMPUS / "data" / "atlas.json").read_text():
        problems.append("portrait diagrams are not marked as designed layouts")
    if "us-east-1" not in hero_js:
        problems.append("hero is missing AWS region nodes")
    if 'route.view === "map"' not in app:
        problems.append("3D map still needs its own boot")
    if 'id="lang"' not in html or 'id="lightbox"' not in html:
        problems.append("language switcher or diagram lightbox missing")
    for audio_name in ("audio/use.mp3", "audio/share.mp3", "audio/scripts/architect-use.md", "audio/scripts/architect-share.md"):
        if not (CAMPUS / audio_name).exists():
            problems.append("missing " + audio_name)
    if "viewSettings" not in app or "voiceschanged" not in app:
        problems.append("settings or voice picker missing")
    css = (CAMPUS / "campus.css").read_text()
    if "holographic" not in css or "cyberpunk" not in css or "sunset" not in css:
        problems.append("neon theme set missing holographic, cyberpunk, or sunset")
    for theme in ('data-theme="light"', 'data-theme="contrast"', 'data-theme="console"', 'data-theme="dark"'):
        if theme not in css and theme != 'data-theme="dark"':
            problems.append("missing theme " + theme)
    if 'data-theme="console"' not in css or 'data-theme="light"' not in css or 'data-theme="contrast"' not in css:
        problems.append("expected four themes in css")
    if "data-font" not in css or 'data-motion="reduce"' not in css:
        problems.append("font size or reduced-motion setting missing")
    eco = [l for l in lessons if l["track"] == "ecosystem"]
    titles = " ".join(l["title"].lower() for l in eco)
    for needle in ("glossary", "mind map", "e911", "forecast", "recording"):
        if needle not in titles:
            problems.append("ecosystem missing " + needle)
    for card in cards:
        if not card["front"] or not card["back"]:
            problems.append("blank card")
            break
    for item in quiz:
        if item["answer"] not in range(len(item["choices"])):
            problems.append("bad quiz answer " + item["id"])
            break
    studio = (CAMPUS / "studio.js").read_text() if (CAMPUS / "studio.js").exists() else ""
    if "viewCheats" not in studio or "KONAMI" not in studio:
        problems.append("studio.js missing cheat codes or the konami hook")
    for theme in ('data-theme="futuristic"', 'data-theme="gaming"', 'data-theme="neon"'):
        if theme not in css:
            problems.append("missing theme " + theme)
    if "cyphermonkeylabs.com" not in html or "linktr.ee/cyphermonkey" not in html:
        problems.append("studio chrome links missing")
    if "linkedin.com" in html.lower() or "mailto:" in html.lower():
        problems.append("chrome includes LinkedIn or an email")
    downloads = CAMPUS / "downloads"
    for name in ("index.html", "ports-protocols.html", "ports-protocols.pdf", "flashcards.json", "amazon-connect-lab.zip"):
        if not (downloads / name).exists():
            problems.append("missing download " + name)
    blob_parts = [html, app, studio, (CAMPUS / "campus.css").read_text(), (CAMPUS / "scene.js").read_text(), (CAMPUS / "flowlang.js").read_text(), (CAMPUS / "sw.js").read_text()]
    blob = "\n".join(blob_parts).lower()
    for host in FORBIDDEN:
        if host in blob:
            problems.append("forbidden host " + host)
    if "https://docs.aws.amazon.com" not in json.dumps(reference["sources"]):
        problems.append("missing AWS doc citations")
    if not (CAMPUS / "vendor" / "three.module.min.js").exists():
        problems.append("three.js is not vendored")
    for vendor_name in ("anime.esm.min.js", "rough.esm.js", "d3.min.js", "d3.entry.js", "confetti.module.mjs"):
        if not (CAMPUS / "vendor" / vendor_name).exists():
            problems.append("missing vendor " + vendor_name)
    for needle in ("anime.esm.min.js", "rough.esm.js", "d3.entry.js", "confetti.module.mjs", "paintMind", "runCounters"):
        if needle not in app:
            problems.append("app.js does not use " + needle)
    menu_labels = ("Diagrams", "Flows", "Charts", "Cheat Codes", "Play", "Ecosystem", "Downloads", "Careers")
    menu = html.split('class="campus-menu"', 1)[-1].split("</nav>", 1)[0] if 'class="campus-menu"' in html else ""
    for label in menu_labels:
        if label not in menu:
            problems.append("campus menu missing " + label)
    if "vercel.app" in html:
        problems.append("sibling strip still points at vercel")
    for href in re.findall(r'class="next-labs".*?</nav>', html, re.S):
        for link in re.findall(r'href="([^"]+)"', href):
            if not (
                link.startswith("https://cyphermonkeylabs.com/")
                or link.startswith("https://cipher0x9.github.io/")
            ):
                problems.append("sibling link is not a published lab host: " + link)
    license_text = (ROOT / "LICENSE").read_text()
    if "MIT" not in license_text or "CC BY-NC-SA" not in license_text:
        problems.append("LICENSE must state MIT code and CC BY-NC-SA content")
    if "MIT code, CC BY-NC-SA content" not in html:
        problems.append("footer license line missing")
    atlas_path = CAMPUS / "data" / "atlas.json"
    if not atlas_path.exists():
        problems.append("atlas.json missing")
    else:
        atlas = load_json(atlas_path)
        diagrams = atlas.get("diagrams") or []
        charts = atlas.get("charts") or []
        animated = [item for item in diagrams if item.get("animated") and "animateMotion" in item.get("svg", "")]
        if len(diagrams) < 25:
            problems.append("atlas diagrams %s < 25" % len(diagrams))
        if len(animated) < 12:
            problems.append("atlas animated flows %s < 12" % len(animated))
        if len(charts) < 6:
            problems.append("atlas charts %s < 6" % len(charts))
        kinds = {item.get("kind") for item in diagrams}
        for kind in ("flow", "diagram"):
            if kind not in kinds:
                problems.append("atlas missing kind " + kind)
    sheets = [path for path in (CAMPUS / "downloads").glob("*.html") if path.name != "index.html"]
    if len(sheets) < 10:
        problems.append("downloadable sheets %s < 10" % len(sheets))
    for sheet in sheets:
        text = sheet.read_text().lower()
        for needle in ("cyphermonkeylabs.com", "linktr.ee/cyphermonkey", "amazon-connect-lab-free-university-mesmerizing"):
            if needle not in text:
                problems.append(sheet.name + " missing " + needle)
        if "linkedin" in text or "mailto:" in text:
            problems.append(sheet.name + " has LinkedIn or an email")
        pdf = sheet.with_suffix(".pdf")
        png = sheet.with_suffix(".png")
        if not pdf.exists() or not png.exists():
            problems.append(sheet.stem + " missing pdf or png")
        elif b"cyphermonkeylabs.com" not in pdf.read_bytes():
            problems.append(sheet.stem + " pdf missing the lab link")
    if re.search(r"<script[^>]+src=[\"']https?:", html, re.I):
        problems.append("external script tag")
    if re.search(r"<link[^>]+href=[\"']https?:", html, re.I):
        problems.append("external stylesheet")
    if "og:image" not in html or "twitter:card" not in html:
        problems.append("missing social meta")
    if "@media (max-width: 640px)" not in css:
        problems.append("missing 640px mobile nav breakpoint")
    if "--cc-bg" not in (CAMPUS / "campus.css").read_text() or "--cc-accent-1" not in (CAMPUS / "campus.css").read_text():
        problems.append("campus-core tokens missing")
    png = CAMPUS / "og-card.png"
    if not png.exists() or png.stat().st_size < 1000:
        problems.append("og-card.png missing")
    proc = subprocess.run(
        ["node", "--input-type=module", "-e", FLOW_TEST],
        cwd=str(ROOT),
        text=True,
        capture_output=True,
    )
    if proc.returncode != 0:
        problems.append("flow language test failed: " + (proc.stderr or proc.stdout)[-500:])
    report = dict(counts)
    report["problems"] = problems
    report["flowTest"] = proc.stdout.strip()
    print(json.dumps(report, indent=2))
    if problems:
        raise SystemExit(1)


FLOW_TEST = r"""
import { exportFlow, importFlow, sampleOrderStatus, wireMissing, validateFlow } from "./web/flowlang.js";
const sample = sampleOrderStatus();
const open = exportFlow(sample);
if (!open.valid) throw new Error("sample should be structurally valid: " + open.errors.join("; "));
const wired = wireMissing(sample);
if (!wired.added) throw new Error("expected open ports to wire");
const closed = exportFlow(sample);
if (!closed.valid) throw new Error("wired sample invalid: " + closed.errors.join("; "));
const back = importFlow(JSON.stringify(closed.flow));
if (!back.ok) throw new Error("round trip invalid: " + back.errors.join("; "));
if (back.nodes.length !== sample.nodes.length) throw new Error("node count changed");
const official = {
  Version: "2019-10-30",
  StartAction: "12345678-1234-1234-1234-123456789012",
  Metadata: { EntryPointPosition: { x: 88, y: 100 }, ActionMetadata: {} },
  Actions: [
    {
      Identifier: "12345678-1234-1234-1234-123456789012",
      Type: "MessageParticipant",
      Parameters: { Text: "Thanks for calling the sample flow!" },
      Transitions: { NextAction: "abcdef-abcd-abcd-abcd-abcdefghijkl", Errors: [], Conditions: [] }
    },
    {
      Identifier: "abcdef-abcd-abcd-abcd-abcdefghijkl",
      Type: "DisconnectParticipant",
      Parameters: {},
      Transitions: {}
    }
  ]
};
const officialReport = validateFlow(official);
if (!officialReport.valid) throw new Error("official example rejected: " + officialReport.errors.join("; "));
const broken = validateFlow({ Version: "2018-01-01", StartAction: "nope", Actions: [] });
if (broken.valid) throw new Error("bad version was accepted");
console.log("flow-language ok");
"""


if __name__ == "__main__":
    main()
