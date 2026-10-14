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
    if 'route.view === "map"' not in app or 'route.view === "home" || route.view === "map"' in app:
        problems.append("Three.js should boot only on the map view")
    if "viewSettings" not in app or "voiceschanged" not in app:
        problems.append("settings or voice picker missing")
    css = (CAMPUS / "campus.css").read_text()
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
    blob_parts = [html, app, (CAMPUS / "campus.css").read_text(), (CAMPUS / "scene.js").read_text(), (CAMPUS / "flowlang.js").read_text(), (CAMPUS / "sw.js").read_text()]
    blob = "\n".join(blob_parts).lower()
    for host in FORBIDDEN:
        if host in blob:
            problems.append("forbidden host " + host)
    if "https://docs.aws.amazon.com" not in json.dumps(reference["sources"]):
        problems.append("missing AWS doc citations")
    if not (CAMPUS / "vendor" / "three.module.min.js").exists():
        problems.append("three.js is not vendored")
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
