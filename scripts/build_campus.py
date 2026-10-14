#!/usr/bin/env python3
"""Assemble the single-file Amazon Connect Lab."""
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "content"))

from curriculum import LESSONS, SCENARIOS, TRACKS  # noqa: E402
from glossary import GLOSSARY  # noqa: E402
from visuals import attach, extra_lessons, fault_records  # noqa: E402
from tables import (  # noqa: E402
    BLOCKS, BRIDGE, CERTS, CFN, CTR_FIELDS, ERRORS, IAM_ACTIONS, PRICE, QUOTAS, TIMELINE,
)

LABS = [
    ("flow-builder", "flows", "Contact flow builder", "Drag blocks, wire ports, and run a test call.", "12"),
    ("call-path", "telephony", "Call-path simulator", "Watch a call move from the PSTN through Lex and a queue to an agent.", "6"),
    ("routing-designer", "routing", "Routing profile designer", "Set priority and delay, then see which queue is eligible.", "8"),
    ("lambda-sim", "lambda", "Lambda invoke simulator", "Change the timeout, the mode, and the return shape.", "8"),
    ("ctr-inspector", "analytics", "CTR inspector", "Read the fields a warehouse and a dispute both need.", "6"),
    ("erlang", "routing", "Erlang C staffing calculator", "Turn calls, handle time, and shrinkage into a roster.", "8"),
    ("pricing", "security", "Pricing estimator", "An estimate dated 14 October 2026, with the rate card named.", "8"),
    ("iam-checker", "security", "IAM policy checker", "Flag wildcard actions, wildcard resources, and retired Voice ID grants.", "6"),
    ("webrtc", "workspace", "WebRTC network readiness", "Toggle UDP, VPN, and DNS and read the failure you would see.", "6"),
    ("find-fault", "troubleshoot", "Find the fault", "Match a symptom to the fix.", "8"),
    ("translator", "bridge", "CUCM, UCCX, and UCCE translator", "Map an old object to the Connect object and the pitfall.", "8"),
    ("hours-designer", "routing", "Hours checker", "See whether a timestamp is in hours, including a holiday override.", "5"),
    ("queue-priority", "routing", "Queue priority drill", "Decide which contact is offered when priority and delay disagree.", "5"),
    ("lex-mapper", "lex", "Lex intent mapper", "Turn an utterance into an intent, a slot, and the attributes to copy.", "5"),
    ("saml-mapper", "security", "SAML assertion checker", "See which required attribute is missing.", "5"),
    ("resiliency-drill", "resiliency", "Global Resiliency drill", "Check the Region pair and the 10 percent shift.", "6"),
    ("quota-headroom", "security", "Quota headroom", "Compare usage with a default and the 80 percent alarm habit.", "5"),
    ("cert-planner", "foundations", "Certification and badge planner", "Separate AWS Certification exams from Connect learning badges.", "5"),
    ("flow-log-reader", "troubleshoot", "Flow log reader", "Read one log line and name the fault class.", "4"),
    ("ecosystem-map", "ecosystem", "Integration map", "Producer, key, seam, and the first fault for each sister system.", "8"),
    ("e911-checker", "ecosystem", "E911 readiness checker", "Score a US CCP emergency-calling design. The test number is 933.", "6"),
    ("wfm-adherence", "ecosystem", "WFM adherence calculator", "Compare a published shift with unplanned offline time.", "6"),
    ("integration-hooks", "ecosystem", "Future integration hooks", "Pick a need and get the hook, not a rewrite.", "5"),
    ("glossary-drill", "ecosystem", "Glossary drill", "Match a definition to the term.", "4"),
]


def fact(track, term, meaning, url, source, facts):
    key = term.strip().lower()
    if key in facts:
        return
    facts[key] = {"track": track, "term": term.strip(), "meaning": meaning.strip(), "url": url, "source": source}


