#!/usr/bin/env python3
"""Assemble the modular Amazon Connect Lab for GitHub Pages."""
import hashlib
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "content"))

from curriculum import LESSONS, SCENARIOS, TRACKS  # noqa: E402
from glossary import GLOSSARY  # noqa: E402
from visuals import attach, extra_lessons, fault_records  # noqa: E402
from iac import IAC  # noqa: E402
from tips import TIPS  # noqa: E402
from tables import (  # noqa: E402
    BLOCKS, BRIDGE, CERTS, CFN, CTR_FIELDS, ERRORS, IAM_ACTIONS, PRICE, QUOTAS, TIMELINE,
)
from atlas import build_atlas  # noqa: E402

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


SHELL_HTML = """<!DOCTYPE html>
<html lang="en" data-theme="neon">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Amazon Connect Lab</title>
<meta name="description" content="A free offline campus for Amazon Connect: foundations, flows, routing, the CCP, Global Resiliency, a CUCM bridge, and the ecosystem around WFM, recording, E911, CRM, and agent assist.">
<meta property="og:title" content="Amazon Connect Lab">
<meta property="og:description" content="Eighteen tracks, twenty-four labs, a 3D architecture map, and a cited glossary for Amazon Connect.">
<meta property="og:image" content="og-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Amazon Connect Lab">
<meta name="twitter:description" content="Eighteen tracks, twenty-four labs, a 3D architecture map, and a cited glossary for Amazon Connect.">
<meta name="twitter:image" content="og-card.png">
<link rel="stylesheet" href="campus.css">
<script type="importmap">
{ "imports": { "three": "./vendor/three.module.min.js" } }
</script>
<script>
try {
  var saved = JSON.parse(localStorage.getItem("acl-campus-v1") || "{}");
  if (saved.theme) document.documentElement.dataset.theme = saved.theme;
  if (saved.fontSize) document.documentElement.dataset.font = saved.fontSize;
  var reduce = saved.reducedMotion;
  if (reduce === true || (reduce == null && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    document.documentElement.dataset.motion = "reduce";
  }
} catch (err) { /* keep the default theme */ }
</script>
</head>
<body data-view="home">
<a class="skip" href="#view-title">Skip to content</a>
<header class="phone-bar">
  <a class="phone-logo" href="#/">
    <span class="mark" aria-hidden="true"><svg viewBox="0 0 36 36"><path d="M6 22c6 6 18 6 24 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="18" cy="14" r="3" fill="currentColor"/></svg></span>
    <span>Connect Lab</span>
  </a>
  <button class="phone-menu-btn" id="phone-menu" type="button" aria-expanded="false" aria-controls="phone-sheet">
    <span class="burger" aria-hidden="true"><i></i><i></i><i></i></span>
    Menu
  </button>
</header>
<div class="studio-stack">
<header class="studio-bar">
  <a class="studio-home" href="https://cyphermonkeylabs.com">CypherMonkey Labs</a>
  <nav class="studio-links" aria-label="Studio">
    <a href="https://linktr.ee/cyphermonkey">Linktree</a>
    <a href="https://github.com/CypherMonkeyLabs/amazon-connect-lab-free-university-mesmerizing">Rate this lab</a>
    <a href="https://github.com/CypherMonkeyLabs/amazon-connect-lab-free-university-mesmerizing/issues">Comment / help</a>
    <a href="https://dev.to/cyphermonkey">dev.to</a>
    <a href="https://huggingface.co/Cypher0x9">Hugging Face</a>
    <a href="https://x.com/Cypher0x9">X</a>
    <a href="downloads/amazon-connect-lab.zip" download="amazon-connect-lab.zip">Download offline</a>
  </nav>
  <div class="mascot" id="mascot" data-pose="idle" data-shift="day">
    <svg viewBox="0 0 64 64" role="img" aria-label="CypherMonkey">
      <ellipse class="ear" cx="14" cy="28" rx="8" ry="10"/>
      <ellipse class="ear" cx="50" cy="28" rx="8" ry="10"/>
      <circle class="face" cx="32" cy="32" r="16"/>
      <ellipse class="muzzle" cx="32" cy="38" rx="8" ry="6"/>
      <circle class="eye" cx="26" cy="29" r="2"/>
      <circle class="eye" cx="38" cy="29" r="2"/>
      <path class="smile" d="M27 40q5 6 10 0" fill="none" stroke-width="1.6" stroke-linecap="round"/>
      <path class="arm" d="M16 44q-8-8 2-16" fill="none" stroke-width="2.4" stroke-linecap="round"/>
      <path class="band" d="M20 20q12-12 24 0" fill="none" stroke-width="2.2" stroke-linecap="round"/>
      <g class="gear gear-visor"><rect x="22" y="25" width="20" height="8" rx="3" fill="#22e7ff"/></g>
      <g class="gear gear-phones"><circle cx="14" cy="32" r="5" fill="none" stroke="#ff2d95" stroke-width="2"/><circle cx="50" cy="32" r="5" fill="none" stroke="#ff2d95" stroke-width="2"/><path d="M14 32 H8 M50 32 H56" stroke="#ff2d95" stroke-width="2"/></g>
      <g class="gear gear-scarf"><path d="M22 44 q10 12 20 0" fill="#ff7a3c"/></g>
      <g class="gear gear-star"><polygon points="32,6 34,13 41,13 35,17 37,24 32,20 27,24 29,17 23,13 30,13" fill="#fcee0a"/></g>
    </svg>
  </div>
</header>
<nav class="campus-menu" aria-label="Campus">
  <a href="#/diagrams" data-menu="diagrams">Diagrams</a>
  <a href="#/flows" data-menu="flows">Flows</a>
  <a href="#/charts" data-menu="charts">Charts</a>
  <a href="#/cheats" data-menu="cheats">Cheat Codes</a>
  <a href="#/play" data-menu="play">Play</a>
  <a href="#/track/ecosystem" data-menu="ecosystem">Ecosystem</a>
  <a href="#/downloads" data-menu="downloads">Downloads</a>
  <a href="#/career" data-menu="careers">Careers</a>
  <a href="#/settings" data-menu="settings">Settings</a>
  <label class="lang-pick">Language
    <select id="lang" aria-label="Language">
      <option value="en">English</option>
      <option value="es">Español</option>
      <option value="hi">हिन्दी</option>
      <option value="te">తెలుగు</option>
      <option value="fr">Français</option>
      <option value="de">Deutsch</option>
      <option value="ja">日本語</option>
      <option value="ar">العربية</option>
    </select>
  </label>
  <button type="button" id="theme-toggle">Dark / Light</button>
  <div class="theme-quick" role="group" aria-label="Theme">
    <button type="button" data-theme="neon">Neon</button>
    <button type="button" data-theme="holographic">Holographic</button>
    <button type="button" data-theme="cyberpunk">Cyberpunk</button>
    <button type="button" data-theme="sunset">Sunset</button>
    <button type="button" data-theme="light">Light</button>
  </div>
</nav>
</div>
<div id="phone-sheet" class="phone-sheet" hidden role="dialog" aria-modal="true" aria-labelledby="phone-sheet-title">
  <div class="phone-sheet-head">
    <p id="phone-sheet-title">Menu</p>
    <button type="button" id="sheet-search">Search</button>
    <button type="button" id="phone-close">Close</button>
  </div>
  <nav class="phone-sections" aria-label="Sections">
    <a href="#/" data-menu="learn">Learn</a>
    <a href="#/diagrams" data-menu="diagrams">Diagrams</a>
    <a href="#/flows" data-menu="flows">Flows</a>
    <a href="#/charts" data-menu="charts">Charts</a>
    <a href="#/cheats" data-menu="cheats">Cheat Codes</a>
    <a href="#/play" data-menu="play">Play</a>
    <a href="#/track/ecosystem" data-menu="ecosystem">Ecosystem</a>
    <a href="#/downloads" data-menu="downloads">Downloads</a>
    <a href="#/career" data-menu="careers">Careers</a>
    <a href="#/labs" data-menu="labs">Labs</a>
    <a href="#/quiz" data-menu="quiz">Quiz</a>
    <a href="#/cards" data-menu="cards">Cards</a>
    <a href="#/glossary" data-menu="glossary">Glossary</a>
    <a href="#/map" data-menu="map">Map</a>
    <a href="#/audio" data-menu="listen">Listen</a>
    <a href="#/timeline" data-menu="timeline">Timeline</a>
    <a href="#/settings" data-menu="settings">Settings</a>
  </nav>
  <nav id="phone-tracks" class="phone-tracks" aria-label="Tracks"></nav>
  <div class="phone-prefs">
    <label class="lang-pick">Language
      <select id="sheet-lang" aria-label="Language">
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="hi">हिन्दी</option>
        <option value="te">తెలుగు</option>
        <option value="fr">Français</option>
        <option value="de">Deutsch</option>
        <option value="ja">日本語</option>
        <option value="ar">العربية</option>
      </select>
    </label>
    <div class="theme-quick" role="group" aria-label="Theme">
      <button type="button" data-theme="neon">Neon</button>
      <button type="button" data-theme="holographic">Holographic</button>
      <button type="button" data-theme="cyberpunk">Cyberpunk</button>
      <button type="button" data-theme="sunset">Sunset</button>
      <button type="button" data-theme="light">Light</button>
    </div>
  </div>
</div>
<div class="app">
  <aside class="rail" id="rail">
    <div class="brand">
      <span class="mark" aria-hidden="true"><svg viewBox="0 0 36 36"><path d="M6 22c6 6 18 6 24 0" fill="none" stroke="#ffb020" stroke-width="3" stroke-linecap="round"/><circle cx="18" cy="14" r="3" fill="#2dd4bf"/></svg></span>
      <div><p class="brand-name">Amazon Connect Lab</p><span class="brand-kicker">Night-ops campus</span></div>
    </div>
    <nav id="track-list" class="track-list" aria-label="Tracks"></nav>
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
      <button data-go="#/map">3D map</button>
      <button data-go="#/ccp">CCP</button>
      <button data-go="#/tips">Tips</button>
      <button data-go="#/syllabus">Syllabus</button>
      <button data-go="#/cheats">Cheat codes</button>
      <button data-go="#/ports">Ports game</button>
      <button data-go="#/explorer">Flow map</button>
      <button data-go="#/daily">Daily</button>
      <button data-go="#/career">Career</button>
      <button data-go="#/settings">Settings</button>
    </div>
  </aside>
  <div class="main">
    <header class="topbar">
      <button class="icon-btn" id="menu" aria-label="Open tracks" type="button">☰</button>
      <button class="search-launch" id="open-search" type="button">Search the campus <span><kbd>Ctrl</kbd> <kbd>K</kbd></span></button>
      <div class="progress" aria-label="Lessons opened"><span id="progress-label">0%</span><div class="progress-track"><i id="progress-pip"></i></div></div>
      <button class="ghost" type="button" data-go="#/settings">Settings</button>
      <div class="streak" aria-label="Study streak"><b id="streak-count">0</b><span>day streak</span></div>
    </header>
    <main id="stage" tabindex="-1">
      <nav class="crumbs" id="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a></nav>
      <p class="meta" id="view-kicker">Free offline campus</p>
      <h1 id="view-title">Amazon Connect Lab</h1>
      <div id="view"><p>Loading the campus.</p></div>
      <footer class="site-foot">
        <p class="sig">CypherMonkey · Amazon Connect Lab</p>
        <p>Independent educational project, not affiliated with or endorsed by any vendor. Trademarks belong to their owners. MIT code, CC BY-NC-SA content.</p>
        <p class="foot-links"><a href="https://github.com/CypherMonkeyLabs/amazon-connect-lab-free-university-mesmerizing">Rate this lab</a><a href="https://github.com/CypherMonkeyLabs/amazon-connect-lab-free-university-mesmerizing/issues">Comment</a><a href="https://github.com/CypherMonkeyLabs/amazon-connect-lab-free-university-mesmerizing/issues">Help</a><a href="https://cyphermonkeylabs.com/#contact">Work with us</a><a href="https://cyphermonkeylabs.com/#contact">Report a concern / takedown</a></p>
        <nav class="next-labs" aria-label="Other labs">
          <p>Next lab</p>
          <a href="https://cyphermonkeylabs.com/uc-lab-free-university-mesmerizing/">UC Lab</a>
          <a href="https://cyphermonkeylabs.com/ai-lab-free-university-mesmerizing/">AI Lab</a>
          <a href="https://cyphermonkeylabs.com/microsoft-voice-cc-lab-free-university-mesmerizing/">Microsoft Voice</a>
          <a href="https://cyphermonkeylabs.com/five9-lab-free-university-mesmerizing/">Five9</a>
          <a href="https://cyphermonkeylabs.com/genesys-cloud-lab-free-university-mesmerizing/">Genesys Cloud</a>
          <a href="https://cyphermonkeylabs.com/nice-cxone-lab-free-university-mesmerizing/">NICE CXone</a>
          <a href="https://cyphermonkeylabs.com/sip-universe-lab-free-university-mesmerizing/">SIP Universe</a>
          <a href="https://cyphermonkeylabs.com/webex-lab-free-university-mesmerizing/">Webex Lab</a>
          <a href="https://cipher0x9.github.io/gemini-gems-free-gallery/">Gemini Gems</a>
        </nav>
      </footer>
    </main>
  </div>
</div>
<div class="backdrop" id="backdrop" hidden></div>
<nav class="bottom-nav" aria-label="Quick">
  <a href="#/" data-quick="learn">Learn</a>
  <a href="#/diagrams" data-quick="diagrams">Diagrams</a>
  <a href="#/play" data-quick="play">Play</a>
  <button type="button" id="quick-menu" aria-expanded="false" aria-controls="phone-sheet">Menu</button>
  <a href="#/audio" data-quick="listen">Listen</a>
</nav>
<div class="player glass" role="region" aria-label="Lesson player">
  <div><strong id="player-title">Amazon Connect Lab</strong><div class="meta" id="player-state">Idle</div></div>
  <canvas id="wave" width="220" height="36" aria-hidden="true"></canvas>
  <select id="clip-pick" aria-label="Offline tone"></select>
  <button class="ghost" id="player-clip" type="button">Tone</button>
  <button class="solid" id="player-play" type="button">Play</button>
  <button class="ghost" id="player-stop" type="button">Stop</button>
  <audio id="clip" preload="none"></audio>
</div>
<div class="modal" id="search-modal" hidden>
  <div class="dialog modal-card glass" role="dialog" aria-modal="true" aria-labelledby="search-label">
    <label id="search-label">Search the campus</label>
    <input id="q" type="search" placeholder="Flows, E911, skill group, 3478" autocomplete="off">
    <div id="hits"></div>
  </div>
</div>
<noscript><p>This campus needs JavaScript. Serve the campus folder over HTTP. It does not load libraries from a CDN.</p></noscript>
<dialog id="lightbox" class="lightbox" aria-label="Enlarged diagram"></dialog>
<script type="module" src="app.js"></script>
</body>
</html>
"""

