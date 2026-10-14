(function () {
  "use strict";
  const DATA = JSON.parse(document.getElementById("campus-data").textContent);
  const FIG = {};
  (DATA.illustrations || []).forEach((item) => { FIG[item.id] = item; });
  const FLOW = {};
  (DATA.animatedFlows || []).forEach((item) => { FLOW[item.id] = item; });
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const stage = () => $("#stage");
  const KEY = "acl-campus-v1";

  const state = load();
  let route = parseHash();
  let audio = { title: "Amazon Connect Lab", text: "Pick a lesson. The player reads the why-it-matters line.", timer: null };
  let flowPlay = null;

  function load() {
    const blank = { opened: [], labs: [], quiz: { correct: 0, answered: 0, seen: {} }, cards: { known: [] }, streak: { last: "", count: 0 }, theme: "dark", achievements: [], scenario: {} };
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return blank;
      return Object.assign(blank, JSON.parse(raw));
    } catch (err) {
      return blank;
    }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (err) { /* private mode */ }
  }
  function today() { return new Date().toISOString().slice(0, 10); }
  function touchStreak() {
    const d = today();
    if (state.streak.last === d) return;
    const prev = new Date(d);
    prev.setDate(prev.getDate() - 1);
    const y = prev.toISOString().slice(0, 10);
    state.streak.count = state.streak.last === y ? state.streak.count + 1 : 1;
    state.streak.last = d;
    if (state.streak.count >= 3) award("streak");
  }
  function award(id) {
    if (!state.achievements.includes(id)) {
      state.achievements.push(id);
      confetti();
    }
  }
  function confetti() {
    if (reduced) return;
    const layer = document.createElement("div");
    layer.className = "confetti";
    for (let i = 0; i < 42; i++) {
      const bit = document.createElement("i");
      bit.style.left = (Math.random() * 100) + "%";
      bit.style.background = ["#e5843b", "#3dcfb4", "#f0c56a", "#8eb8ff", "#c4b5fd"][i % 5];
      bit.style.animationDelay = (Math.random() * 0.25) + "s";
      layer.appendChild(bit);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 1700);
  }
  function figureHtml(id) {
    const item = FIG[id];
    if (!item) return "";
    return `<figure class="glass figure">${item.svg}<figcaption>${esc(item.caption)}</figcaption></figure>`;
  }
  function parseHash() {
    const h = location.hash.replace(/^#\/?/, "");
    const [a, b] = h.split("/");
    return { view: a || "home", id: b ? decodeURIComponent(b) : "" };
  }
  function go(hash) {
    location.hash = hash;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function trackBy(id) { return DATA.tracks.find((t) => t.id === id); }
  function lessonBy(id) { return DATA.lessons.find((t) => t.id === id); }

  const ACH = {
    first: "First contact",
    foundations: "Foundations",
    streak: "Three-day streak",
    labs: "Five labs",
    quiz: "Twenty correct",
    bridge: "Bridge crossed",
    ecosystem: "Ecosystem opened",
    scenario: "Walkthrough finished"
  };

  function renderRail() {
    const list = $("#track-list");
    list.innerHTML = DATA.tracks.map((t) => {
      const done = DATA.lessons.filter((l) => l.track === t.id && state.opened.includes(l.id)).length;
      const total = DATA.lessons.filter((l) => l.track === t.id).length;
      return `<button class="track-link" data-go="#/track/${t.id}" ${route.view === "track" && route.id === t.id ? 'aria-current="true"' : ""}>
        <i class="dot" style="--hue:${t.hue}"></i><span>${esc(t.title)}<small style="display:block">${esc(t.kicker)}</small></span><small>${done}/${total}</small></button>`;
    }).join("");
    document.documentElement.dataset.theme = state.theme;
    $("#streak-count").textContent = String(state.streak.count || 0);
    const pct = Math.round((state.opened.length / DATA.lessons.length) * 100);
    $("#progress-label").textContent = pct + "%";
    $("#progress-pip").style.width = pct + "%";
  }

  function render() {
    clearInterval(flowPlay);
    clearInterval(pathTimer);
    route = parseHash();
    renderRail();
    const s = stage();
    const view = route.view;
    if (view === "home") s.innerHTML = viewHome();
    else if (view === "track") s.innerHTML = viewTrack(route.id);
    else if (view === "lesson") s.innerHTML = viewLesson(route.id);
    else if (view === "lab") s.innerHTML = viewLab(route.id);
    else if (view === "labs") s.innerHTML = viewLabs();
    else if (view === "quiz") s.innerHTML = viewQuiz(route.id);
    else if (view === "cards") s.innerHTML = viewCards();
    else if (view === "scenarios") s.innerHTML = viewScenarios();
    else if (view === "scenario") s.innerHTML = viewScenario(route.id);
    else if (view === "timeline") s.innerHTML = viewTimeline();
    else if (view === "map") s.innerHTML = viewMap();
    else if (view === "glossary") s.innerHTML = viewGlossary();
    else if (view === "sources") s.innerHTML = viewSources();
    else if (view === "charts") s.innerHTML = viewCharts();
    else if (view === "faults") s.innerHTML = viewFaults();
    else if (view === "audio") s.innerHTML = viewAudio();
    else s.innerHTML = `<p>That page is not on the campus.</p>`;
    $("#search-modal").hidden = true;
    s.focus();
  }

  function viewHome() {
    const towers = DATA.tracks.map((t, i) => {
      const x = 8 + (i % 6) * 15;
      const y = 18 + Math.floor(i / 6) * 28;
      return `<button class="tower pulse" data-go="#/track/${t.id}" style="--hue:${t.hue};--z:${20 + (i % 5) * 16}px;left:${x}%;top:${y}%">${esc(t.title)}<em>${DATA.lessons.filter((l) => l.track === t.id).length} lessons</em></button>`;
    }).join("");
    return `<section class="hero">
      <div class="hero-copy">
        <p class="meta">Free offline campus · 14 Oct 2026 research cut</p>
        <h2>Amazon Connect, taught as a system.</h2>
        <p class="lede">Eighteen tracks from the AWS account underneath the instance through flows, routing, the CCP, and the ecosystem around it: WFM, recording, E911, CRM, and agent assist. No account. No CDN. The file is the course.</p>
        <div class="why"><strong>Why it matters.</strong> A contact center fails in a quota, a key policy, a missing error branch, or a blocked UDP port. This campus makes those failures visible before they are expensive.</div>
        <p>
          <button class="solid" data-go="#/track/foundations">Start with Foundations</button>
          <button class="ghost" data-go="#/map">Depends-on map</button>
          <button class="ghost" data-go="#/labs">Labs</button>
          <button class="ghost" data-go="#/charts">Charts</button>
          <button class="ghost" data-go="#/audio">Tones</button>
        </p>
        <div class="stats-row" aria-label="Campus counts">
          ${stat(DATA.tracks.length, "Tracks")}${stat(DATA.lessons.length, "Lessons")}${stat((DATA.illustrations || []).length, "Figures")}${stat((DATA.animatedFlows || []).length, "Flows")}${stat((DATA.audio || []).length, "Tones")}${stat((DATA.faults || []).length, "Faults")}
        </div>
      </div>
      <div class="scene" aria-label="Three-dimensional campus of tracks">
        <div class="scene-spin"><div class="floor"></div>${towers}</div>
      </div>
    </section>
    <div class="section-head"><h2>Study order</h2><button class="ghost" data-go="#/timeline">Feature timeline</button></div>
    <div class="grid-cards">
      ${DATA.tracks.slice(0, 6).map(trackCard).join("")}
    </div>
    <div class="section-head"><h2>Ecosystem</h2><button class="ghost" data-go="#/track/ecosystem">Open the track</button></div>
    ${mindSvg(true)}
    <div class="section-head"><h2>Charts</h2><button class="ghost" data-go="#/charts">All charts</button></div>
    <div class="figure-grid">${(DATA.charts || []).slice(0, 3).map((c) => figureHtml(c.figure)).join("")}</div>
    <div class="section-head"><h2>Achievements</h2></div>
    <div class="grid-cards">${Object.entries(ACH).map(([id, name]) => `<article class="card"><p class="meta">${state.achievements.includes(id) ? "Earned" : "Locked"}</p><h3>${esc(name)}</h3></article>`).join("")}</div>`;
  }

  function stat(n, label) {
    return `<div class="stat"><b>${n}</b><span>${label}</span></div>`;
  }
  function trackCard(t) {
    const n = DATA.lessons.filter((l) => l.track === t.id).length;
    return `<button class="card" data-go="#/track/${t.id}"><p class="meta" style="color:${t.hue}">Depends on ${t.depends.length ? t.depends.map(esc).join(", ") : "nothing earlier"}</p><h3>${esc(t.title)}</h3><p>${esc(t.why)}</p><p class="meta">${n} lessons</p></button>`;
  }

  function viewTrack(id) {
    const t = trackBy(id);
    if (!t) return `<p>Unknown track.</p>`;
    if (id === "bridge") award("bridge");
    if (id === "ecosystem") award("ecosystem");
    const lessons = DATA.lessons.filter((l) => l.track === id);
    const deps = t.depends.map((d) => trackBy(d)).filter(Boolean);
    return `<div class="section-head"><div><p class="meta">Track</p><h2>${esc(t.title)}</h2></div><button class="ghost" data-go="#/quiz/${id}">Quiz this track</button></div>
      <div class="why"><strong>Why it matters.</strong> ${esc(t.why)}</div>
      <div class="glass" style="padding:14px;margin:12px 0">${diagram({ type: "path", nodes: [{ id: "0", label: "This track" }].concat(deps.map((d, i) => ({ id: String(i + 1), label: "Needs " + d.title }))), caption: deps.length ? "Depends on " + deps.map((d) => d.title).join(", ") + "." : "Starts the campus. Nothing earlier is required." })}</div>
      <div class="lesson-grid">${lessons.map((l) => `<button class="lesson-card" data-go="#/lesson/${l.id}"><p class="meta">${state.opened.includes(l.id) ? "Opened" : "New"}</p><h3>${esc(l.title)}</h3><p>${esc(l.why)}</p></button>`).join("")}</div>`;
  }

  function viewLesson(id) {
    const l = lessonBy(id);
    if (!l) return `<p>Unknown lesson.</p>`;
    if (!state.opened.includes(id)) state.opened.push(id);
    touchStreak();
    award("first");
    const found = DATA.lessons.filter((x) => x.track === "foundations");
    if (found.every((x) => state.opened.includes(x.id))) award("foundations");
    save();
    const t = trackBy(l.track);
    audio = { title: l.title, text: l.title + ". Why it matters. " + l.why };
    const points = l.points.map((p, i) => `<li><span class="num">${i + 1}</span><span>${esc(p)}</span></li>`).join("");
    const special = l.id === "eco-glossary" ? viewGlossaryInner() : l.id === "eco-mind" ? mindSvg(false) : l.id === "foundations-timeline" ? `<p><button class="solid" data-go="#/timeline">Open the full timeline</button></p>` : "";
    const motions = (l.animated || []).map((id) => {
      const item = FLOW[id];
      return item ? `<figure class="glass figure anim">${item.svg}<figcaption>${esc(item.kind)} · ${esc(item.caption)}</figcaption></figure>` : "";
    }).join("");
    const tone = (DATA.audio || [])[Math.abs(hashId(l.id)) % Math.max(1, (DATA.audio || []).length)];
    return `<article class="lesson" data-lesson="${esc(l.id)}">
      <div>
        <p class="meta">${esc(t.title)}</p>
        <div class="section-head"><h2>${esc(l.title)}</h2></div>
        <div class="why"><strong>Why it matters.</strong> ${esc(l.why)}</div>
        <div class="figure-grid">${(l.figures || []).slice(0, 3).map(figureHtml).join("")}</div>
        <div class="prose">${l.paras.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
        <ol class="points">${points}</ol>
        <p class="mistake"><strong>Common mistake.</strong> ${esc(l.mistake)}</p>
        <p class="cite">Source: <a href="${esc(l.cite.url)}" rel="noopener noreferrer">${esc(l.cite.title)}</a></p>
        <p>
          <button class="solid" data-go="#/lab/${esc(l.try || "flow-builder")}">Try it</button>
          <button class="ghost" id="speak">Play this lesson</button>
          ${tone ? `<button class="ghost" data-clip="${esc(tone.id)}">Play ${esc(tone.title)}</button>` : ""}
          <button class="ghost" data-go="#/track/${l.track}">Back to track</button>
        </p>
        ${special}
        <div class="figure-grid">${(l.figures || []).slice(3).map(figureHtml).join("")}</div>
      </div>
      <aside>
        <div class="glass diagram-wrap"><p class="num">${esc(l.number.v)}</p><p class="meta">${esc(l.number.k)}</p><p>${esc(l.number.n)}</p>${l.chart ? figureHtml(l.chart) : diagram(l.diagram)}</div>
        <div class="glass flow-wrap" style="margin-top:12px">
          <div class="flow-controls">
            <button class="solid" id="flow-play">Play flow</button>
            <button class="ghost" id="flow-step">Step</button>
          </div>
          <div class="figure-grid">${motions}</div>
          <div id="flow-svg"></div>
          <p class="step-now" id="flow-caption"></p>
        </div>
      </aside>
    </article>`;
  }
  function hashId(text) {
    let h = 0;
    for (let i = 0; i < text.length; i++) h = (h * 33 + text.charCodeAt(i)) >>> 0;
    return h;
  }

  function diagram(spec) {
    const nodes = (spec && spec.nodes) || [];
    const w = 640;
    const h = spec && spec.type === "layers" ? 48 + nodes.length * 58 : spec && spec.type === "bars" ? 36 + nodes.length * 36 : 180;
    let body = "";
    if (!spec || spec.type === "path" || spec.type === "timeline") {
      const gap = nodes.length ? (w - 40) / nodes.length : w;
      body = nodes.map((n, i) => {
        const x = 24 + i * gap;
        const next = i < nodes.length - 1 ? `<line x1="${x + 108}" y1="70" x2="${x + gap - 8}" y2="70" stroke="#e5843b" stroke-width="3"/>` : "";
        return `${next}<rect x="${x}" y="36" rx="14" width="116" height="68" fill="#10202b" stroke="#3dcfb4"/><text x="${x + 58}" y="76" text-anchor="middle" fill="#f3efe4" font-size="12" font-family="Palatino, Georgia, serif">${esc(n.label).slice(0, 22)}</text>`;
      }).join("");
    } else if (spec.type === "layers") {
      body = nodes.map((n, i) => `<rect x="24" y="${16 + i * 56}" rx="14" width="560" height="46" fill="#10202b" stroke="#e5843b"/><text x="40" y="${44 + i * 56}" fill="#f3efe4" font-size="16" font-family="Palatino, Georgia, serif">${esc(n.label)}</text>`).join("");
    } else if (spec.type === "split") {
      body = `<rect x="20" y="30" width="250" height="110" rx="16" fill="#10202b" stroke="#3dcfb4"/><rect x="330" y="30" width="250" height="110" rx="16" fill="#10202b" stroke="#e5843b"/><text x="145" y="92" text-anchor="middle" fill="#f3efe4" font-size="16">${esc(nodes[0] ? nodes[0].label : "")}</text><text x="455" y="92" text-anchor="middle" fill="#f3efe4" font-size="16">${esc(nodes[1] ? nodes[1].label : "")}</text>`;
    } else if (spec.type === "bars") {
      const max = Math.max(...nodes.map((n) => Number(n.value) || 1));
      body = nodes.map((n, i) => {
        const width = 40 + ((Number(n.value) || 0) / max) * 420;
        return `<text x="16" y="${28 + i * 34}" fill="#c9d2cf" font-size="12">${esc(n.label)}</text><rect x="150" y="${14 + i * 34}" width="${width}" height="16" rx="8" fill="#3dcfb4"/>`;
      }).join("");
    }
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(spec && spec.caption || "Diagram")}">${body}</svg><p class="caption">${esc(spec && spec.caption || "")}</p>`;
  }

  function drawFlow(index) {
    const l = lessonBy(route.id);
    if (!l) return;
    const steps = l.flow;
    const svg = steps.map((st, i) => {
      const on = i === index;
      return `<g><rect x="${20 + i * 150}" y="20" width="130" height="64" rx="12" fill="${on ? "#e5843b" : "#10202b"}" stroke="#f3efe4"/><text x="${85 + i * 150}" y="56" text-anchor="middle" fill="${on ? "#1a0d06" : "#f3efe4"}" font-size="12">${esc(st.label).slice(0, 18)}</text></g>`;
    }).join("");
    $("#flow-svg").innerHTML = `<svg class="flow-svg" viewBox="0 0 ${Math.max(320, steps.length * 150)}" height="110">${svg}</svg>`;
    const cap = $("#flow-caption");
    if (steps[index]) cap.textContent = steps[index].label + " — " + steps[index].detail;
  }

  function mindSvg(compact) {
    const nodes = [
      ["Telephony", "Numbers and transfers"],
      ["Flows", "What the caller hears"],
      ["Routing", "Who can take it"],
      ["CCP", "WebRTC media"],
      ["WFM", "Agent events"],
      ["Recording", "S3 or KVS"],
      ["CRM", "Profile id"],
      ["E911", "CivicAddress"],
      ["Assist", "Cited articles"]
    ];
    const dots = nodes.map((n, i) => {
      const a = (-Math.PI / 2) + (i / nodes.length) * Math.PI * 2;
      const x = 320 + Math.cos(a) * 210;
      const y = 210 + Math.sin(a) * 150;
      return `<line x1="320" y1="210" x2="${x}" y2="${y}" stroke="#e5843b" stroke-width="2"/><g class="mind-node" data-mind="${esc(n[0])}"><rect x="${x - 70}" y="${y - 24}" width="140" height="48" rx="12" fill="#10202b" stroke="#3dcfb4"/><text x="${x}" y="${y + 4}" text-anchor="middle" fill="#f3efe4" font-size="13">${esc(n[0])}</text></g>`;
    }).join("");
    return `<div class="glass" style="padding:12px;margin:12px 0"><svg class="map-svg" viewBox="0 0 640 420" role="img" aria-label="Mind map with the contact in the center">${dots}<circle cx="320" cy="210" r="54" fill="#e5843b"/><text x="320" y="214" text-anchor="middle" font-size="16" fill="#1a0d06">Contact</text></svg><p class="caption" id="mind-cap">${compact ? "Center is the contact. Open Ecosystem for the glossary and the seams." : "Select a node."}</p></div>`;
  }

  function viewMap() {
    const w = 760;
    const h = 520;
    const nodes = DATA.tracks.map((t, i) => {
      const col = i % 6;
      const row = Math.floor(i / 6);
      return { ...t, x: 70 + col * 120, y: 80 + row * 150 };
    });
    const lines = [];
    nodes.forEach((t) => t.depends.forEach((d) => {
      const from = nodes.find((n) => n.id === d);
      if (from) lines.push(`<line x1="${from.x}" y1="${from.y}" x2="${t.x}" y2="${t.y}" stroke="#3dcfb4" stroke-width="2"/>`);
    }));
    const rects = nodes.map((t) => `<g data-go="#/track/${t.id}"><rect x="${t.x - 52}" y="${t.y - 28}" width="104" height="56" rx="12" fill="#10202b" stroke="${t.hue}"/><text x="${t.x}" y="${t.y + 4}" text-anchor="middle" fill="#f3efe4" font-size="11">${esc(t.title)}</text></g>`).join("");
    return `<div class="section-head"><h2>Depends-on map</h2></div><p class="lede">An arrow means the track at the point of the arrow assumes the earlier track. Foundations has no inbound arrow.</p><div class="glass" style="padding:12px"><svg class="map-svg" viewBox="0 0 ${w} ${h}">${lines.join("")}${rects}</svg></div>`;
  }

  function viewTimeline() {
    const kinds = ["All"].concat([...new Set(DATA.timeline.map((t) => t.kind))]);
    return `<div class="section-head"><h2>Feature timeline</h2></div><p class="lede">Dates are from AWS What's New, the admin guide, the AWS News Blog, or the 25 September 2026 compilation that cites them. Voice ID is the feature that ended. Renames are not endings.</p><div id="kind-row">${kinds.map((k) => `<button class="chip" data-kind="${esc(k)}" aria-pressed="${k === "All" ? "true" : "false"}">${esc(k)}</button>`).join("")}</div><div class="timeline" id="time-list">${timelineItems(DATA.timeline)}</div>`;
  }
  function timelineItems(rows) {
    return rows.map((t) => `<article class="glass t-item"><div><strong>${esc(t.date)}</strong><p class="meta">${esc(t.kind)}</p></div><div><h3>${esc(t.name)}</h3><p>${esc(t.summary)}</p><p class="cite"><a href="${esc(t.url)}">${esc(t.source)}</a></p></div></article>`).join("");
  }

  function viewGlossary() {
    return `<div class="section-head"><h2>Glossary</h2></div><p class="lede">One meaning per word, with a source. Search with the box or with Ctrl+K.</p><input id="gloss-q" type="search" placeholder="Filter terms" aria-label="Filter glossary" style="width:min(420px,100%);padding:10px;border-radius:12px;border:1px solid var(--line);background:var(--glass)"><div id="gloss-list">${glossaryList("")}</div>`;
  }
  function viewGlossaryInner() { return `<div id="gloss-list">${glossaryList("")}</div><p><button class="ghost" data-go="#/glossary">Open the full glossary</button></p>`; }
  function glossaryList(q) {
    const query = q.toLowerCase();
    const rows = DATA.glossary.filter((g) => !query || g.term.toLowerCase().includes(query) || g.meaning.toLowerCase().includes(query));
    return `<p class="meta">${rows.length} terms</p>` + rows.map((g) => `<article class="glass gloss-row"><div class="mark-svg">${g.mark && FIG[g.mark] ? FIG[g.mark].svg : ""}</div><div><h3>${esc(g.term)}</h3><p>${esc(g.meaning)}</p><p class="cite"><a href="${esc(g.url)}">${esc(g.source)}</a></p></div></article>`).join("");
  }

  function viewCharts() {
    return `<div class="section-head"><h2>Charts</h2></div><p class="lede">Teaching charts from the published list rates, the Erlang C formula, and the quota table. Prices are estimates dated 14 October 2026.</p><div class="figure-grid">${(DATA.charts || []).map((c) => figureHtml(c.figure)).join("")}</div>`;
  }
  function viewFaults() {
    const rows = DATA.faults || [];
    return `<div class="section-head"><h2>Fault catalog</h2></div><p class="lede">${rows.length} faults. Each one names the symptom, the cause, the fix, and the source.</p><div class="grid-cards">${rows.map((f) => `<article class="card"><p class="meta">${esc(f.hop)}</p><h3>${esc(f.symptom)}</h3>${f.figure ? figureHtml(f.figure) : ""}${f.animated && FLOW[f.animated] ? FLOW[f.animated].svg : ""}<p><strong>Cause.</strong> ${esc(f.cause)}</p><p><strong>Fix.</strong> ${esc(f.fix)}</p><p class="cite"><a href="${esc(f.url)}">${esc(f.source)}</a></p><p><button class="solid" data-go="#/lesson/fault-${esc(f.id)}">Open the lesson</button></p></article>`).join("")}</div>`;
  }
  function viewAudio() {
    return `<div class="section-head"><h2>Offline tones</h2></div><p class="lede">Synthesized in the file. DTMF, a short IVR sequence, ringback, busy, and the beeps used in the lessons. Nothing is fetched.</p><div class="grid-cards">${(DATA.audio || []).map((a) => `<article class="card"><h3>${esc(a.title)}</h3><p>${esc(a.blurb)}</p><button class="solid" data-clip="${esc(a.id)}">Play</button></article>`).join("")}</div>`;
  }
  function playClip(id) {
    const clip = (DATA.audio || []).find((a) => a.id === id);
    const el = $("#clip");
    if (!clip || !el) return;
    el.src = "data:audio/wav;base64," + clip.b64;
    el.play();
    $("#player-title").textContent = clip.title;
    $("#player-state").textContent = "Tone";
    drawWave();
  }
  function viewSources() {
    return `<div class="section-head"><h2>Sources</h2></div><p class="lede">Primary pages used for facts in this file. A secondary timeline is labeled as a compilation.</p><div class="glass" style="padding:12px"><table><thead><tr><th>Title</th><th>URL</th></tr></thead><tbody>${DATA.sources.map((s) => `<tr><td>${esc(s.title)}</td><td><a href="${esc(s.url)}">${esc(s.url)}</a></td></tr>`).join("")}</tbody></table></div>`;
  }

  function viewLabs() {
    return `<div class="section-head"><h2>Labs</h2></div><p class="lede">Zero keys. Nothing leaves the browser.</p><div class="grid-cards">${DATA.labs.map((l) => `<button class="lab-card" data-go="#/lab/${l.id}"><p class="meta">${esc(l.minutes)} min · ${esc(l.track)}</p><h3>${esc(l.title)}</h3><p>${esc(l.summary)}</p></button>`).join("")}</div>`;
  }

  function viewLab(id) {
    const meta = DATA.labs.find((l) => l.id === id);
    if (!meta) return `<p>Unknown lab.</p>`;
    if (!state.labs.includes(id)) {
      state.labs.push(id);
      if (state.labs.length >= 5) award("labs");
      save();
    }
    const body = LAB[id] ? LAB[id]() : `<p>This lab is not wired.</p>`;
    return `<p class="meta">Lab · ${esc(meta.track)}</p><div class="section-head"><h2>${esc(meta.title)}</h2><button class="ghost" data-go="#/labs">All labs</button></div><p>${esc(meta.summary)}</p>${body}`;
  }

  function field(label, id, value, type) {
    return `<label style="display:block;margin:8px 0">${esc(label)}<input id="${id}" type="${type || "text"}" value="${esc(value)}" style="display:block;width:100%;padding:8px;margin-top:4px;border-radius:10px;border:1px solid var(--line);background:var(--ink)"></label>`;
  }

  const LAB = {
    "flow-builder": flowBuilder,
    "call-path": callPath,
    "routing-designer": routingDesigner,
    "lambda-sim": lambdaSim,
    "ctr-inspector": ctrInspector,
    "erlang": erlangLab,
    "pricing": pricingLab,
    "iam-checker": iamLab,
    "webrtc": webrtcLab,
    "find-fault": faultLab,
    "translator": translatorLab,
    "hours-designer": hoursLab,
    "queue-priority": queueLab,
    "lex-mapper": lexLab,
    "saml-mapper": samlLab,
    "resiliency-drill": resiliencyLab,
    "quota-headroom": quotaLab,
    "cert-planner": certLab,
    "flow-log-reader": logLab,
    "ecosystem-map": ecoMapLab,
    "e911-checker": e911Lab,
    "wfm-adherence": wfmLab,
    "integration-hooks": hooksLab,
    "glossary-drill": glossDrill
  };

  let flowState = null;
  function flowBuilder() {
    const palette = ["Flow entry", "Set logging behavior", "Check hours of operation", "Get customer input", "AWS Lambda function", "Set contact attributes", "Set working queue", "Transfer to queue", "Play prompt", "Disconnect / hang up", "End flow / Resume"];
    flowState = { nodes: [{ uid: "n1", type: "Flow entry", x: 40, y: 40 }], edges: [], pending: null, seq: 2 };
    return `<p class="meta">Drag a block onto the canvas. Click a port, then click a port on the next block. Or load the sample.</p><div class="lab-layout">
      <div class="glass palette"><p class="meta">Palette</p>${palette.map((p) => `<button class="block-chip" draggable="true" data-pal="${esc(p)}">${esc(p)}</button>`).join("")}<button class="solid" id="load-sample">Load order-status sample</button></div>
      <div class="glass canvas-pane" id="canvas"></div>
      <div class="glass inspector"><p class="meta">Test call</p>
        <label>Hours <select id="sc-hours"><option value="in">In hours</option><option value="out">Out of hours</option></select></label>
        <label>DTMF <select id="sc-dtmf"><option>1</option><option>2</option><option>Timeout</option></select></label>
        <label>Lambda <select id="sc-lambda"><option>Success</option><option>Error</option><option>Timeout</option></select></label>
        <label>Queue <select id="sc-queue"><option>Staffed</option><option>At capacity</option></select></label>
        <button class="solid" id="run-flow">Run test call</button>
        <div class="log" id="flow-log">Connect a port, then run.</div>
      </div>
    </div>`;
  }
  const PORTS = {
    "Flow entry": ["Next"],
    "Set logging behavior": ["Success"],
    "Check hours of operation": ["In hours", "Out of hours"],
    "Get customer input": ["1", "2", "Timeout", "Error"],
    "AWS Lambda function": ["Success", "Error", "Timeout"],
    "Set contact attributes": ["Success"],
    "Set working queue": ["Success"],
    "Transfer to queue": ["At capacity", "Error"],
    "Play prompt": ["Success"],
    "Disconnect / hang up": [],
    "End flow / Resume": []
  };
  function paintFlow() {
    const c = $("#canvas");
    if (!c || !flowState) return;
    c.innerHTML = flowState.nodes.map((n) => `<div class="node" data-uid="${n.uid}" style="left:${n.x}px;top:${n.y}px"><strong>${esc(n.type)}</strong><div>${(PORTS[n.type] || ["Success"]).map((p) => `<button class="port" data-from="${n.uid}" data-port="${esc(p)}">${esc(p)}</button>`).join("")}</div></div>`).join("");
  }
  function runFlow() {
    const sc = { hours: $("#sc-hours").value, dtmf: $("#sc-dtmf").value, lambda: $("#sc-lambda").value, queue: $("#sc-queue").value };
    const log = [];
    let cur = flowState.nodes.find((n) => n.type === "Flow entry");
    const seen = new Set();
    for (let i = 0; i < 16 && cur; i++) {
      if (seen.has(cur.uid)) { log.push("Stopped a loop at " + cur.type); break; }
      seen.add(cur.uid);
      log.push("Ran " + cur.type);
      const ports = PORTS[cur.type] || [];
      if (!ports.length) { log.push("End of path."); break; }
      let port = ports[0];
      if (cur.type === "Check hours of operation") port = sc.hours === "in" ? "In hours" : "Out of hours";
      if (cur.type === "Get customer input") port = sc.dtmf;
      if (cur.type === "AWS Lambda function") port = sc.lambda;
      if (cur.type === "Transfer to queue" && sc.queue !== "At capacity") {
        log.push("Contact is queued. The agent whisper would play next.");
        break;
      }
      if (!ports.includes(port)) port = ports[0];
      const edge = flowState.edges.find((e) => e.from === cur.uid && e.port === port);
      if (!edge) { log.push("FAULT: no branch for " + port + " on " + cur.type); break; }
      cur = flowState.nodes.find((n) => n.uid === edge.to);
    }
    $("#flow-log").textContent = log.join("\n");
  }

  function callPath() {
    return `<div class="glass" style="padding:12px"><div class="flow-controls"><button class="solid" id="cp-play">Play</button><button class="ghost" id="cp-fail">Inject Lex fallback</button></div><div id="cp-svg"></div><div class="log" id="cp-log"></div></div>`;
  }
  const PATH = [
    ["PSTN", "Caller dials the claimed number."],
    ["Connect telephony", "The number is associated with a flow."],
    ["Flow", "Logging, hours, and Get customer input."],
    ["Lex V2", "Intent and slots return."],
    ["Queue", "Set working queue, then transfer."],
    ["Agent", "Whisper, then WebRTC media."]
  ];
  function paintPath(i, fail) {
    const steps = fail ? PATH.slice(0, 4).concat([["Fallback", "No intent. Branch to a person."]]) : PATH;
    $("#cp-svg").innerHTML = diagram({ type: "path", nodes: steps.map((s, n) => ({ id: String(n), label: n === i ? "▶ " + s[0] : s[0] })), caption: steps[i] ? steps[i][1] : "" });
    $("#cp-log").textContent = steps.slice(0, i + 1).map((s, n) => (n + 1) + "  " + s[0] + " — " + s[1]).join("\n");
  }

  function routingDesigner() {
    return `<div class="glass" style="padding:12px"><p>Add queues to a profile. Lower priority is offered first. Delay holds the profile back.</p>
      <div id="rq"></div><button class="solid" id="rq-add">Add queue row</button><button class="ghost" id="rq-run">Who is eligible now?</button>
      <label>Contact age in seconds <input id="rq-age" type="number" value="20"></label>
      <div class="log" id="rq-log"></div></div>`;
  }
  function lambdaSim() {
    return `<div class="glass" style="padding:12px"><label>Mode <select id="lm-mode"><option>Synchronous</option><option>Asynchronous</option></select></label>
      <label>Block timeout seconds <input id="lm-to" type="number" value="8"></label>
      <label>Validation <select id="lm-val"><option>STRING_MAP</option><option>JSON</option></select></label>
      <label>Function duration <input id="lm-dur" type="number" value="2"></label>
      <label>Return body<textarea id="lm-body" rows="6" style="width:100%">{"accountStatus":"open"}</textarea></label>
      <button class="solid" id="lm-run">Invoke</button><div class="log" id="lm-log"></div></div>`;
  }
  function ctrInspector() {
    const ctr = { ContactId: "11111111-2222-3333-4444-555555555555", Channel: "VOICE", InitiationMethod: "INBOUND", DisconnectReason: "CUSTOMER_DISCONNECT", Queue: { Name: "Orders", Duration: 42 }, Agent: { ConnectedToAgentTimestamp: "2026-10-14T15:04:11Z", AfterContactWorkDuration: 35 }, Attributes: { AccountId: "A-100" }, Recording: { Location: "s3://recordings/2026/10/14/example.wav" } };
    return `<div class="glass" style="padding:12px"><div class="log" id="ctr-json">${esc(JSON.stringify(ctr, null, 2))}</div><div id="ctr-fields">${Object.keys(flatten(ctr)).map((k) => `<button class="chip" data-ctr="${esc(k)}">${esc(k)}</button>`).join("")}</div><p id="ctr-help"></p></div>`;
  }
  function flatten(obj, prefix, out) {
    out = out || {};
    prefix = prefix || "";
    Object.keys(obj).forEach((k) => {
      const key = prefix ? prefix + "." + k : k;
      if (obj[k] && typeof obj[k] === "object") flatten(obj[k], key, out);
      else out[key] = obj[k];
    });
    return out;
  }
  function erlangLab() {
    return `<div class="glass" style="padding:12px"><p>Teaching form of Erlang C. Not a workforce contract.</p>
      ${field("Calls per hour", "er-c", "300", "number")}${field("AHT seconds", "er-a", "240", "number")}${field("Target answer seconds", "er-t", "20", "number")}${field("Service level target", "er-s", "0.8", "number")}${field("Shrinkage 0-0.9", "er-sh", "0.3", "number")}
      <button class="solid" id="er-run">Calculate</button><div id="er-out"></div></div>`;
  }
  function pricingLab() {
    return `<div class="glass" style="padding:12px"><p><strong>Estimate, 14 October 2026.</strong> US West (Oregon) DID worked-example rates from the public appendix. Not an invoice. Taxes and unlisted country rates are excluded. Toll-free per-minute telephony is not filled in, because the appendix sends you to the global table.</p>
      <label>Form <select id="pr-form"><option value="customer">Connect Customer</option><option value="basic">Customer Basic</option></select></label>
      ${field("Voice minutes", "pr-min", "1000", "number")}${field("Inbound DID minutes", "pr-in", "1000", "number")}${field("Outbound US minutes", "pr-out", "100", "number")}${field("DID days", "pr-days", "30", "number")}${field("Chat messages", "pr-chat", "0", "number")}${field("Emails", "pr-email", "0", "number")}
      <button class="solid" id="pr-run">Estimate</button><div id="pr-result"></div></div>`;
  }
  function iamLab() {
    return `<div class="glass" style="padding:12px"><p>Educational checker. It does not call AWS.</p>
      <button class="chip" data-policy="star">Broad connect:*</button><button class="chip" data-policy="ok">Instance-scoped</button><button class="chip" data-policy="voice">voiceid leftover</button>
      <textarea id="iam-body" rows="12" style="width:100%;margin-top:8px">{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"connect:*","Resource":"*"}]}</textarea>
      <button class="solid" id="iam-run">Check</button><div class="log" id="iam-log"></div></div>`;
  }
  function webrtcLab() {
    return `<div class="glass" style="padding:12px"><p>Toggle the conditions on the agent's path. The result quotes the admin guide's failure modes.</p>
      <label><input type="checkbox" id="w-udp" checked> UDP 3478 to TurnNlb allowed</label><br>
      <label><input type="checkbox" id="w-tcp" checked> TCP 443 to the instance and transport domains</label><br>
      <label><input type="checkbox" id="w-vpn"> Media forced through a VPN</label><br>
      <label><input type="checkbox" id="w-stateless"> Stateless firewall, ephemeral range closed</label><br>
      <label><input type="checkbox" id="w-dns" checked> DNS resolves TurnNlb</label>
      <button class="solid" id="w-run">Explain this path</button><div class="log" id="w-log"></div></div>`;
  }
  function faultLab() {
    const bank = (DATA.faults && DATA.faults.length) ? DATA.faults : DATA.errors;
    const item = bank[Math.floor(Math.random() * bank.length)];
    const opts = shuffle([item.fix].concat(DATA.errors.filter((e) => e.fix !== item.fix).slice(0, 3).map((e) => e.fix)), item.symptom);
    return `<div class="glass" style="padding:12px" id="fault-box" data-answer="${esc(item.fix)}"><p class="meta">Find the fault</p><h3>${esc(item.symptom)}</h3><p>${esc(item.detail)}</p>${opts.map((o) => `<button class="choice" data-fault="${esc(o)}">${esc(o)}</button>`).join("")}<div id="fault-why"></div><button class="ghost" id="fault-next">Another fault</button></div>`;
  }
  function translatorLab() {
    const platforms = [...new Set(DATA.bridge.map((b) => b.platform))];
    return `<div class="glass" style="padding:12px"><label>Platform <select id="tr-p">${platforms.map((p) => `<option>${esc(p)}</option>`).join("")}</select></label><div id="tr-out"></div></div>`;
  }
  function hoursLab() {
    return `<div class="glass" style="padding:12px"><p>Queue time zone is America/Los_Angeles in this exercise. Weekly open 08:00-18:00, Monday to Friday. Override: closed all day on 2026-12-25.</p>
      ${field("ISO local date-time", "hr-when", "2026-10-14T17:30")}<button class="solid" id="hr-run">Check hours</button><div class="log" id="hr-log"></div></div>`;
  }
  function queueLab() {
    return `<div class="glass" style="padding:12px"><p>One agent, two queues. Billing is priority 1 delay 0. Sales is priority 2 delay 30. A billing contact has waited 10s. A sales contact has waited 90s. The agent's profile includes both.</p><button class="solid" id="q-run">Who is offered?</button><div class="log" id="q-log"></div></div>`;
  }
  function lexLab() {
    return `<div class="glass" style="padding:12px"><label>Utterance <input id="lx-u" value="where is order 1234"></label><button class="solid" id="lx-run">Map</button><div class="log" id="lx-log"></div></div>`;
  }
  function samlLab() {
    return `<div class="glass" style="padding:12px">${field("Role", "sa-role", "Agent")}${field("Routing profile", "sa-route", "Basic")}${field("Security profile", "sa-sec", "Agent")}<button class="solid" id="sa-run">Evaluate assertion</button><div class="log" id="sa-log"></div></div>`;
  }
  function resiliencyLab() {
    return `<div class="glass" style="padding:12px"><label>Pair <select id="rs-pair"><option>us-east-1 / us-west-2</option><option>eu-central-1 / eu-west-2</option><option>ap-northeast-1 / ap-northeast-3</option><option>us-east-1 / eu-west-1</option></select></label>
      ${field("Telephony percent on source", "rs-pct", "100", "number")}<button class="solid" id="rs-run">Drill</button><div class="log" id="rs-log"></div></div>`;
  }
  function quotaLab() {
    const opts = DATA.quotas.slice(0, 8);
    return `<div class="glass" style="padding:12px"><label>Quota <select id="qq">${opts.map((q) => `<option value="${esc(q.name)}">${esc(q.name)}</option>`).join("")}</select></label>${field("Current usage", "qq-u", "8", "number")}<button class="solid" id="qq-run">Headroom</button><div class="log" id="qq-log"></div></div>`;
  }
  function certLab() {
    return `<div class="glass" style="padding:12px"><label>Role <select id="ce"><option>Admin</option><option>Architect</option><option>Developer</option><option>Network</option><option>AI</option></select></label><button class="solid" id="ce-run">Plan</button><div id="ce-out"></div></div>`;
  }
  function logLab() {
    return `<div class="glass" style="padding:12px"><div class="log">ContactId 11111111-2222-3333-4444-555555555555 BlockType InvokeExternalResource Results AccessDenied</div>
      <button class="choice" data-log="policy">The function's resource policy does not allow connect.amazonaws.com.</button>
      <button class="choice" data-log="timeout">The function timed out at 8 seconds.</button>
      <button class="choice" data-log="turn">UDP 3478 is blocked.</button><div id="log-why"></div></div>`;
  }
  function ecoMapLab() {
    const rows = [
      ["Salesforce", "Contact attribute", "Screen pop", "Blank pop if the attribute name differs"],
      ["ServiceNow", "Queue map", "AWA", "Two routers pick two agents"],
      ["Teams", "StartChatContact", "Chat only", "A SIP trunk does not implement the blog"],
      ["CUCM", "Transfer to phone number", "PSTN seam", "Attributes do not cross"],
      ["WFM", "Agent events", "Kinesis", "Blank adherence if the schedule is unpublished"],
      ["Recorder", "S3 or KVS", "Recording.Location", "Missing object if the block or the key failed"],
      ["E911", "CivicAddress", "Outbound whisper", "HQ address stored for a home agent"]
    ];
    return `<div class="glass" style="padding:12px"><table><thead><tr><th>System</th><th>Key</th><th>Seam</th><th>First fault</th></tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table><p class="caption">Producer is Connect unless the row says otherwise. The key is what you must store.</p></div>`;
  }
  function e911Lab() {
    return `<div class="glass" style="padding:12px"><p>US East, US West, and GovCloud US-West only. Score the design. Do not place a real 911 call.</p>
      <label><input type="checkbox" id="e1"> Region is us-east-1, us-west-2, or GovCloud US-West</label><br>
      <label><input type="checkbox" id="e2"> Address validated and stored on the agent profile</label><br>
      <label><input type="checkbox" id="e3"> Outbound whisper sets CivicAddress for 911 and 933</label><br>
      <label><input type="checkbox" id="e4"> Test plan uses 933, not 911</label><br>
      <label><input type="checkbox" id="e5"> A task notifies security</label><br>
      <label><input type="checkbox" id="e6" > Direct dial only. Nobody transfers a live customer call to 911</label>
      <button class="solid" id="e-run">Score</button><div class="log" id="e-log"></div></div>`;
  }
  function wfmLab() {
    return `<div class="glass" style="padding:12px"><p>Schedule: 09:00-17:00 available, except 12:00-12:30 break. Enter minutes in each actual state.</p>
      ${field("Available minutes inside the shift", "wf-a", "390", "number")}${field("On-contact minutes", "wf-c", "0", "number")}${field("Break minutes", "wf-b", "30", "number")}${field("Unplanned offline minutes", "wf-o", "30", "number")}
      <button class="solid" id="wf-run">Adherence</button><div class="log" id="wf-log"></div></div>`;
  }
  function hooksLab() {
    return `<div class="glass" style="padding:12px"><label>Need <select id="hk"><option value="pop">Screen pop</option><option value="wfm">Real-time adherence</option><option value="qm">Live recording</option><option value="bot">A tool call from a flow</option><option value="case">Case sync</option></select></label><button class="solid" id="hk-run">Which hook?</button><div class="log" id="hk-log"></div></div>`;
  }
  function glossDrill() {
    const g = DATA.glossary[Math.floor(Math.random() * DATA.glossary.length)];
    const opts = shuffle([g.term].concat(DATA.glossary.filter((x) => x.term !== g.term).slice(0, 3).map((x) => x.term)), g.meaning);
    return `<div class="glass" style="padding:12px" data-answer="${esc(g.term)}"><p>${esc(g.meaning)}</p>${opts.map((o) => `<button class="choice" data-gloss="${esc(o)}">${esc(o)}</button>`).join("")}<div id="gloss-why"></div></div>`;
  }

  function shuffle(arr, seed) {
    const copy = arr.slice();
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) >>> 0;
    for (let i = copy.length - 1; i > 0; i--) {
      h = (h * 1664525 + 1013904223) >>> 0;
      const j = h % (i + 1);
      const tmp = copy[i]; copy[i] = copy[j]; copy[j] = tmp;
    }
    return copy;
  }

  let quizIndex = 0;
  let quizPool = [];
  function viewQuiz(track) {
    quizPool = DATA.quiz.filter((q) => !track || q.track === track);
    quizIndex = 0;
    return `<div class="section-head"><h2>Quiz</h2></div><p class="meta" id="quiz-score">Answered ${state.quiz.answered}, correct ${state.quiz.correct}</p><div id="quiz-body">${quizCard()}</div>`;
  }
  function quizCard() {
    const q = quizPool[quizIndex % quizPool.length];
    if (!q) return `<p>No questions in this slice.</p>`;
    return `<article class="glass" style="padding:16px" data-qi="${q.id}"><p class="meta">${esc(q.track)} · ${quizIndex + 1} of ${quizPool.length}</p><h3>${esc(q.q)}</h3>${q.choices.map((c, i) => `<button class="choice" data-choice="${i}">${esc(c)}</button>`).join("")}<div id="quiz-why"></div><button class="ghost" id="quiz-next">Next</button></article>`;
  }

  let cardIndex = 0;
  let cardShow = false;
  function viewCards() {
    cardIndex = 0; cardShow = false;
    return `<div class="section-head"><h2>Flashcards</h2><p class="meta">Known ${state.cards.known.length} / ${DATA.cards.length}</p></div><div id="card-body">${cardFace()}</div>`;
  }
  function cardFace() {
    const c = DATA.cards[cardIndex % DATA.cards.length];
    return `<button class="glass flip" id="flip">${cardShow ? esc(c.back) + " — " + esc(c.source) : esc(c.front)}</button><p><button class="ghost" id="card-again">Again</button><button class="solid" id="card-known">Know it</button></p>`;
  }

  function viewScenarios() {
    return `<div class="section-head"><h2>Walkthroughs</h2></div><div class="grid-cards">${DATA.scenarios.map((s) => `<button class="card" data-go="#/scenario/${s.id}"><p class="meta">${esc(s.track)}</p><h3>${esc(s.title)}</h3><p>${esc(s.brief)}</p><p class="meta">${s.steps.length} steps</p></button>`).join("")}</div>`;
  }
  function viewScenario(id) {
    const s = DATA.scenarios.find((x) => x.id === id);
    if (!s) return `<p>Unknown walkthrough.</p>`;
    const step = state.scenario[id] || 0;
    const cur = s.steps[Math.min(step, s.steps.length - 1)];
    if (step >= s.steps.length) award("scenario");
    save();
    return `<div class="section-head"><h2>${esc(s.title)}</h2></div><p>${esc(s.brief)}</p>${diagram({ type: "path", nodes: s.steps.map((st, i) => ({ id: String(i), label: (i === step ? "▶ " : "") + st.title })), caption: cur.body })}<p class="why"><strong>Step ${Math.min(step, s.steps.length - 1) + 1}.</strong> ${esc(cur.body)}</p><button class="solid" id="sc-next" data-sid="${esc(id)}">${step + 1 >= s.steps.length ? "Finish" : "Next step"}</button>`;
  }

  function onClick(ev) {
    const goBtn = ev.target.closest("[data-go]");
    if (goBtn) { go(goBtn.getAttribute("data-go")); return; }
    if (ev.target.id === "menu") $("#rail").classList.toggle("open");
    if (ev.target.id === "open-search" || ev.target.closest("[data-search]")) openSearch();
    if (ev.target.id === "speak" || ev.target.id === "player-play") speak(audio.text, audio.title);
    if (ev.target.id === "player-clip") playClip($("#clip-pick").value);
    if (ev.target.dataset.clip) playClip(ev.target.dataset.clip);
    if (ev.target.id === "player-stop") stopSpeak();
    if (ev.target.id === "flow-step") stepFlow(1);
    if (ev.target.id === "flow-play") playFlow();
    if (ev.target.closest(".mind-node")) {
      const name = ev.target.closest(".mind-node").getAttribute("data-mind");
      const cap = $("#mind-cap");
      if (cap) cap.textContent = name + " attaches to the contact with a key you can name. Open the matching Ecosystem lesson.";
    }
    if (ev.target.dataset.kind) {
      document.querySelectorAll("[data-kind]").forEach((b) => b.setAttribute("aria-pressed", b === ev.target ? "true" : "false"));
      const k = ev.target.dataset.kind;
      $("#time-list").innerHTML = timelineItems(k === "All" ? DATA.timeline : DATA.timeline.filter((t) => t.kind === k));
    }
    if (ev.target.id === "run-flow") runFlow();
    if (ev.target.id === "load-sample") loadSample();
    const port = ev.target.closest(".port");
    if (port && flowState) {
      if (!flowState.pending) flowState.pending = { from: port.dataset.from, port: port.dataset.port };
      else {
        flowState.edges.push({ from: flowState.pending.from, port: flowState.pending.port, to: port.dataset.from });
        flowState.pending = null;
        $("#flow-log").textContent = flowState.edges.map((e) => e.from + " " + e.port + " -> " + e.to).join("\n");
      }
    }
    if (ev.target.id === "cp-play") playPath(false);
    if (ev.target.id === "cp-fail") playPath(true);
    if (ev.target.id === "lm-run") runLambda();
    if (ev.target.id === "er-run") runErlang();
    if (ev.target.id === "pr-run") runPrice();
    if (ev.target.id === "iam-run") runIam();
    if (ev.target.dataset.policy) loadPolicy(ev.target.dataset.policy);
    if (ev.target.id === "w-run") runWebrtc();
    if (ev.target.dataset.fault) gradeFault(ev.target.dataset.fault);
    if (ev.target.id === "fault-next") { $("#stage").innerHTML = viewLab("find-fault"); }
    if (ev.target.id === "tr-p" || ev.target.closest("#tr-p")) paintTranslator();
    if (ev.target.id === "hr-run") runHours();
    if (ev.target.id === "q-run") $("#q-log").textContent = "Billing is eligible immediately and has the better priority. Offer Billing, even though Sales has waited longer. Delay has not expired for a reserve team. Longest-wait applies only among contacts this profile may take.";
    if (ev.target.id === "lx-run") runLex();
    if (ev.target.id === "sa-run") runSaml();
    if (ev.target.id === "rs-run") runRes();
    if (ev.target.id === "qq-run") runQuota();
    if (ev.target.id === "ce-run") runCert();
    if (ev.target.dataset.log) $("#log-why").textContent = ev.target.dataset.log === "policy" ? "Correct. AccessDenied with an empty Lambda log is the resource policy or the instance association." : "That symptom would look different. AccessDenied is permission, not TURN and not duration.";
    if (ev.target.id === "e-run") runE911();
    if (ev.target.id === "wf-run") runWfm();
    if (ev.target.id === "hk-run") runHook();
    if (ev.target.dataset.gloss) {
      const box = ev.target.closest("[data-answer]");
      $("#gloss-why").textContent = ev.target.dataset.gloss === box.dataset.answer ? "Correct." : "The term is " + box.dataset.answer + ".";
    }
    if (ev.target.dataset.ctr) {
      const help = { ContactId: "Join key for the flow log, recording, and agent event.", "Queue.Duration": "Wait clock used in most service-level definitions.", "Agent.AfterContactWorkDuration": "ACW. Occupancy needs it.", "Recording.Location": "Empty means recording was off or the write failed.", Channel: "Do not assume voice.", DisconnectReason: "Read this before you blame the carrier." };
      $("#ctr-help").textContent = help[ev.target.dataset.ctr] || "Field on the contact trace record. Keep it in the warehouse if a later report will ask.";
    }
    if (ev.target.dataset.choice != null && ev.target.closest("[data-qi]")) gradeQuiz(ev.target);
    if (ev.target.id === "quiz-next") { quizIndex++; $("#quiz-body").innerHTML = quizCard(); }
    if (ev.target.id === "flip") { cardShow = !cardShow; $("#card-body").innerHTML = cardFace(); }
    if (ev.target.id === "card-known" || ev.target.id === "card-again") {
      const c = DATA.cards[cardIndex % DATA.cards.length];
      if (ev.target.id === "card-known" && !state.cards.known.includes(c.id)) state.cards.known.push(c.id);
      cardIndex++; cardShow = false; save(); $("#card-body").innerHTML = cardFace();
    }
    if (ev.target.id === "sc-next") {
      const id = ev.target.dataset.sid;
      state.scenario[id] = (state.scenario[id] || 0) + 1;
      save(); render();
    }
    if (ev.target.id === "rq-add") addRouteRow();
    if (ev.target.id === "rq-run") runRoutes();
    if (ev.target.dataset.theme) { state.theme = ev.target.dataset.theme; save(); render(); }
  }

  let flowIndex = 0;
  function stepFlow(n) {
    const l = lessonBy(route.id);
    if (!l) return;
    flowIndex = (flowIndex + n + l.flow.length) % l.flow.length;
    drawFlow(flowIndex);
  }
  function playFlow() {
    if (reduced) { stepFlow(0); drawFlow(0); return; }
    clearInterval(flowPlay);
    flowIndex = 0;
    drawFlow(0);
    flowPlay = setInterval(() => { flowIndex++; const l = lessonBy(route.id); if (!l || flowIndex >= l.flow.length) { clearInterval(flowPlay); return; } drawFlow(flowIndex); }, 900);
  }

  function speak(text, title) {
    audio.title = title || audio.title;
    $("#player-title").textContent = audio.title;
    if (!window.speechSynthesis) { $("#player-state").textContent = "This browser has no speech synthesis. Read the transcript in the lesson."; return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.onend = () => { $("#player-state").textContent = "Idle"; };
    window.speechSynthesis.speak(u);
    $("#player-state").textContent = reduced ? "Speaking" : "Speaking";
    drawWave();
  }
  function stopSpeak() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    $("#player-state").textContent = "Stopped";
  }
  function drawWave() {
    const c = $("#wave");
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "#3dcfb4";
    ctx.beginPath();
    for (let x = 0; x < c.width; x++) {
      const y = 18 + Math.sin(x / 8) * (reduced ? 2 : 10);
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function loadSample() {
    flowState.nodes = [
      { uid: "n1", type: "Flow entry", x: 30, y: 30 },
      { uid: "n2", type: "Set logging behavior", x: 220, y: 30 },
      { uid: "n3", type: "Check hours of operation", x: 420, y: 30 },
      { uid: "n4", type: "Get customer input", x: 220, y: 180 },
      { uid: "n5", type: "Play prompt", x: 420, y: 180 },
      { uid: "n6", type: "Set working queue", x: 30, y: 320 },
      { uid: "n7", type: "Transfer to queue", x: 220, y: 320 },
      { uid: "n8", type: "Disconnect / hang up", x: 420, y: 320 }
    ];
    flowState.edges = [
      { from: "n1", port: "Next", to: "n2" },
      { from: "n2", port: "Success", to: "n3" },
      { from: "n3", port: "In hours", to: "n4" },
      { from: "n3", port: "Out of hours", to: "n5" },
      { from: "n4", port: "1", to: "n6" },
      { from: "n5", port: "Success", to: "n8" },
      { from: "n6", port: "Success", to: "n7" }
    ];
    paintFlow();
    $("#flow-log").textContent = "Sample loaded. Press 1 in hours to reach the queue. Out of hours plays a prompt and disconnects. Press 2 to see the missing branch.";
  }

  let pathTimer = null;
  function playPath(fail) {
    clearInterval(pathTimer);
    let i = 0;
    const max = fail ? 5 : 6;
    paintPath(0, fail);
    if (reduced) return;
    pathTimer = setInterval(() => { i++; if (i >= max) { clearInterval(pathTimer); return; } paintPath(i, fail); }, 800);
  }

  function runLambda() {
    const mode = $("#lm-mode").value;
    const timeout = Number($("#lm-to").value);
    const dur = Number($("#lm-dur").value);
    const validation = $("#lm-val").value;
    let body;
    try { body = JSON.parse($("#lm-body").value); } catch (err) { $("#lm-log").textContent = "Invalid JSON. The flow takes Error."; return; }
    const cap = mode === "Synchronous" ? Math.min(timeout, 8) : Math.min(timeout, 60);
    if (mode === "Synchronous" && timeout > 8) {
      $("#lm-log").textContent = "Synchronous timeout cannot exceed 8 seconds. Connect will not wait " + timeout + "s.";
      return;
    }
    if (dur > cap) { $("#lm-log").textContent = "Duration " + dur + "s exceeds the block wait of " + cap + "s. Branch: " + (mode === "Synchronous" ? "Timeout" : "the Wait you configured") + "."; return; }
    const flat = Object.values(body).every((v) => typeof v === "string") && Object.values(body).every((v) => typeof v !== "object");
    if (validation === "STRING_MAP" && !flat) { $("#lm-log").textContent = "STRING_MAP requires a flat object of strings. Branch: Error."; return; }
    $("#lm-log").textContent = "Branch: Success. Attributes available to the next block:\n" + JSON.stringify(body, null, 2);
  }

  function erlangB(a, n) {
    let b = 1;
    for (let k = 1; k <= n; k++) b = (a * b) / (k + a * b);
    return b;
  }
  function erlangC(a, n) {
    if (n <= a) return 1;
    const b = erlangB(a, n);
    const c = b / (1 - (a / n) * (1 - b));
    return Math.min(1, Math.max(0, c));
  }
  function runErlang() {
    const calls = Number($("#er-c").value);
    const aht = Number($("#er-a").value);
    const target = Number($("#er-t").value);
    const slTarget = Number($("#er-s").value);
    const shrink = Math.min(0.9, Math.max(0, Number($("#er-sh").value)));
    const a = calls * (aht / 3600);
    let n = Math.ceil(a) + 1;
    let sl = 0;
    for (; n < a + 400; n++) {
      const c = erlangC(a, n);
      sl = n > a ? 1 - c * Math.exp(-(n - a) * (target / aht)) : 0;
      if (sl >= slTarget) break;
    }
    const roster = Math.ceil(n / (1 - shrink));
    $("#er-out").innerHTML = `<p class="num">${roster}</p><p>Raw agents ${n} at traffic ${a.toFixed(2)} Erlangs. Service level ${(sl * 100).toFixed(1)}%. Shrinkage lifts the roster to ${roster}. Formula: Erlang C wait probability, then 1 − C·e^{−(N−A)·t/AHT}.</p>`;
  }

  function runPrice() {
    const customer = $("#pr-form").value === "customer";
    const voice = customer ? 0.038 : 0.018;
    const chat = customer ? 0.010 : 0.004;
    const email = customer ? 0.080 : 0.050;
    const minutes = Number($("#pr-min").value);
    const inbound = Number($("#pr-in").value);
    const outbound = Number($("#pr-out").value);
    const days = Number($("#pr-days").value);
    const chats = Number($("#pr-chat").value);
    const emails = Number($("#pr-email").value);
    const lines = [
      ["Voice service", minutes * voice],
      ["US DID inbound telephony", inbound * 0.0022],
      ["US outbound telephony", outbound * 0.0048],
      ["DID daily", days * 0.03],
      ["Chat", chats * chat],
      ["Email", emails * email]
    ];
    const total = lines.reduce((s, r) => s + r[1], 0);
    $("#pr-result").innerHTML = `<p class="num">$${total.toFixed(2)}</p><p>Estimate dated 14 October 2026. ${customer ? "Connect Customer" : "Customer Basic"}. US DID telephony from the Oregon worked example. Excludes tax, surcharges, and any toll-free per-minute rate.</p><table>${lines.map((r) => `<tr><td>${r[0]}</td><td>$${r[1].toFixed(2)}</td></tr>`).join("")}</table>`;
  }

  function loadPolicy(kind) {
    const samples = {
      star: '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"connect:*","Resource":"*"}]}',
      ok: '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["connect:DescribeInstance","connect:ListQueues"],"Resource":"arn:aws:connect:us-west-2:123456789012:instance/example"}]}',
      voice: '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"voiceid:*","Resource":"*"}]}'
    };
    $("#iam-body").value = samples[kind];
  }
  function runIam() {
    let doc;
    try { doc = JSON.parse($("#iam-body").value); } catch (err) { $("#iam-log").textContent = "Not JSON."; return; }
    const findings = [];
    const statements = [].concat(doc.Statement || []);
    statements.forEach((st) => {
      const actions = [].concat(st.Action || []);
      const resources = [].concat(st.Resource || []);
      actions.forEach((a) => {
        if (a === "connect:*" || a === "*") findings.push("Action " + a + " is broader than an operator needs.");
        if (String(a).startsWith("voiceid:")) findings.push("voiceid is a retired feature as of 20 May 2026. Do not grant it for a new design.");
      });
      if (resources.includes("*")) findings.push("Resource * is not limited to one instance.");
      if (!st.Condition && resources.includes("*")) findings.push("No condition and a wildcard resource.");
    });
    if (!findings.length) findings.push("No broad-action findings. Still confirm the resource is the instance you mean, and that Lambda's resource policy is separate.");
    $("#iam-log").textContent = findings.join("\n");
  }

  function runWebrtc() {
    const notes = [];
    if (!$("#w-udp").checked) notes.push("UDP 3478 blocked. Expect: failed to establish softphone, TurnNlb, ice_collection_timeout.");
    if (!$("#w-tcp").checked) notes.push("TCP 443 blocked. The CCP UI and signaling will not load.");
    if ($("#w-vpn").checked) notes.push("VPN on the media path. The guide asks for a direct path. Expect jitter, drops, or one-way audio.");
    if ($("#w-stateless").checked) notes.push("Stateless firewall without the ephemeral range. Return media is dropped.");
    if (!$("#w-dns").checked) notes.push("DNS failure. The browser cannot resolve TurnNlb, so ICE never collects candidates.");
    if (!notes.length) notes.push("This path matches Option 1: domains on 443 and UDP 3478, no VPN, DNS working. Still run more than 200 calls and watch for an error rate above 2 percent.");
    $("#w-log").textContent = notes.join("\n");
  }

  function gradeFault(choice) {
    const box = $("#fault-box");
    const ok = choice === box.dataset.answer;
    $("#fault-why").innerHTML = `<p>${ok ? "Correct." : "Not that fix."} ${esc(box.dataset.answer)}</p>`;
  }
  function paintTranslator() {
    const sel = $("#tr-p");
    if (!sel) return;
    const rows = DATA.bridge.filter((b) => b.platform === sel.value);
    $("#tr-out").innerHTML = `<table><thead><tr><th>Old</th><th>Connect</th><th>Pitfall</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${esc(r.old)}</td><td>${esc(r.next)}</td><td>${esc(r.pitfall)}</td></tr>`).join("")}</tbody></table>`;
  }
  function runHours() {
    const raw = $("#hr-when").value;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) { $("#hr-log").textContent = "Unreadable date."; return; }
    const day = d.getDay();
    const mins = d.getHours() * 60 + d.getMinutes();
    const holiday = raw.startsWith("2026-12-25");
    const open = !holiday && day >= 1 && day <= 5 && mins >= 8 * 60 && mins < 18 * 60;
    $("#hr-log").textContent = open ? "In hours. Check hours takes the In hours branch." : "Out of hours. " + (holiday ? "Holiday override." : "Outside Monday-Friday 08:00-18:00 in the queue zone.") + " Do not transfer into a queue you have not staffed.";
  }
  function runLex() {
    const u = $("#lx-u").value.toLowerCase();
    let intent = "Fallback";
    const slots = {};
    if (u.includes("order")) { intent = "OrderStatus"; const m = u.match(/\d+/); if (m) slots.OrderId = m[0]; }
    else if (u.includes("agent") || u.includes("person")) intent = "Agent";
    $("#lx-log").textContent = "Intent " + intent + "\nSlots " + JSON.stringify(slots) + "\nAttributes to copy: LexIntent=" + intent + (slots.OrderId ? ", OrderId=" + slots.OrderId : "") + "\nFallback goes to a queue, not another loop.";
  }
  function runSaml() {
    const role = $("#sa-role").value.trim();
    const route = $("#sa-route").value.trim();
    const sec = $("#sa-sec").value.trim();
    const missing = [];
    if (!role) missing.push("role");
    if (!route) missing.push("routing profile");
    if (!sec) missing.push("security profile");
    $("#sa-log").textContent = missing.length ? "Sign-in can succeed and still be useless. Missing: " + missing.join(", ") + "." : "Assertion has the three required mappings. Place one test call before you federate the group. Confirm the routing profile includes the queue.";
  }
  function runRes() {
    const pair = $("#rs-pair").value;
    const pct = Number($("#rs-pct").value);
    const bad = pair.includes("eu-west-1");
    const lines = [];
    if (bad) lines.push("That pair is not a documented Global Resiliency pair. AWS supports Virginia/Oregon, Frankfurt/London, and Tokyo/Osaka.");
    else lines.push("Pair is supported. Source telephony at " + pct + " percent, replica at " + (100 - pct) + " percent.");
    if (pct % 10 !== 0) lines.push("Distribution moves in 10 percent steps.");
    if (pair.startsWith("ap-northeast-1")) lines.push("Osaka is the replica. Inbound delivery can take up to 20 seconds. Only numbers enabled for Global Resiliency fully replicate.");
    lines.push("A drill places a call, reads the CTR, shifts 10 percent, and places another call. Lambda and Lex must exist in both Regions.");
    $("#rs-log").textContent = lines.join("\n");
  }
  function runQuota() {
    const name = $("#qq").value;
    const row = DATA.quotas.find((q) => q.name === name);
    const used = Number($("#qq-u").value);
    const match = row && String(row.value).match(/\d+/);
    const cap = match ? Number(match[0]) : 0;
    const pct = cap ? Math.round((used / cap) * 100) : 0;
    $("#qq-log").textContent = row.name + " default text: " + row.value + ".\nUsage " + used + " is about " + pct + "% of the first number in that default.\n" + (pct >= 80 ? "At or above 80 percent. Request a raise. Large raises can take three weeks." : "Under 80 percent. Still confirm the applied quota. New accounts can be lower than the documented default.") + "\nAdjustable: " + row.adjustable + ".";
  }
  function runCert() {
    const role = $("#ce").value;
    const plans = {
      Admin: "Cloud Practitioner for vocabulary, then the Amazon Connect Fundamentals badge (80 percent). Communications Specialist if you own telephony and flows. There is no Connect specialty exam.",
      Architect: "Solutions Architect - Associate is the exam that matches the surrounding AWS design. Security - Specialty if you own IAM and KMS. Advanced Networking - Specialty retires 31 December 2026.",
      Developer: "Developer - Associate, then the Amazon Connect Developer badge: CLI, API, Lambda, Kinesis, EventBridge, CloudFormation.",
      Network: "The CCP path is the work: domains, UDP 3478, no VPN on media. Advanced Networking - Specialty is the broad exam and it retires 31 December 2026.",
      AI: "AI Practitioner for concepts. Amazon Connect AI Fundamentals for assist and conversational analytics. The badge is not a certification exam."
    };
    $("#ce-out").innerHTML = `<p>${esc(plans[role])}</p><p class="cite"><a href="https://aws.amazon.com/certification/">AWS Certification catalog</a></p>`;
  }
  function runE911() {
    const ids = ["e1", "e2", "e3", "e4", "e5", "e6"];
    const missing = ids.filter((id) => !$("#" + id).checked);
    const labels = { e1: "Region", e2: "Validated address", e3: "CivicAddress whisper", e4: "933 test", e5: "Security task", e6: "Direct dial only" };
    $("#e-log").textContent = missing.length ? "Not ready: " + missing.map((id) => labels[id]).join(", ") + "." : "The checklist matches the US emergency-calling pages. Still confirm the origination number can be called back, and do not use the headquarters address for a home agent.";
  }
  function runWfm() {
    const planned = 450;
    const unplanned = Number($("#wf-o").value);
    const adherence = Math.max(0, (planned - unplanned) / planned);
    $("#wf-log").textContent = "Planned in-adherence minutes are the 7.5 hour shift excluding the 30 minute break, so 450.\nUnplanned offline " + unplanned + " minutes.\nAdherence " + (adherence * 100).toFixed(1) + "%.\nThis is a teaching ratio. Your WFM tool's definition may exclude on-contact time differently. Agent events are the actuals. A published schedule is the plan. Without the stream, you only have a story.";
  }
  function runHook() {
    const map = {
      pop: "Hook: contact attribute plus a workspace view or Streams event on connecting. Key: ContactId and your customer id.",
      wfm: "Hook: agent event stream. Do not poll the real-time page.",
      qm: "Hook: S3 recording plus CTR, or Start media streaming to Kinesis Video if the tool must hear the live call.",
      bot: "Hook: External Tool through AgentCore, or Lambda if you already own the function. Mind the 8-second sync cap.",
      case: "Hook: Cases block and the case id attribute. Event the case if a second system must subscribe."
    };
    $("#hk-log").textContent = map[$("#hk").value];
  }

  let routeRows = [{ name: "Billing", priority: 1, delay: 0 }];
  function addRouteRow() {
    routeRows.push({ name: "Queue " + (routeRows.length + 1), priority: 2, delay: 30 });
    paintRoutes();
  }
  function paintRoutes() {
    const host = $("#rq");
    if (!host) return;
    host.innerHTML = routeRows.map((r, i) => `<div>${field("Name", "rn" + i, r.name)}${field("Priority", "rp" + i, r.priority, "number")}${field("Delay seconds", "rd" + i, r.delay, "number")}</div>`).join("");
  }
  function runRoutes() {
    routeRows = routeRows.map((r, i) => ({ name: $("#rn" + i).value, priority: Number($("#rp" + i).value), delay: Number($("#rd" + i).value) }));
    const age = Number($("#rq-age").value);
    const eligible = routeRows.filter((r) => age >= r.delay).sort((a, b) => a.priority - b.priority);
    $("#rq-log").textContent = eligible.length ? "Eligible, best priority first: " + eligible.map((r) => r.name + " (priority " + r.priority + ")").join(", ") + "." : "No queue is eligible yet. The contact is still inside every delay.";
  }

  function gradeQuiz(button) {
    const card = button.closest("[data-qi]");
    const q = DATA.quiz.find((item) => item.id === card.dataset.qi);
    const choice = Number(button.dataset.choice);
    const ok = choice === q.answer;
    if (!state.quiz.seen[q.id]) {
      state.quiz.seen[q.id] = true;
      state.quiz.answered++;
      if (ok) state.quiz.correct++;
      if (state.quiz.correct >= 20) award("quiz");
      save();
    }
    card.querySelectorAll(".choice").forEach((el, i) => {
      if (i === q.answer) el.classList.add("good");
      else if (i === choice) el.classList.add("bad");
    });
    $("#quiz-why").innerHTML = `<p>${ok ? "Correct." : "The better answer is marked."} ${esc(q.why)}</p><p class="cite"><a href="${esc(q.url)}">${esc(q.source)}</a></p>`;
    $("#quiz-score").textContent = "Answered " + state.quiz.answered + ", correct " + state.quiz.correct;
  }

  function openSearch() {
    $("#search-modal").hidden = false;
    $("#q").value = "";
    $("#hits").innerHTML = "";
    $("#q").focus();
  }
  function search(query) {
    const n = query.trim().toLowerCase();
    if (!n) { $("#hits").innerHTML = ""; return; }
    const hits = [];
    DATA.lessons.forEach((l) => { if ((l.title + l.why + l.paras.join(" ")).toLowerCase().includes(n)) hits.push({ href: "#/lesson/" + l.id, label: l.title, meta: "Lesson" }); });
    DATA.labs.forEach((l) => { if ((l.title + l.summary).toLowerCase().includes(n)) hits.push({ href: "#/lab/" + l.id, label: l.title, meta: "Lab" }); });
    DATA.glossary.forEach((g) => { if ((g.term + g.meaning).toLowerCase().includes(n)) hits.push({ href: "#/glossary", label: g.term, meta: "Glossary" }); });
    DATA.quiz.slice(0, 80).forEach((q) => { if (q.q.toLowerCase().includes(n)) hits.push({ href: "#/quiz/" + q.track, label: q.q, meta: "Quiz" }); });
    $("#hits").innerHTML = hits.slice(0, 20).map((h) => `<button class="hit" data-go="${h.href}"><strong>${esc(h.label)}</strong><br><span class="meta">${esc(h.meta)}</span></button>`).join("") || `<p>No matches.</p>`;
  }

  document.addEventListener("click", onClick);
  window.addEventListener("hashchange", render);
  document.addEventListener("keydown", (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "k") { ev.preventDefault(); openSearch(); }
    if (ev.key === "Escape") $("#search-modal").hidden = true;
  });
  $("#q").addEventListener("input", (ev) => search(ev.target.value));
  document.body.addEventListener("input", (ev) => { if (ev.target.id === "gloss-q") $("#gloss-list").innerHTML = glossaryList(ev.target.value); });
  document.body.addEventListener("change", (ev) => { if (ev.target.id === "tr-p") paintTranslator(); });
  document.body.addEventListener("dragstart", (ev) => { if (ev.target.dataset.pal) ev.dataTransfer.setData("text/plain", ev.target.dataset.pal); });
  document.body.addEventListener("dragover", (ev) => { if (ev.target.id === "canvas" || ev.target.closest("#canvas")) ev.preventDefault(); });
  document.body.addEventListener("drop", (ev) => {
    const canvas = ev.target.id === "canvas" ? ev.target : ev.target.closest("#canvas");
    if (!canvas || !flowState) return;
    ev.preventDefault();
    const type = ev.dataTransfer.getData("text/plain");
    if (!type) return;
    const rect = canvas.getBoundingClientRect();
    flowState.nodes.push({ uid: "n" + flowState.seq++, type, x: ev.clientX - rect.left - 40, y: ev.clientY - rect.top - 20 });
    paintFlow();
  });

  $("#player-title").textContent = audio.title;
  const clipPick = $("#clip-pick");
  if (clipPick && DATA.audio) {
    clipPick.innerHTML = DATA.audio.map((a) => `<option value="${esc(a.id)}">${esc(a.title)}</option>`).join("");
  }
  render();
  const boot = lessonBy(route.id);
  if (route.view === "lesson" && boot) drawFlow(0);
  if (route.view === "lab" && route.id === "flow-builder") paintFlow();
  if (route.view === "lab" && route.id === "routing-designer") paintRoutes();
  if (route.view === "lab" && route.id === "translator") paintTranslator();
  window.addEventListener("hashchange", () => {
    if (route.view === "lesson") { flowIndex = 0; drawFlow(0); }
    if (parseHash().view === "lab" && parseHash().id === "flow-builder") paintFlow();
    if (parseHash().view === "lab" && parseHash().id === "routing-designer") { routeRows = [{ name: "Billing", priority: 1, delay: 0 }]; paintRoutes(); }
    if (parseHash().view === "lab" && parseHash().id === "translator") paintTranslator();
  });
})();