def collect_facts(lessons):
    facts = {}
    for term, meaning, track, url, source in GLOSSARY:
        fact(track, term, meaning, url, source, facts)
    for name, job, group in BLOCKS:
        fact("flows", "Block: " + name, f"{job} Group: {group}.", "https://docs.aws.amazon.com/connect/latest/adminguide/contact-block-definitions.html", "Flow block definitions", facts)
    for name, value, adjustable, scope in QUOTAS:
        fact("security", "Quota: " + name, f"Default {value}. Adjustable: {adjustable}. Scope: {scope}.", "https://docs.aws.amazon.com/connect/latest/adminguide/amazon-connect-service-limits.html", "Service quotas", facts)
    for date, kind, name, summary, url, source in TIMELINE:
        fact("foundations", f"Timeline {date}: {name}", summary, url, source, facts)
    for platform, old, nxt, pitfall in BRIDGE:
        fact("bridge", f"{platform}: {old}", f"Maps to {nxt}. Pitfall: {pitfall}", "https://docs.aws.amazon.com/connect/latest/adminguide/concepts-routing.html", "Routing profiles", facts)
    for symptom, detail, fix, url in ERRORS:
        fact("troubleshoot", symptom, f"{detail} Fix: {fix}", url, "Troubleshooting source", facts)
    for name, note, url in CERTS:
        fact("foundations", name, note, url, "Certification or learning-badge source", facts)
    for item, note, url in PRICE:
        fact("security", "Price: " + item, note + " Estimate context date 14 October 2026.", url, "Pricing appendix", facts)
    for name, note, url in CFN:
        fact("instance", "IaC: " + name, note, url, "Infrastructure-as-code source", facts)
    for name, note in CTR_FIELDS:
        fact("analytics", "CTR field: " + name, note, "https://repost.aws/knowledge-center/connect-integrate-kinesis", "re:Post, Kinesis and CTR delivery", facts)
    for action, note in IAM_ACTIONS:
        fact("security", "IAM: " + action, note, "https://docs.aws.amazon.com/service-authorization/latest/reference/list_amazonconnect.html", "Service authorization reference", facts)
    for lesson in lessons:
        for index, point in enumerate(lesson["points"]):
            fact(lesson["track"], f"{lesson['title']} ({index + 1})", point, lesson["cite"]["url"], lesson["cite"]["title"], facts)
    return list(facts.values())


def build_quiz(facts):
    terms = [f["term"] for f in facts]
    quiz = []
    for index, item in enumerate(facts):
        others = [t for t in terms if t != item["term"]]
        digest = hashlib.sha256(item["term"].encode()).digest()
        picks = []
        used = set()
        for offset in range(4):
            slot = digest[offset] % len(others)
            while slot in used:
                slot = (slot + 1) % len(others)
            used.add(slot)
            picks.append(others[slot])
        choices = picks[:3] + [item["term"]]
        order = list(range(4))
        order.sort(key=lambda i: hashlib.sha256(f"{item['term']}:{i}".encode()).hexdigest())
        ordered = [choices[i] for i in order]
        answer = ordered.index(item["term"])
        quiz.append({
            "id": f"q{index}",
            "track": item["track"],
            "q": "Which term matches this description? " + item["meaning"],
            "choices": ordered,
            "answer": answer,
            "why": item["meaning"] + " The term is " + item["term"] + ".",
            "url": item["url"],
            "source": item["source"],
        })
    return quiz


def build_cards(facts):
    return [{"id": f"c{i}", "front": f["term"], "back": f["meaning"], "track": f["track"], "source": f["source"]} for i, f in enumerate(facts)]


def scenarios():
    out = []
    for row in SCENARIOS:
        out.append({
            "id": row[0],
            "track": row[1],
            "title": row[2],
            "brief": row[3],
            "steps": [{"title": a, "body": b} for a, b in row[4]],
        })
    return out


def sources(lessons):
    found = {}
    for lesson in lessons:
        found[lesson["cite"]["url"]] = lesson["cite"]["title"]
    for term, meaning, track, url, source in GLOSSARY:
        found.setdefault(url, source)
    for date, kind, name, summary, url, source in TIMELINE:
        found.setdefault(url, source)
    return [{"title": title, "url": url} for url, title in sorted(found.items(), key=lambda kv: kv[1].lower())]