SW_JS = """const VERSION = "acl-campus-v24";
const SHELL = __SHELL__;
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)))).then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith("/sw.js")) {
    event.respondWith(fetch(req));
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(req);
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    } catch (err) {
      if (req.mode === "navigate") {
        const home = await cache.match("index.html");
        if (home) return home;
      }
      throw err;
    }
  })());
});
"""


def write_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
    path.write_text(text)
    return len(text.encode())


def split_modules(data, campus):
    figures = {item["id"]: item for item in data["illustrations"]}
    flows = {item["id"]: item for item in data["animatedFlows"]}
    used_figures = set()
    used_flows = set()

    def take_figure(fid):
        used_figures.add(fid)
        return figures[fid]

    def take_flow(fid):
        used_flows.add(fid)
        return flows[fid]

    tracks_out = []
    search_hits = []
    for track in data["tracks"]:
        lessons = []
        slim = []
        for lesson in data["lessons"]:
            if lesson["track"] != track["id"]:
                continue
            full = dict(lesson)
            full["figures"] = [take_figure(fid) for fid in lesson["figures"]]
            full["animated"] = [take_flow(fid) for fid in lesson["animated"]]
            lessons.append(full)
            slim.append({"id": lesson["id"], "title": lesson["title"], "why": lesson["why"]})
            hay = " ".join([lesson["title"], lesson["why"], " ".join(lesson["paras"]), " ".join(lesson["points"]), lesson["mistake"]]).lower()
            search_hits.append({"href": "#/lesson/" + lesson["id"], "label": lesson["title"], "meta": "Lesson", "text": hay})
        pack = {"id": track["id"], "lessons": lessons}
        write_json(campus / "data" / "tracks" / (track["id"] + ".json"), pack)
        tracks_out.append({
            "id": track["id"], "title": track["title"], "kicker": track["kicker"], "hue": track["hue"],
            "depends": track["depends"], "why": track["why"], "lessons": slim,
        })

    glossary = []
    for term in data["glossary"]:
        item = dict(term)
        item["mark"] = take_figure(term["mark"])
        glossary.append(item)
        search_hits.append({"href": "#/glossary", "label": term["term"], "meta": "Glossary", "text": (term["term"] + " " + term["meaning"]).lower()})
    write_json(campus / "data" / "glossary.json", {"terms": glossary})

    charts = []
    for chart in data["charts"]:
        fig = take_figure(chart["figure"])
        charts.append({"id": chart["id"], "title": chart["title"], "figure": chart["figure"], "svg": fig["svg"], "caption": fig["caption"]})
    write_json(campus / "data" / "charts.json", {"charts": charts})

    faults = []
    for fault in data["faults"]:
        item = dict(fault)
        item["figure"] = take_figure(fault["figure"])
        item["animated"] = take_flow(fault["animated"])
        faults.append(item)
    blocks = [take_figure(item["id"]) for item in data["illustrations"] if item["kind"] == "block"]
    reference = {
        "timeline": data["timeline"],
        "sources": data["sources"],
        "bridge": data["bridge"],
        "errors": data["errors"],
        "quotas": data["quotas"],
        "scenarios": data["scenarios"],
        "faults": faults,
        "blockFigures": blocks,
    }
    write_json(campus / "data" / "reference.json", reference)
    write_json(campus / "data" / "quiz.json", {"questions": data["quiz"]})
    write_json(campus / "data" / "cards.json", {"cards": data["cards"]})
    write_json(campus / "data" / "audio.json", {"clips": data["audio"]})
    for lab in data["labs"]:
        search_hits.append({"href": "#/lab/" + lab["id"], "label": lab["title"], "meta": "Lab", "text": (lab["title"] + " " + lab["summary"]).lower()})
    missing_tips = [t["id"] for t in data["tracks"] if t["id"] not in TIPS]
    if missing_tips:
        raise SystemExit("tips missing for " + ", ".join(missing_tips))
    extra_tips = [key for key in TIPS if key not in {t["id"] for t in data["tracks"]}]
    if extra_tips:
        raise SystemExit("tips for unknown tracks " + ", ".join(extra_tips))
    write_json(campus / "data" / "tips.json", {"tracks": TIPS})
    for track in data["tracks"]:
        pack = TIPS[track["id"]]
        blob = " ".join(pack["tips"] + pack["traps"] + [term + " " + line for term, line in pack["sheet"]])
        search_hits.append({"href": "#/tips/" + track["id"], "label": track["title"] + " cheat sheet", "meta": "Tips", "text": blob.lower()})
    write_json(campus / "data" / "search.json", {"hits": search_hits})

    missing_figures = set(figures) - used_figures
    missing_flows = set(flows) - used_flows
    if missing_figures or missing_flows:
        raise SystemExit("unassigned visuals figures=%s flows=%s" % (len(missing_figures), len(missing_flows)))

    modules = ["data/search.json", "data/glossary.json", "data/quiz.json", "data/cards.json", "data/reference.json", "data/charts.json", "data/audio.json", "data/tips.json"]
    modules += ["data/tracks/%s.json" % t["id"] for t in data["tracks"]]
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
    }
    shell = {
        "updated": data["updated"],
        "counts": counts,
        "tracks": tracks_out,
        "labs": data["labs"],
        "audioIndex": [{"id": a["id"], "title": a["title"], "blurb": a["blurb"]} for a in data["audio"]],
        "iac": IAC,
        "modules": modules,
    }
    write_json(campus / "data" / "shell.json", shell)
    return counts


