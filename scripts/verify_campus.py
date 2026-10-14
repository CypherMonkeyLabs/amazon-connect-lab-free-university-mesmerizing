#!/usr/bin/env python3
"""Count campus content and reject network dependencies."""
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "campus" / "amazon-connect-lab.html"

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


def main():
    text = HTML.read_text()
    match = re.search(r'<script id="campus-data" type="application/json">(.*?)</script>', text, re.S)
    if not match:
        raise SystemExit("campus data block missing")
    data = json.loads(match.group(1))
    problems = []
    floors = {
        "tracks": 14,
        "lessons": 120,
        "labs": 20,
        "quiz": 300,
        "cards": 300,
        "scenarios": 20,
        "glossary": 40,
        "illustrations": 1500,
        "animatedFlows": 300,
        "charts": 20,
        "audio": 25,
        "faults": 30,
    }
    for key, floor in floors.items():
        if len(data[key]) < floor:
            problems.append(f"{key} has {len(data[key])}, need {floor}")
    ill_hashes = {}
    for item in data["illustrations"]:
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
    for item in data["animatedFlows"]:
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
    for lesson in data["lessons"]:
        if len(lesson.get("figures") or []) < 3:
            problems.append("lesson needs 3 figures: " + lesson.get("id", "?"))
            break
        if len(lesson.get("animated") or []) < 1:
            problems.append("lesson needs an animated flow: " + lesson.get("id", "?"))
            break
        if not lesson.get("try"):
            problems.append("lesson needs Try it: " + lesson.get("id", "?"))
            break
    for fault in data["faults"]:
        for field in ("symptom", "cause", "fix", "url", "source"):
            if not fault.get(field):
                problems.append("fault missing " + field)
                break
    if "confetti" not in text or "Try it" not in text:
        problems.append("missing confetti or Try it control")
    tracks = {t["id"] for t in data["tracks"]}
    for required in ("foundations", "bridge", "ecosystem"):
        if required not in tracks:
            problems.append("missing track " + required)
    eco = [l for l in data["lessons"] if l["track"] == "ecosystem"]
    titles = " ".join(l["title"].lower() for l in eco)
    for needle in ("glossary", "mind map", "e911", "forecast", "recording"):
        if needle not in titles and needle not in " ".join(l["paras"][0].lower() for l in eco):
            # glossary and mind map are titles; others may be in titles
            if needle not in titles:
                problems.append("ecosystem missing " + needle)
    for lesson in data["lessons"]:
        if not lesson.get("why") or not lesson.get("cite", {}).get("url"):
            problems.append("lesson missing why or cite: " + lesson.get("id", "?"))
        if not lesson.get("diagram") or not lesson.get("flow"):
            problems.append("lesson missing diagram or flow: " + lesson.get("id", "?"))
    for card in data["cards"]:
        if not card["front"] or not card["back"]:
            problems.append("blank card")
            break
    for item in data["quiz"]:
        if item["answer"] not in range(len(item["choices"])):
            problems.append("bad quiz answer " + item["id"])
            break
    lower = text.lower()
    for host in FORBIDDEN:
        if host in lower:
            problems.append("forbidden host " + host)
    if re.search(r"<script[^>]+src=", text, re.I):
        problems.append("external script tag")
    if re.search(r"<link[^>]+href=", text, re.I):
        problems.append("external stylesheet")
    if "og:image" not in text or "twitter:card" not in text:
        problems.append("missing social meta")
    png = ROOT / "campus" / "og-card.png"
    if not png.exists() or png.stat().st_size < 1000:
        problems.append("og-card.png missing")
    report = {
        "file": str(HTML),
        "tracks": len(data["tracks"]),
        "lessons": len(data["lessons"]),
        "labs": len(data["labs"]),
        "quiz": len(data["quiz"]),
        "cards": len(data["cards"]),
        "scenarios": len(data["scenarios"]),
        "glossary": len(data["glossary"]),
        "illustrations": len(data["illustrations"]),
        "animatedFlows": len(data["animatedFlows"]),
        "charts": len(data["charts"]),
        "audio": len(data["audio"]),
        "faults": len(data["faults"]),
        "sources": len(data["sources"]),
        "problems": problems,
    }
    print(json.dumps(report, indent=2))
    if problems:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