def shell(css, js, data):
    payload = json.dumps(data, ensure_ascii=False).replace("<", "\\u003c")
    return f"""<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Amazon Connect Lab</title>
<meta name="description" content="A free offline campus for Amazon Connect: foundations, flows, routing, the CCP, Global Resiliency, a CUCM bridge, and the ecosystem around WFM, recording, E911, CRM, and agent assist.">
<meta property="og:title" content="Amazon Connect Lab">
<meta property="og:description" content="Eighteen tracks, twenty-four labs, and a cited glossary for Amazon Connect. One HTML file. No CDN. No account.">
<meta property="og:image" content="og-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Amazon Connect Lab">
<meta name="twitter:description" content="Eighteen tracks, twenty-four labs, and a cited glossary for Amazon Connect. One HTML file. No CDN. No account.">
<meta name="twitter:image" content="og-card.png">
<style>
{css}
</style>
</head>
<body>
<a class="skip" href="#stage">Skip to content</a>
<div class="app">
  <aside class="rail" id="rail">
    <div class="brand"><span class="mark" aria-hidden="true"><span>AC</span></span><div><strong>Amazon Connect Lab</strong><small>Offline campus</small></div></div>
    <nav id="track-list" aria-label="Tracks"></nav>
    <div class="rail-foot">
      <button data-go="#/labs">Labs</button>
      <button data-go="#/quiz">Quiz</button>
      <button data-go="#/cards">Cards</button>
      <button data-go="#/scenarios">Walkthroughs</button>
      <button data-go="#/glossary">Glossary</button>
      <button data-go="#/faults">Faults</button>
      <button data-go="#/charts">Charts</button>
      <button data-go="#/audio">Audio</button>
      <button data-go="#/timeline">Timeline</button>
      <button data-go="#/sources">Sources</button>
    </div>
  </aside>
  <div class="main">
    <header class="topbar">
      <button class="icon-btn" id="menu" aria-label="Open tracks">☰</button>
      <button class="search-launch" id="open-search" data-search="1">Search the campus <kbd>Ctrl</kbd> <kbd>K</kbd></button>
      <div class="progress" aria-label="Lessons opened"><span id="progress-label">0%</span><div class="progress-track"><i id="progress-pip"></i></div></div>
      <div class="theme" role="group" aria-label="Theme">
        <button data-theme="dark" aria-label="Dark theme">Dark</button>
        <button data-theme="light" aria-label="Light theme">Light</button>
        <button data-theme="contrast" aria-label="High contrast theme">Contrast</button>
      </div>
      <div class="streak" aria-label="Study streak"><b id="streak-count">0</b><span>day streak</span></div>
    </header>
    <div id="stage" tabindex="-1"></div>
  </div>
</div>
<div class="player glass" role="region" aria-label="Lesson player">
  <div><strong id="player-title">Amazon Connect Lab</strong><div class="meta" id="player-state">Idle</div></div>
  <canvas id="wave" width="220" height="36" aria-hidden="true"></canvas>
  <select id="clip-pick" aria-label="Offline tone"></select>
  <button class="ghost" id="player-clip">Tone</button>
  <button class="solid" id="player-play">Play</button>
  <button class="ghost" id="player-stop">Stop</button>
  <audio id="clip" preload="none"></audio>
</div>
<div class="modal" id="search-modal" hidden>
  <div class="dialog modal-card" role="dialog" aria-modal="true" aria-labelledby="search-label">
    <label id="search-label">Search the campus</label>
    <input id="q" type="search" placeholder="Flows, E911, skill group, 3478…" autocomplete="off">
    <div id="hits"></div>
  </div>
</div>
<noscript><p>This campus needs JavaScript in the file itself. It does not load anything from the network.</p></noscript>
<script id="campus-data" type="application/json">{payload}</script>
<script>
{js}
</script>
</body>
</html>
"""


def main():
    css = (ROOT / "web" / "campus.css").read_text()
    js = (ROOT / "web" / "app.js").read_text()
    lessons = list(LESSONS) + extra_lessons()
    facts = collect_facts(lessons)
    data = {
        "updated": "2026-10-14",
        "tracks": TRACKS,
        "lessons": lessons,
        "labs": [{"id": a, "track": b, "title": c, "summary": d, "minutes": e} for a, b, c, d, e in LABS],
        "quiz": build_quiz(facts),
        "cards": build_cards(facts),
        "scenarios": scenarios(),
        "timeline": [{"date": a, "kind": b, "name": c, "summary": d, "url": e, "source": f} for a, b, c, d, e, f in TIMELINE],
        "glossary": [{"term": a, "meaning": b, "track": c, "url": d, "source": e} for a, b, c, d, e in GLOSSARY],
        "bridge": [{"platform": a, "old": b, "next": c, "pitfall": d} for a, b, c, d in BRIDGE],
        "errors": [{"symptom": a, "detail": b, "fix": c, "url": d} for a, b, c, d in ERRORS],
        "faults": fault_records(),
        "quotas": [{"name": a, "value": b, "adjustable": c, "why": d} for a, b, c, d in QUOTAS],
        "sources": sources(lessons),
    }
    attach(data)
    html = shell(css, js, data)
    targets = [
        ROOT / "amazon-connect-lab.html",
        ROOT / "campus" / "index.html",
        ROOT / "campus" / "amazon-connect-lab.html",
    ]
    for path in targets:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(html)
    (ROOT / "campus" / ".nojekyll").write_text("")
    counts = {
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
        "bytes": len(html.encode()),
    }
    print(json.dumps(counts, indent=2))
    floors = {
        "tracks": 14, "lessons": 120, "labs": 20, "quiz": 300, "cards": 300,
        "scenarios": 20, "glossary": 40, "illustrations": 1500, "animatedFlows": 300,
        "charts": 20, "audio": 25, "faults": 30,
    }
    for key, floor in floors.items():
        if counts[key] < floor:
            raise SystemExit(f"{key} {counts[key]} is below {floor}")


if __name__ == "__main__":
    main()