def main():
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
    campus = ROOT / "campus"
    if (campus / "data").exists():
        shutil.rmtree(campus / "data")
    counts = split_modules(data, campus)
    write_json(campus / "data" / "atlas.json", build_atlas())
    (campus / "index.html").write_text(SHELL_HTML)
    for name in ("app.js", "studio.js", "scene.js", "flowlang.js", "hero.js", "i18n.js", "lesson-titles.js", "lesson-bodies.js", "palette.js", "icons.js", "campus.css"):
        shutil.copyfile(ROOT / "web" / name, campus / name)
    audio_src = ROOT / "audio"
    audio_dst = campus / "audio"
    if audio_dst.exists():
        shutil.rmtree(audio_dst)
    if audio_src.exists():
        shutil.copytree(audio_src, audio_dst)
    vendor = campus / "vendor"
    if vendor.exists():
        shutil.rmtree(vendor)
    shutil.copytree(ROOT / "web" / "vendor", vendor)
    (campus / ".nojekyll").write_text("")
    from build_downloads import main as build_downloads  # noqa: E402
    build_downloads()
    precache = ["index.html", "campus.css", "app.js", "studio.js", "flowlang.js", "i18n.js", "lesson-titles.js", "lesson-bodies.js", "palette.js", "icons.js", "hero.js", "data/shell.json", "data/mastery.json", "data/atlas.json", "audio/use.mp3", "audio/share.mp3"]
    if (campus / "og-card.png").exists():
        precache.append("og-card.png")
    (campus / "sw.js").write_text(SW_JS.replace("__SHELL__", json.dumps(precache)))
    for stale in (ROOT / "amazon-connect-lab.html", campus / "amazon-connect-lab.html"):
        if stale.exists():
            stale.unlink()
    shell_bytes = sum((campus / name).stat().st_size for name in ("index.html", "campus.css", "app.js", "flowlang.js"))
    shell_bytes += (campus / "data" / "shell.json").stat().st_size
    three_bytes = (campus / "vendor" / "three.module.min.js").stat().st_size
    orbit_bytes = (campus / "vendor" / "OrbitControls.js").stat().st_size
    scene_bytes = (campus / "scene.js").stat().st_size
    counts["shellBytes"] = shell_bytes
    counts["threeBytes"] = three_bytes
    counts["firstLoadBytes"] = shell_bytes
    counts["mapLoadBytes"] = shell_bytes + three_bytes + orbit_bytes + scene_bytes
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
