import {
  FLOW_DOCS, PALETTE, PORTS, exportFlow, importFlow, sampleOrderStatus, wireMissing,
} from "./flowlang.js";
import {
  KONAMI, answerDaily, answerPort, shareCard, tickMascot, viewCareer, viewCheats, viewDaily, viewExplorer, viewPorts, viewSyllabus,
} from "./studio.js";
import { animate } from "./vendor/anime.esm.min.js";
import d3 from "./vendor/d3.entry.js";
import rough from "./vendor/rough.esm.js";
import burst from "./vendor/confetti.module.mjs";
import { applyLanguage, lessonHeading, LANGS } from "./i18n.js";
import { bodyNote, lessonBody } from "./lesson-bodies.js";
import { mountIcons } from "./icons.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const KEY = "acl-campus-v1";
const THEMES = [
  ["dark", "Night ops", "Amber and mint on a deep field.", "#0b1120", "#ffb020", "#2dd4bf"],
  ["light", "Light", "Ink on paper.", "#f8fafc", "#9a3412", "#0f766e"],
  ["futuristic", "Futuristic", "Cyan glass on a night grid.", "#050816", "#00e5ff", "#7c5cff"],
  ["gaming", "Gaming", "Lime and magenta, sharp corners.", "#0a0614", "#39ff14", "#ff2bd6"],
  ["neon", "Neon", "Hot pink and electric cyan.", "#07010f", "#ff2d95", "#22e7ff"],
  ["holographic", "Holographic", "Teal glass and violet haze.", "#03141c", "#5eead4", "#a78bfa"],
  ["cyberpunk", "Cyberpunk", "Yellow, crimson, and cyan.", "#140014", "#fcee0a", "#ff003c"],
  ["sunset", "Sunset", "Coral, magenta, and gold.", "#1c0c16", "#ff7a3c", "#ff2d7b"],
  ["contrast", "High contrast", "Yellow on black.", "#000000", "#ffe14a", "#ffffff"],
  ["console", "Console", "AWS orange on navy.", "#0f1b2d", "#ff9900", "#3dcfb4"],
];
const FONTS = [["sm", "Small"], ["md", "Medium"], ["lg", "Large"], ["xl", "Extra large"]];
const mem = new Map();
const clocks = new Set();
const hub = { shell: null, tracks: {}, search: null, quiz: null, cards: null, glossary: null, reference: null, charts: null, audio: null };
let renderGen = 0;
let route = { view: "home", id: "" };
let flowState = null;
let sceneHandle = null;
let heroHandle = null;
let iconHandle = null;
let audioCtx = null;
let liveNodes = [];
let ladderTimer = null;
let lessonTab = "read";
let glossShown = 8;
let faultPage = 0;
let chartPage = 0;
let quizIndex = 0;
let quizPool = [];
let cardIndex = 0;
let cardShow = false;
let routeRows = [{ name: "Billing", priority: 1, delay: 0 }];
let currentLesson = null;

const SCENARIOS = [
  ["none", "Healthy", "Every link is carrying traffic."],
  ["lambda", "Lambda timeout", "The synchronous invoke passed 8 seconds. The flow takes TimeLimitExceeded."],
  ["kinesis", "Kinesis lag", "One shard and two consumers. Contact trace delivery stalls."],
  ["lex", "Lex fallback", "No intent came back. The error branch has to reach a person."],
  ["turn", "TURN blocked", "UDP 3478 to TurnNlb is closed. The CCP cannot establish the softphone."],
  ["lens", "Lens paused", "Real-time analytics is not streaming for this contact."],
];

const LENS_SCRIPT = [
  { t: 0, who: "Agent", text: "Thanks for calling Northwind. How can I help?", score: 0.25, tags: [] },
  { t: 4, who: "Customer", text: "I have waited twenty minutes and order 1234 is missing.", score: -0.55, tags: ["Order status"] },
  { t: 9, who: "Agent", text: "I am sorry. I am looking up the account now.", score: -0.15, tags: [] },
  { t: 14, who: "Customer", text: "The card is 4111 1111 1111 1111. Just charge it again.", score: -0.82, tags: ["Billing", "PII"] },
  { t: 19, who: "Agent", text: "I redacted the card and started a replacement.", score: 0.35, tags: ["Redaction"] },
  { t: 24, who: "Customer", text: "Okay. Thank you for fixing it.", score: 0.72, tags: ["Resolved"] },
];

function load(path) {
  if (!mem.has(path)) {
    mem.set(path, fetch(path).then((res) => {
      if (!res.ok) throw new Error("Could not load " + path);
      return res.json();
    }));
  }
  return mem.get(path);
}
function esc(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}
function loadState() {
  const blank = {
    opened: [], labs: [], quiz: { correct: 0, answered: 0, seen: {} }, cards: { known: [] },
    streak: { last: "", count: 0 }, theme: "neon", achievements: [], scenario: {},
    sound: true, narration: true, voiceURI: "", rate: 1, reducedMotion: null, fontSize: "md",
    syllabus: {}, ports: { index: 0, score: 0, done: false, best: 0 }, daily: { day: "", answered: false, correct: false },
    lang: "en", themeBack: "dark",
  };
  try { return Object.assign(blank, JSON.parse(localStorage.getItem(KEY) || "null") || {}); }
  catch (err) { return blank; }
}
const state = loadState();
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (err) { /* private mode */ } }
function motionReduced() {
  if (typeof state.reducedMotion === "boolean") return state.reducedMotion;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function applyPrefs() {
  const root = document.documentElement;
  root.dataset.theme = state.theme || "dark";
  root.dataset.font = state.fontSize || "md";
  root.dataset.motion = motionReduced() ? "reduce" : "full";
  const kicker = document.querySelector(".brand-kicker");
  const theme = THEMES.find((row) => row[0] === (state.theme || "dark"));
  if (kicker && theme) kicker.textContent = theme[1];
  $$(".theme-quick button[data-theme]").forEach((btn) => {
    btn.setAttribute("aria-pressed", btn.dataset.theme === (state.theme || "dark") ? "true" : "false");
  });
  applyLanguage(state.lang || "en");
  if (heroHandle) heroHandle.setTheme(state.theme || "dark");
  if (sceneHandle && sceneHandle.setTheme) sceneHandle.setTheme(state.theme || "neon");
  if (iconHandle && iconHandle.setTheme) iconHandle.setTheme();
}
function studioCtx() {
  return { esc, state, save, award, load, hub, setTitle };
}
let konamiAt = 0;
function unlockEgg() {
  award("konami");
  document.documentElement.dataset.egg = "1";
  state.theme = "neon";
  save();
  applyPrefs();
  const banner = document.createElement("p");
  banner.className = "egg-banner";
  banner.textContent = "CypherMonkey found the night shift. Neon is on.";
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 4200);
}
function isEdgeVoice(voice) {
  const blob = ((voice.name || "") + " " + (voice.voiceURI || "")).toLowerCase();
  return blob.includes("microsoft") || blob.includes("edge");
}
function voiceRank(voice) {
  const name = (voice.name || "").toLowerCase();
  let score = 0;
  if (/natural|premium|enhanced|neural|siri/.test(name)) score += 80;
  if (name.includes("google")) score += 40;
  if ((voice.lang || "").toLowerCase().startsWith("en")) score += 30;
  if (voice.localService) score += 10;
  if (isEdgeVoice(voice)) score -= 200;
  return score;
}
function pickVoice(voices) {
  if (state.voiceURI) {
    const chosen = voices.find((voice) => voice.voiceURI === state.voiceURI);
    if (chosen) return chosen;
  }
  const ranked = voices.filter((voice) => !isEdgeVoice(voice)).sort((a, b) => voiceRank(b) - voiceRank(a));
  return ranked[0] || null;
}
function today() { return new Date().toISOString().slice(0, 10); }
function touchStreak() {
  const d = today();
  if (state.streak.last === d) return;
  const prev = new Date(d);
  prev.setDate(prev.getDate() - 1);
  state.streak.count = state.streak.last === prev.toISOString().slice(0, 10) ? state.streak.count + 1 : 1;
  state.streak.last = d;
  if (state.streak.count >= 3) award("streak");
}
function award(id) {
  if (!state.achievements.includes(id)) { state.achievements.push(id); confetti(); }
}
function confetti() {
  if (motionReduced()) return;
  try {
    burst({ particleCount: 90, spread: 72, startVelocity: 32, origin: { y: 0.25 }, disableForReducedMotion: true });
  } catch (err) { /* the CSS layer still falls */ }
  const layer = document.createElement("div");
  layer.className = "confetti";
  for (let i = 0; i < 36; i += 1) {
    const bit = document.createElement("i");
    bit.style.left = (Math.random() * 100) + "%";
    bit.style.background = ["#ffb020", "#2dd4bf", "#818cf8", "#f472b6", "#e8eef7"][i % 5];
    bit.style.animationDelay = (Math.random() * 0.25) + "s";
    layer.appendChild(bit);
  }
  document.body.appendChild(layer);
  const id = setTimeout(() => layer.remove(), 1700);
  clocks.add(id);
}
function every(fn, ms) {
  const id = setInterval(fn, ms);
  clocks.add(id);
  return id;
}
function stopClock(id) {
  if (id == null) return;
  clearInterval(id);
  clearTimeout(id);
  clocks.delete(id);
}
function stopTones() {
  liveNodes.forEach((node) => { try { node.stop(); } catch (err) { /* already stopped */ } });
  liveNodes = [];
}
function haltTimers() {
  clocks.forEach((id) => { clearInterval(id); clearTimeout(id); });
  clocks.clear();
  ladderTimer = null;
  stopTones();
  if (sceneHandle) { sceneHandle.dispose(); sceneHandle = null; }
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}
function toneContext() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}
function beep(freq, start, dur, type) {
  if (state.sound === false) return;
  const ctx = toneContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + dur + 0.02);
  liveNodes.push(osc);
}
function parseHash() {
  const raw = location.hash.replace(/^#\/?/, "");
  const [view, id] = raw.split("/");
  return { view: view || "home", id: id ? decodeURIComponent(id) : "" };
}
function go(hash) { location.hash = hash; }
function setTitle(kicker, title, lessonEnglish) {
  $("#view-kicker").textContent = kicker || "Amazon Connect Lab";
  const shown = lessonEnglish ? lessonHeading(state.lang, title) : title;
  const heading = $("#view-title");
  heading.textContent = shown;
  if (lessonEnglish) heading.dataset.en = title;
  else delete heading.dataset.en;
  document.title = shown + " · Amazon Connect Lab";
}
function trackBy(id) { return hub.shell.tracks.find((t) => t.id === id); }
function lessonMeta(id) {
  for (const track of hub.shell.tracks) {
    const hit = track.lessons.find((l) => l.id === id);
    if (hit) return Object.assign({ track: track.id }, hit);
  }
  return null;
}
async function trackPack(id) {
  if (!hub.tracks[id]) hub.tracks[id] = await load("data/tracks/" + id + ".json");
  return hub.tracks[id];
}
function figureHtml(item) {
  if (!item || !item.svg) return "";
  return `<figure class="glass figure">${item.svg}<figcaption>${esc(item.caption || "")}</figcaption></figure>`;
}
function stat(n, label) { return `<div class="stat"><b>${n}</b><span>${esc(label)}</span></div>`; }
function field(label, id, value, type) {
  return `<label class="field">${esc(label)}<input id="${id}" type="${type || "text"}" value="${esc(value)}"></label>`;
}

const ACH = {
  first: "First contact", foundations: "Foundations", streak: "Three-day streak", labs: "Five labs",
  quiz: "Twenty correct", bridge: "Bridge crossed", ecosystem: "Ecosystem opened", scenario: "Walkthrough finished",
  ports: "Ports badge", daily: "Daily challenge", konami: "Night shift", cheat: "Cheat codes",
  explorer: "Flow map", sandbox: "Flow sandbox",
};

function renderRail() {
  const shell = hub.shell;
  $("#track-list").innerHTML = shell.tracks.map((t) => {
    const done = t.lessons.filter((l) => state.opened.includes(l.id)).length;
    const current = route.view === "track" && route.id === t.id ? ' aria-current="true"' : "";
    return `<button class="track-link" data-go="#/track/${t.id}"${current}><i class="dot" style="--hue:${t.hue}"></i><span>${esc(t.title)}<small>${esc(t.kicker)}</small></span><small>${done}/${t.lessons.length}</small></button>`;
  }).join("");
  applyPrefs();
  $("#streak-count").textContent = String(state.streak.count || 0);
  const pct = Math.round((state.opened.length / shell.counts.lessons) * 100);
  $("#progress-label").textContent = pct + "%";
  $("#progress-pip").style.width = pct + "%";
  const quickOn = {
    learn: route.view === "home" || route.view === "track" || route.view === "lesson",
    diagrams: route.view === "diagrams",
    play: route.view === "play" || route.view === "ports" || route.view === "daily" || route.view === "sandbox",
    listen: route.view === "audio",
  };
  $$(".bottom-nav [data-quick]").forEach((btn) => {
    if (quickOn[btn.dataset.quick]) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  });
  const phoneTracks = $("#phone-tracks");
  if (phoneTracks) phoneTracks.innerHTML = $("#track-list").innerHTML;
  $$("a[data-menu]").forEach((link) => {
    const key = link.dataset.menu;
    let on = false;
    if (key === "learn") on = route.view === "home" || route.view === "track" || route.view === "lesson";
    else if (key === "diagrams") on = route.view === "diagrams" || route.view === "map";
    else if (key === "flows") on = route.view === "flows" || route.view === "explorer";
    else if (key === "charts") on = route.view === "charts";
    else if (key === "cheats") on = route.view === "cheats";
    else if (key === "play") on = route.view === "play" || route.view === "ports" || route.view === "daily" || route.view === "sandbox";
    else if (key === "ecosystem") on = route.view === "track" && route.id === "ecosystem";
    else if (key === "downloads") on = route.view === "downloads";
    else if (key === "careers") on = route.view === "career";
    else if (key === "listen") on = route.view === "audio";
    else if (key === "settings") on = route.view === "settings";
    else if (key === "labs") on = route.view === "labs" || route.view === "lab";
    else if (key === "quiz") on = route.view === "quiz";
    else if (key === "cards") on = route.view === "cards";
    else if (key === "glossary") on = route.view === "glossary";
    else if (key === "map") on = route.view === "map";
    else if (key === "timeline") on = route.view === "timeline";
    else on = false;
    if (on) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function closeDrawer() {
  $("#rail").classList.remove("open");
  $("#backdrop").hidden = true;
}

let phonePushed = false;
let phoneOpener = null;
function sheetOpen() {
  const sheet = $("#phone-sheet");
  return Boolean(sheet && !sheet.hidden);
}
function hidePhoneSheet() {
  const sheet = $("#phone-sheet");
  if (!sheet) return;
  sheet.hidden = true;
  document.body.classList.remove("menu-open");
  const menu = $("#phone-menu");
  const quick = $("#quick-menu");
  if (menu) menu.setAttribute("aria-expanded", "false");
  if (quick) quick.setAttribute("aria-expanded", "false");
}
function openPhoneMenu(opener) {
  const sheet = $("#phone-sheet");
  if (!sheet || sheetOpen()) return;
  phoneOpener = opener || $("#phone-menu");
  sheet.hidden = false;
  document.body.classList.add("menu-open");
  $("#phone-menu").setAttribute("aria-expanded", "true");
  const quick = $("#quick-menu");
  if (quick) quick.setAttribute("aria-expanded", "true");
  if (!phonePushed) {
    history.pushState({ phoneMenu: true }, "", location.href);
    phonePushed = true;
  }
  const close = $("#phone-close");
  if (close) close.focus();
}
function closePhoneMenu(reason, nextHash) {
  if (!sheetOpen()) return;
  hidePhoneSheet();
  const restore = phoneOpener || $("#phone-menu");
  if (reason === "back") {
    phonePushed = false;
    if (restore) restore.focus({ preventScroll: true });
    return;
  }
  if (reason === "silent") {
    if (phonePushed) {
      phonePushed = false;
      history.replaceState(null, "", location.href);
    }
    return;
  }
  if (phonePushed) {
    phonePushed = false;
    const hash = nextHash || "";
    if (hash) {
      const onPop = () => {
        window.removeEventListener("popstate", onPop);
        if (location.hash !== hash) location.hash = hash;
      };
      window.addEventListener("popstate", onPop);
    }
    history.back();
    if (!hash && restore) restore.focus({ preventScroll: true });
    return;
  }
  if (nextHash && location.hash !== nextHash) location.hash = nextHash;
  if (restore && reason === "user") restore.focus({ preventScroll: true });
}

async function render() {
  const gen = ++renderGen;
  haltTimers();
  if (heroHandle) { heroHandle.dispose(); heroHandle = null; }
  if (iconHandle) { iconHandle.dispose(); iconHandle = null; }
  closeDrawer();
  closePhoneMenu("silent");
  route = parseHash();
  if ((route.view === "track" || route.view === "lesson" || route.view === "lab" || route.view === "scenario") && !route.id) {
    location.replace("#/");
    return;
  }
  try {
    if (!hub.shell) hub.shell = await load("data/shell.json");
    if (gen !== renderGen) return;
    renderRail();
    const html = await viewFor(route);
    if (gen !== renderGen) return;
    $("#view").innerHTML = html;
    document.body.dataset.view = route.view;
    paintCrumbs();
    $("#search-modal").hidden = true;
    $("#stage").focus({ preventScroll: true });
    await afterRender(gen);
  } catch (err) {
    if (gen !== renderGen) return;
    setTitle("Campus", "The page did not load");
    $("#view").innerHTML = `<p>${esc(err.message)}. Serve this folder over HTTP so the modules can load. After the first visit the service worker keeps them on this device.</p><p><button class="solid" id="retry">Try again</button></p>`;
  }
}

async function viewFor(r) {
  if (r.view === "home") return viewHome();
  if (r.view === "track") return viewTrack(r.id);
  if (r.view === "lesson") return viewLesson(r.id);
  if (r.view === "labs") return viewLabs();
  if (r.view === "lab") return viewLab(r.id);
  if (r.view === "quiz") return viewQuiz(r.id);
  if (r.view === "cards") return viewCards();
  if (r.view === "scenarios") return viewScenarios();
  if (r.view === "scenario") return viewScenario(r.id);
  if (r.view === "timeline") return viewTimeline();
  if (r.view === "map") return viewMap();
  if (r.view === "glossary") return viewGlossary();
  if (r.view === "sources") return viewSources();
  if (r.view === "charts") return viewCharts();
  if (r.view === "diagrams") return viewDiagrams();
  if (r.view === "flows") return viewFlows();
  if (r.view === "play") return viewPlay();
  if (r.view === "downloads") return viewDownloads();
  if (r.view === "regions") return viewRegions();
  if (r.view === "faults") return viewFaults();
  if (r.view === "audio") return viewAudio();
  if (r.view === "ccp") return viewCcp();
  if (r.view === "lens") return viewLens();
  if (r.view === "settings") return viewSettings();
  if (r.view === "tips") return r.id ? viewTip(r.id) : viewTips();
  if (r.view === "cheats") return viewCheats(studioCtx());
  if (r.view === "syllabus") return viewSyllabus(studioCtx());
  if (r.view === "career") return viewCareer(studioCtx());
  if (r.view === "explorer") return viewExplorer(studioCtx());
  if (r.view === "ports") return viewPorts(studioCtx());
  if (r.view === "daily") return viewDaily(studioCtx());
  if (r.view === "sandbox") return viewLab("flow-builder");
  setTitle("Campus", "That page is not on the map");
  return `<p>The address does not match a track, lesson, lab, or studio.</p><p><button class="solid" data-go="#/">Back home</button></p>`;
}

function architecturePanel(live) {
  const buttons = SCENARIOS.map(([id, label]) => `<button class="chip" data-scenario="${id}" aria-pressed="${id === "none" ? "true" : "false"}">${esc(label)}</button>`).join("");
  const lamp = live ? "Live topology" : "Flat topology";
  const note = live
    ? "Drag to orbit. Scroll to zoom. Pick a failure to drop that link. Three.js loads for this view."
    : "This drawing is the flat fallback. The home page already runs the three.js hero. Open the 3D map when you want orbit controls.";
  return `<div class="stage-3d" id="arch-host">
      <div class="bezel-lamp"><i></i> ${lamp}</div>
      <div class="arch-fallback" id="arch-fallback">${fallbackMap()}</div>
    </div>
    <div class="scenario-row" role="group" aria-label="Failure scenarios">${buttons}</div>
    <p class="caption" id="arch-status" aria-live="polite">${note}</p>`;
}
function fallbackMap() {
  const nodes = [
    ["Connect", 250, 150, "#ffb020"], ["Lex", 70, 70, "#818cf8"], ["Lambda", 430, 70, "#fbbf24"],
    ["Kinesis", 430, 240, "#2dd4bf"], ["Contact Lens", 70, 240, "#f472b6"], ["CCP", 250, 40, "#e8eef7"],
  ];
  const boxes = nodes.map(([name, x, y, color]) => `<g data-node="${esc(name)}"><rect x="${x - 54}" y="${y - 18}" width="108" height="36" rx="10" fill="#131d31" stroke="${color}"/><text x="${x}" y="${y + 4}" text-anchor="middle" fill="#e8eef7" font-size="12">${esc(name)}</text></g>`).join("");
  return `<svg viewBox="0 0 520 300" role="img" aria-label="Flat fallback map of Connect, Lex, Lambda, Kinesis, Contact Lens, and the CCP"><line x1="250" y1="150" x2="70" y2="70" stroke="#2dd4bf"/><line x1="250" y1="150" x2="430" y2="70" stroke="#2dd4bf"/><line x1="250" y1="150" x2="430" y2="240" stroke="#2dd4bf"/><line x1="250" y1="150" x2="70" y2="240" stroke="#2dd4bf"/><line x1="250" y1="40" x2="250" y2="150" stroke="#2dd4bf"/>${boxes}</svg>`;
}

async function tipsPack() {
  hub.tips = hub.tips || await load("data/tips.json");
  return hub.tips;
}
function tipsPanel(trackId) {
  const pack = hub.tips && hub.tips.tracks[trackId];
  if (!pack) return `<p>The cheat sheet is still loading.</p><p><button class="ghost" data-go="#/tips/${esc(trackId)}">Open tips</button></p>`;
  return tipBody(trackId, pack, false);
}
function tipBody(trackId, pack, full) {
  const track = trackBy(trackId);
  const title = track ? track.title : trackId;
  const tips = pack.tips.map((line) => `<li>${esc(line)}</li>`).join("");
  const traps = pack.traps.map((line) => `<li>${esc(line)}</li>`).join("");
  const rows = pack.sheet.map(([term, line]) => `<tr><th scope="row">${esc(term)}</th><td>${esc(line)}</td></tr>`).join("");
  const more = full ? "" : `<p><button class="ghost" data-go="#/tips/${esc(trackId)}">Full ${esc(title)} cheat sheet</button></p>`;
  return `<section>
    <h2>Pro tips</h2>
    <ul class="tip-list">${tips}</ul>
    <h2>Interview traps</h2>
    <ul class="tip-list">${traps}</ul>
    <h2>Cheat sheet</h2>
    <div class="table-scroll glass"><table class="sheet"><tbody>${rows}</tbody></table></div>
    <p class="cite">Source: <a href="${esc(pack.url)}">${esc(pack.source)}</a></p>
    ${more}
  </section>`;
}
async function viewTips() {
  const tips = await tipsPack();
  setTitle("Study layer", "Tips and traps");
  const cards = hub.shell.tracks.map((track) => {
    const pack = tips.tracks[track.id];
    const line = pack ? pack.tips[0] : "";
    return `<button class="card" data-go="#/tips/${track.id}"><p class="meta">${esc(track.kicker)}</p><h2>${esc(track.title)}</h2><p>${esc(line)}</p></button>`;
  }).join("");
  return `<p class="lede">One cheat sheet per track: a pro tip you can use on a shift, a trap that shows up in interviews, and the short list to reread before a design review.</p><div class="grid-cards">${cards}</div>`;
}
async function viewTip(id) {
  const tips = await tipsPack();
  const pack = tips.tracks[id];
  const track = trackBy(id);
  if (!pack || !track) { setTitle("Tips", "Unknown track"); return `<p>That track has no cheat sheet.</p><p><button class="ghost" data-go="#/tips">All tips</button></p>`; }
  setTitle(track.title, track.title + " cheat sheet");
  return `<p class="lede">${esc(track.kicker)}</p>${tipBody(id, pack, true)}<p class="actions"><button class="ghost" data-go="#/track/${id}">Open the track</button><button class="ghost" data-go="#/tips">All tracks</button></p>`;
}
function viewSettings() {
  setTitle("Preferences", "Settings");
  const themeCards = THEMES.map(([id, label, blurb, bg, a, b]) => `<button type="button" class="theme-card" data-theme="${id}" aria-pressed="${(state.theme || "dark") === id ? "true" : "false"}"><span class="swatch" aria-hidden="true"><i style="background:${bg}"></i><i style="background:${a}"></i><i style="background:${b}"></i></span><strong>${esc(label)}</strong><span class="meta">${esc(blurb)}</span></button>`).join("");
  const fontCards = FONTS.map(([id, label]) => `<button type="button" data-font="${id}" aria-pressed="${(state.fontSize || "md") === id ? "true" : "false"}">${esc(label)}</button>`).join("");
  const langOptions = LANGS.map(([id, label]) => `<option value="${id}"${(state.lang || "en") === id ? " selected" : ""}>${esc(label)}</option>`).join("");
  const rate = Number(state.rate) || 1;
  return `<div class="settings">
    <p class="lede">Theme, language, sound, narration, motion, and type size stay in this browser.</p>
    <fieldset><legend>Theme</legend><div class="theme-grid" role="radiogroup" aria-label="Theme">${themeCards}</div></fieldset>
    <fieldset><legend>Language</legend>
      <label class="field">Language <select id="set-lang" aria-label="Language">${langOptions}</select></label>
      <p class="caption">Headings follow this switch. The first lesson of each track is translated. Every other lesson body stays in English, and the page says so.</p>
    </fieldset>
    <fieldset><legend>Sound</legend>
      <label class="checkline"><input id="set-sound" type="checkbox"${state.sound === false ? "" : " checked"}> Sound effects</label>
      <p class="caption">Rings, answer tones, and the other interface beeps. Clips in the Audio view still play.</p>
    </fieldset>
    <fieldset><legend>Narration</legend>
      <label class="checkline"><input id="set-narration" type="checkbox"${state.narration === false ? "" : " checked"}> Read lessons aloud</label>
      <label class="field">Voice <select id="set-voice" aria-label="Narration voice"><option value="">Waiting for voices</option></select></label>
      <p class="caption">The list fills when the browser fires voiceschanged. Automatic prefers a natural or high-quality voice and never selects Microsoft Edge unless you pick it.</p>
      <label class="field">Speed <input id="set-rate" type="range" min="0.6" max="1.6" step="0.1" value="${rate}"> <span id="set-rate-read">${rate.toFixed(1)}×</span></label>
      <p><button class="ghost" type="button" id="preview-voice">Preview voice</button></p>
    </fieldset>
    <fieldset><legend>Motion and type</legend>
      <label class="checkline"><input id="set-motion" type="checkbox"${motionReduced() ? " checked" : ""}> Reduced motion</label>
      <p class="caption">Stops confetti, ladder autoplay, and the 3D scene. The map stays on the flat drawing.</p>
      <div class="font-grid" role="radiogroup" aria-label="Font size">${fontCards}</div>
    </fieldset>
  </div>`;
}
function fillVoices() {
  const select = $("#set-voice");
  if (!select || !window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) {
    select.innerHTML = `<option value="">Waiting for voices</option>`;
    return;
  }
  const options = voices.slice().sort((a, b) => voiceRank(b) - voiceRank(a)).map((voice) => {
    const note = isEdgeVoice(voice) ? " · Edge, not the default" : "";
    return `<option value="${esc(voice.voiceURI)}">${esc(voice.name + note + " · " + voice.lang)}</option>`;
  }).join("");
  select.innerHTML = `<option value="">Automatic (best non-Edge voice)</option>${options}`;
  select.value = state.voiceURI && voices.some((voice) => voice.voiceURI === state.voiceURI) ? state.voiceURI : "";
}
async function loadAtlas() {
  hub.atlas = hub.atlas || await load("data/atlas.json");
  return hub.atlas;
}
function counted(n, label) {
  return `<div class="stat"><b data-count="${Number(n) || 0}">0</b><span>${esc(label)}</span></div>`;
}
function atlasFigure(item) {
  const portrait = item.svgPortrait || item.svg;
  return `<figure class="glass figure atlas-card" data-kind="${esc(item.kind)}" data-animated="${item.animated ? "1" : "0"}"><button type="button" class="atlas-open" data-open-diagram="${esc(item.id)}"><span class="atlas-wide">${item.svg}</span><span class="atlas-portrait">${portrait}</span><span class="atlas-open-label">Enlarge</span></button><figcaption><strong>${esc(item.title)}</strong> ${esc(item.caption)} <a href="${esc(item.url)}">${esc(item.source)}</a></figcaption></figure>`;
}
function isoIcon(track) {
  const hue = (track && track.hue) || "#22e7ff";
  const id = (track && track.id) || "track";
  return `<canvas class="track-icon" width="96" height="96" data-icon="${esc(id)}" data-hue="${esc(hue)}" aria-label="" role="img"></canvas>`;
}
function progressRing() {
  const pct = hub.shell ? Math.round((state.opened.length / Math.max(1, hub.shell.counts.lessons)) * 100) : 0;
  const length = 2 * Math.PI * 32;
  const dash = (pct / 100) * length;
  return `<div class="ring-wrap"><svg class="ring" viewBox="0 0 80 80" role="img" aria-label="${pct} percent of lessons opened"><circle cx="40" cy="40" r="32" class="ring-track"/><circle cx="40" cy="40" r="32" class="ring-value" stroke-dasharray="${dash.toFixed(1)} ${length.toFixed(1)}" transform="rotate(-90 40 40)"/></svg><b>${pct}%</b></div>`;
}
function architectPlayer() {
  return `<section class="architect holo-card" aria-label="Architect conversation">
    <p class="showcase-kicker">Listen</p>
    <h2>Two architects, one minute</h2>
    <audio id="architect-audio" controls preload="none" src="audio/use.mp3"></audio>
    <div class="actions">
      <button type="button" class="ghost" data-clip-src="audio/use.mp3">Using the lab</button>
      <button type="button" class="ghost" data-clip-src="audio/share.mp3">Practise and share</button>
      <a class="ghost" href="https://github.com/CypherMonkeyLabs/amazon-connect-lab-free-university-mesmerizing">Rate</a>
      <a class="ghost" href="https://github.com/CypherMonkeyLabs/amazon-connect-lab-free-university-mesmerizing/issues">Comment</a>
    </div>
    <p class="meta">The player is ready for the lab clips at audio/use.mp3 and audio/share.mp3. These two files are espeak-ng stand-ins, about 75 seconds together, until a later recording replaces them. Not a person, and not Amazon.</p>
  </section>`;
}
function openLightbox(id) {
  const atlas = hub.atlas;
  const dlg = $("#lightbox");
  if (!atlas || !dlg) return;
  const item = atlas.diagrams.concat(atlas.charts).find((row) => row.id === id);
  if (!item) return;
  const portrait = item.svgPortrait || item.svg;
  dlg.innerHTML = `<div class="lightbox-card"><div class="lightbox-bar"><strong>${esc(item.title)}</strong><button type="button" id="lb-play">Play</button><button type="button" id="lb-pause">Pause</button><button type="button" id="lb-step">Step</button><button type="button" id="lb-close">Close</button></div><div class="lightbox-stage" id="lb-stage"><span class="atlas-wide">${item.svg}</span><span class="atlas-portrait">${portrait}</span></div><p class="why"><strong>Why this matters.</strong> ${esc(item.caption)}</p><p class="cite">Source: <a href="${esc(item.url)}">${esc(item.source)}</a></p><ul class="legend"><li>The moving dot is the contact or the signal.</li><li>Each box is one hop. On a phone the hops stack downward so the words stay readable.</li></ul></div>`;
  if (typeof dlg.showModal === "function" && !dlg.open) dlg.showModal();
}
function paintLiveCharts() {
  if (!d3 || !hub.atlas) return;
  hub.atlas.charts.forEach((chart) => {
    const host = document.querySelector(`[data-chart-host="${CSS.escape(chart.id)}"]`);
    if (!host || !chart.points || !chart.points.length) return;
    host.replaceChildren();
    const width = Math.max(320, host.clientWidth || 720);
    const height = 36 + chart.points.length * 42;
    const left = 168;
    const peak = Math.max(...chart.points.map((point) => Number(point.value) || 0), 1);
    const svg = d3.select(host).append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("role", "img").attr("aria-label", chart.title);
    const tip = d3.select(host).append("p").attr("class", "chart-tip");
    chart.points.forEach((point, index) => {
      const y = 12 + index * 42;
      const span = Math.max(8, ((Number(point.value) || 0) / peak) * (width - left - 90));
      svg.append("text").attr("x", 8).attr("y", y + 22).attr("fill", "currentColor").attr("font-size", 16).text(point.label);
      const bar = svg.append("rect").attr("class", "live-bar").attr("x", left).attr("y", y + 6).attr("height", 22).attr("rx", 8).attr("width", 0).attr("fill", index % 2 ? "var(--cc-accent-2)" : "var(--cc-accent-1)");
      try {
        bar.transition().duration(motionReduced() ? 0 : 800).attr("width", span);
      } catch (err) {
        bar.attr("width", span);
      }
      svg.append("text").attr("x", left + span + 8).attr("y", y + 22).attr("fill", "currentColor").attr("font-size", 15).text(String(point.shown));
      bar.on("mousemove", (event) => {
        const rect = host.getBoundingClientRect();
        tip.style("opacity", 1).style("left", (event.clientX - rect.left + 10) + "px").style("top", (event.clientY - rect.top - 28) + "px").text(`${point.label}: ${point.shown} ${chart.unit || ""}`);
      });
      bar.on("mouseleave", () => { tip.style("opacity", 0); });
    });
  });
}
function showcaseLink(href, kicker, svg, caption) {
  return `<a class="showcase-card" href="${href}"><p class="showcase-kicker">${kicker}</p>${svg}<p class="meta">${esc(caption)}</p></a>`;
}
function paintCrumbs() {
  const nav = $("#crumbs");
  if (!nav || !hub.shell) return;
  const bits = [{ href: "#/", label: "Home" }];
  const names = {
    diagrams: "Diagrams", flows: "Flows", charts: "Charts", cheats: "Cheat Codes",
    play: "Play", downloads: "Downloads", career: "Careers", explorer: "Flows",
    ports: "Play", daily: "Play", sandbox: "Play", map: "Diagrams", syllabus: "Syllabus",
    glossary: "Glossary", faults: "Faults", labs: "Labs", quiz: "Quiz", cards: "Cards",
    settings: "Settings", timeline: "Timeline", sources: "Sources", tips: "Tips",
  };
  if (route.view === "track") {
    const track = trackBy(route.id);
    bits.push({ href: "#/track/" + route.id, label: track ? track.title : route.id });
  } else if (route.view === "lesson") {
    const meta = lessonMeta(route.id);
    if (meta) {
      const track = trackBy(meta.track);
      bits.push({ href: "#/track/" + meta.track, label: track ? track.title : meta.track });
      bits.push({ href: "#/lesson/" + route.id, label: meta.title });
    }
  } else if (route.view !== "home") {
    bits.push({ href: "#/" + route.view + (route.id ? "/" + route.id : ""), label: names[route.view] || route.view });
  }
  nav.innerHTML = bits.map((bit, index) => {
    if (index === bits.length - 1) return `<span aria-current="page">${esc(bit.label)}</span>`;
    return `<a href="${esc(bit.href)}">${esc(bit.label)}</a>`;
  }).join('<span aria-hidden="true"> / </span>');
}
function runCounters() {
  $$("[data-count]").forEach((el) => {
    const to = Number(el.getAttribute("data-count")) || 0;
    if (motionReduced()) {
      el.textContent = String(to);
      return;
    }
    const proxy = { n: 0 };
    try {
      animate(proxy, {
        n: to,
        duration: 900,
        ease: "outQuad",
        onUpdate: () => { el.textContent = String(Math.round(proxy.n)); },
      });
    } catch (err) {
      el.textContent = String(to);
    }
  });
}
function paintRough() {
  $$(".rough-frame").forEach((canvas) => {
    if (canvas.dataset.drawn) return;
    const rc = rough.canvas(canvas);
    rc.rectangle(4, 4, Math.max(20, canvas.width - 8), Math.max(16, canvas.height - 8), {
      stroke: "#ffb020", roughness: 1.7, strokeWidth: 2,
    });
    canvas.dataset.drawn = "1";
  });
}
function paintMind() {
  const host = $("#mind-host");
  if (!host || !d3) return;
  host.replaceChildren();
  const root = d3.hierarchy({
    name: "Connect",
    children: [
      { name: "WFM" }, { name: "Recording" }, { name: "E911" },
      { name: "Analytics" }, { name: "CRM" }, { name: "Agent assist" },
    ],
  });
  const width = 720;
  const height = 240;
  d3.tree().size([width - 80, height - 70])(root);
  const svg = d3.select(host).append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("role", "img").attr("aria-label", "Ecosystem mind map drawn with d3");
  svg.append("rect").attr("width", width).attr("height", height).attr("rx", 16).attr("fill", "var(--cc-surface)");
  const g = svg.append("g").attr("transform", "translate(40,28)");
  g.selectAll("path").data(root.links()).join("path")
    .attr("d", (link) => `M${link.source.x},${link.source.y} C${link.source.x},${(link.source.y + link.target.y) / 2} ${link.target.x},${(link.source.y + link.target.y) / 2} ${link.target.x},${link.target.y}`)
    .attr("fill", "none").attr("stroke", "var(--cc-accent-2)").attr("stroke-width", 2);
  const node = g.selectAll("g").data(root.descendants()).join("g").attr("transform", (d) => `translate(${d.x},${d.y})`);
  node.append("rect").attr("x", -58).attr("y", -16).attr("width", 116).attr("height", 32).attr("rx", 10).attr("fill", "var(--cc-surface-2)").attr("stroke", "var(--cc-accent-1)");
  node.append("text").attr("text-anchor", "middle").attr("dy", "0.35em").attr("fill", "var(--cc-ink)").attr("font-size", 13).text((d) => d.data.name);
}
function trackLive(track, atlas) {
  const charts = atlas.charts;
  const flows = atlas.diagrams.filter((item) => item.animated);
  const chart = charts[hashId(track.id) % charts.length];
  const flow = flows[hashId(track.id + ":flow") % flows.length];
  return `<section class="track-live" aria-label="Chart, counter, and diagram for this track">
    <div class="parallax-stage">${isoIcon(track)}</div>
    <div class="live-counters">${counted(track.lessons.length, "lessons on this track")}${counted(atlas.diagrams.length, "atlas diagrams")}</div>
    <figure class="glass figure">${chart.svg}<figcaption><strong>${esc(chart.title)}</strong> ${esc(chart.caption)}</figcaption></figure>
    <figure class="glass figure"><span class="atlas-wide">${flow.svg}</span><span class="atlas-portrait">${flow.svgPortrait || flow.svg}</span><figcaption><a href="#/flows">${esc(flow.title)}</a></figcaption></figure>
  </section>`;
}
async function viewHome() {
  const shell = hub.shell;
  const atlas = await loadAtlas();
  setTitle("The call path is already moving", "Amazon Connect Lab");
  const cards = shell.tracks.map((t) => `<button class="holo-card" data-go="#/track/${t.id}">${isoIcon(t)}<p class="meta" style="color:${t.hue}">${t.lessons.length} lessons</p><h2>${esc(t.title)}</h2><p>${esc(t.why)}</p></button>`).join("");
  const animated = atlas.diagrams.filter((item) => item.animated).length;
  const hops = ["PSTN", "Flow", "Queue", "Agent", "CCP"];
  return `<section class="hero-stage" aria-label="Three dimensional call path">
      <div id="hero-host" data-mode="boot">
        <div class="hero-fallback" aria-hidden="true"><i></i><i></i><i></i><b>Connect</b></div>
      </div>
      <div class="mascot mascot-stage" data-pose="wave" data-look="1" data-shift="day" aria-hidden="true"></div>
      <div class="hero-hud">
        <p class="hero-greet" id="hero-greet">The call path is already moving.</p>
        <div class="hud-row">
          ${progressRing()}
          <div class="live-counters" aria-label="Live counts">
            ${counted(shell.counts.tracks, "tracks")}${counted(shell.counts.lessons, "lessons")}${counted(atlas.diagrams.length, "diagrams")}${counted(animated, "flows")}${counted(atlas.charts.length, "charts")}${counted(13, "sheets")}
          </div>
        </div>
        <nav class="hero-jumps" aria-label="Open a studio">
          <a href="#/diagrams">Diagrams</a>
          <a href="#/flows">Flows</a>
          <a href="#/charts">Charts</a>
          <a href="#/cheats">Cheat Codes</a>
          <a href="#/regions">Regions</a>
        </nav>
      </div>
    </section>
    <p class="meta" id="lang-note">Interface labels only. Lessons stay in English.</p>
    <section class="mega-path holo-card">
      <div class="section-head"><h2>Inbound path, large enough to read</h2><button class="ghost" type="button" data-open-diagram="inbound-ladder">Enlarge</button></div>
      <ol class="hop-row">${hops.map((hop, index) => `<li style="--i:${index}">${hop}</li>`).join("")}</ol>
      <p class="why"><strong>Why it matters.</strong> TCP 443 can sign the agent in while UDP 3478 to TurnNlb is blocked, so the softphone stays silent.</p>
    </section>
    ${architectPlayer()}
    <div class="section-head"><h2>Tracks</h2><button class="ghost" data-go="#/regions">Regions</button></div>
    <div class="holo-grid">${cards}</div>`;
}
function viewRegions() {
  setTitle("Residency", "Regions");
  const pairs = [
    ["us-east-1", "Northern Virginia", "US", "us-west-2", "Oregon", "US"],
    ["eu-central-1", "Frankfurt", "DE", "eu-west-2", "London", "GB"],
    ["ap-northeast-1", "Tokyo", "JP", "ap-northeast-3", "Osaka", "JP"],
  ];
  const cards = pairs.map(([a, an, ac, b, bn, bc]) => `<article class="holo-card"><p class="meta">Published Global Resiliency pair</p><h2><span class="flag">${esc(ac)}</span> ${esc(an)} <small>${esc(a)}</small></h2><p>linked with</p><h2><span class="flag">${esc(bc)}</span> ${esc(bn)} <small>${esc(b)}</small></h2></article>`).join("");
  return `<p class="lede">Only these three pairs are cited in this campus. A city that is not in a pair is not a resiliency design.</p>
    <div class="holo-grid">${cards}</div>
    <article class="holo-card"><h2>Osaka delivery</h2><p class="ticker">20<span>s</span></p><p>Upper figure for delivery through Osaka, the replica for Tokyo. Numbers have to be enabled for Global Resiliency. Shift traffic in 10 percent steps.</p><p class="cite">Source: <a href="https://docs.aws.amazon.com/connect/latest/adminguide/setup-connect-global-resiliency.html">Set up Global Resiliency</a></p></article>
    <article class="holo-card"><h2>United States emergency calling</h2><p>For US CCP agents, validate the address, store it, and read it back with 933. This lab never places a live 911 call.</p><p class="cite">Source: <a href="https://docs.aws.amazon.com/connect/latest/adminguide/setup-us-emergency-calling.html">US emergency calling</a></p></article>
    <article class="holo-card"><p class="meta">Example, not a tariff</p><h2>What this page will not invent</h2><p>Carrier coverage, PSTN price by country, and national regulations other than the US 933 test above are not copied here. A matrix of carriers would be an example, so it is omitted.</p></article>
    <p><button class="ghost" data-go="#/lesson/foundations-regions">Open the regions lesson</button></p>`;
}
async function viewDiagrams() {
  const atlas = await loadAtlas();
  setTitle("Atlas", "Diagrams");
  const animated = atlas.diagrams.filter((item) => item.animated).length;
  return `<p class="lede">${atlas.diagrams.length} diagrams, drawn large. Click one to enlarge it, then play, pause, or step the packet.</p>
    <div class="tabs" role="tablist" aria-label="Diagram filter">
      <button class="chip" type="button" data-atlas="all" aria-pressed="true">All</button>
      <button class="chip" type="button" data-atlas="flow" aria-pressed="false">Flows</button>
      <button class="chip" type="button" data-atlas="diagram" aria-pressed="false">Maps</button>
    </div>
    <div class="figure-grid" id="atlas-grid">${atlas.diagrams.map(atlasFigure).join("")}</div>
    <h2>Ecosystem mind map</h2>
    <div id="mind-host" class="glass"></div>
    <p class="cite">The mind map is drawn with d3 from the ecosystem names in this lab. Sister-product port numbers that are not in the admin guide are left off.</p>`;
}
async function viewFlows() {
  const atlas = await loadAtlas();
  const flows = atlas.diagrams.filter((item) => item.animated);
  setTitle("Animated flows", "Flows");
  return `<p class="lede">${flows.length} animated flows, one per row so the hop names stay readable. Enlarge any of them.</p>
    <p class="actions"><button class="ghost" data-go="#/explorer">Hop explorer</button><button class="ghost" data-go="#/sandbox">Call-flow sandbox</button></p>
    <div class="figure-grid">${flows.map(atlasFigure).join("")}</div>`;
}
function viewPlay() {
  setTitle("Games", "Play");
  return `<p class="lede">Ports, the daily question, the call-flow sandbox, and the signal map. The Konami sequence still switches the campus to neon.</p>
    <div class="grid-cards">
      <button class="card" data-go="#/ports"><p class="meta">Mastery</p><h2>Ports and protocols</h2><p>TCP 443 or UDP 3478. The wrong famous port is a miss.</p></button>
      <button class="card" data-go="#/daily"><p class="meta">Today</p><h2>Daily challenge</h2><p>One question, then a result card you can save.</p></button>
      <button class="card" data-go="#/sandbox"><p class="meta">Build</p><h2>Call-flow sandbox</h2><p>Wire a flow and see which port is missing.</p></button>
      <button class="card" data-go="#/explorer"><p class="meta">Map</p><h2>Flow map explorer</h2><p>PSTN to CCP, with the port named on the hop.</p></button>
    </div>`;
}
async function viewDownloads() {
  const html = await viewCheats(studioCtx());
  setTitle("Offline bundle", "Downloads");
  return html;
}

function viewMap() {
  setTitle("Topology", "AWS architecture map");
  return `<p class="lede">Connect in the middle. Lex, Lambda, Kinesis, and Contact Lens around it. The CCP is the agent edge. Orbit the scene, then drop a link. Node colours follow the theme. The home hero is a separate full-bleed scene.</p>${architecturePanel(true)}
    <div class="grid-cards" style="margin-top:12px">
      ${SCENARIOS.filter(([id]) => id !== "none").map(([id, label, copy]) => `<article class="card"><p class="meta">${esc(id)}</p><h2>${esc(label)}</h2><p>${esc(copy)}</p><p><button class="ghost" data-scenario="${id}">Show this failure</button></p></article>`).join("")}
    </div>
    <p class="cite">Sources: <a href="https://docs.aws.amazon.com/connect/latest/adminguide/ccp-networking.html">CCP networking</a>, <a href="https://docs.aws.amazon.com/connect/latest/adminguide/invoke-lambda-function-block.html">Lambda function block</a>, <a href="https://repost.aws/knowledge-center/connect-integrate-kinesis">Kinesis and CTR delivery</a>.</p>`;
}

async function bootScene(gen) {
  const host = $("#arch-host");
  if (!host) return;
  if (motionReduced() || !window.WebGLRenderingContext) {
    $("#arch-status").textContent = "Reduced motion is on, so the map stays flat. The failure buttons still light the dropped link.";
    return;
  }
  try {
    const mod = await import("./scene.js");
    if (gen !== renderGen || !$("#arch-host")) return;
    sceneHandle = mod.mountArchitecture(host);
    if (!sceneHandle) return;
    if (sceneHandle.setTheme) sceneHandle.setTheme(state.theme || "neon");
    const fallback = $("#arch-fallback");
    if (fallback) fallback.hidden = true;
  } catch (err) {
    const status = $("#arch-status");
    if (status) status.textContent = "WebGL did not start. The flat map is the same topology.";
  }
}

async function viewTrack(id) {
  const t = trackBy(id);
  if (!t) { setTitle("Tracks", "Unknown track"); return `<p>That track is not on the campus.</p>`; }
  if (id === "bridge") award("bridge");
  if (id === "ecosystem") award("ecosystem");
  setTitle("Track", t.title);
  const atlas = await loadAtlas();
  const deps = t.depends.map(trackBy).filter(Boolean);
  const cards = t.lessons.map((l) => {
    const translated = lessonBody(state.lang, l.id);
    const why = translated ? translated.why : l.why;
    const opened = state.opened.includes(l.id) ? "Opened" : "New";
    const mark = state.lang !== "en" && !translated ? "English · " + opened : opened;
    return `<button class="lesson-card" data-go="#/lesson/${l.id}"><p class="meta">${esc(mark)}</p><h2 data-en="${esc(l.title)}">${esc(lessonHeading(state.lang, l.title))}</h2><p>${esc(why)}</p></button>`;
  }).join("");
  const tips = await tipsPack();
  const sheet = tips.tracks[id];
  const teaser = sheet ? `<aside class="glass tips-teaser"><p class="meta">Tips and traps</p><p><strong>Pro tip.</strong> ${esc(sheet.tips[0])}</p><p><strong>Interview trap.</strong> ${esc(sheet.traps[0])}</p><p><button class="ghost" data-go="#/tips/${id}">Open the ${esc(t.title)} cheat sheet</button></p></aside>` : "";
  return `${trackLive(t, atlas)}${teaser}<div class="why"><strong>Why it matters.</strong> ${esc(t.why)}</div>
    <p class="caption">${deps.length ? "Depends on " + deps.map((d) => esc(d.title)).join(", ") + "." : "Starts the campus. Nothing earlier is required."}</p>
    <p><button class="ghost" data-go="#/quiz/${id}">Quiz this track</button></p>
    <div class="lesson-grid">${cards}</div>`;
}

async function viewLesson(id) {
  const meta = lessonMeta(id);
  if (!meta) { setTitle("Lesson", "Unknown lesson"); return `<p>That lesson is not on the campus.</p>`; }
  const pack = await trackPack(meta.track);
  const lesson = pack.lessons.find((l) => l.id === id);
  if (lesson.chart) {
    hub.charts = hub.charts || await load("data/charts.json");
    lesson.chartSvg = hub.charts.charts.find((c) => c.figure === lesson.chart || c.id === lesson.chart) || null;
  }
  await tipsPack();
  currentLesson = lesson;
  if (!state.opened.includes(id)) state.opened.push(id);
  touchStreak();
  award("first");
  const foundations = trackBy("foundations");
  if (foundations && foundations.lessons.every((l) => state.opened.includes(l.id))) award("foundations");
  save();
  const track = trackBy(lesson.track);
  setTitle(track.title, lesson.title, true);
  lessonTab = "read";
  return lessonShell(lesson);
}
function lessonShell(lesson) {
  const iac = hub.shell.iac[lesson.track];
  const panels = {
    read: "Read",
    flow: "Flow ladder",
    iac: "CDK / CloudFormation",
    tips: "Tips",
  };
  const tabs = Object.entries(panels).map(([id, label]) => `<button class="chip" role="tab" data-tab="${id}" aria-selected="${lessonTab === id ? "true" : "false"}">${label}</button>`).join("");
  const extra = lesson.track === "workspace" ? `<button class="ghost" data-go="#/ccp">Open the CCP</button>` : lesson.track === "analytics" ? `<button class="ghost" data-go="#/lens">Contact Lens playback</button>` : lesson.track === "routing" ? `<button class="ghost" data-go="#/lab/erlang">Erlang C calculator</button>` : "";
  return `<div class="tabs" role="tablist">${tabs}</div><div id="lesson-panel">${lessonPanel(lesson, iac)}</div>
    <p class="actions"><button class="solid" data-go="#/lab/${esc(lesson.try || "flow-builder")}">Try it</button>${extra}<button class="ghost" id="speak">Play this lesson</button><button class="ghost" data-go="#/track/${lesson.track}">Back to track</button></p>`;
}
function lessonPanel(lesson, iac) {
  if (lessonTab === "flow") return ladderHtml(lesson);
  if (lessonTab === "iac") return iacHtml(iac);
  if (lessonTab === "tips") return tipsPanel(lesson.track);
  const figures = (lesson.figures || []).slice(0, 3).map(figureHtml).join("");
  const more = (lesson.figures || []).length > 3 ? `<p><button class="ghost" id="more-figures">Show the other figures</button></p><div id="more-figures-host"></div>` : "";
  const translated = lessonBody(state.lang, lesson.id);
  const why = translated ? translated.why : lesson.why;
  const paras = translated ? translated.paras : lesson.paras;
  const pointText = translated ? translated.points : lesson.points;
  const mistake = translated ? translated.mistake : lesson.mistake;
  const note = bodyNote(state.lang, Boolean(translated));
  const banner = note ? `<p class="lang-banner">${esc(note)}</p>` : "";
  const points = pointText.map((p, i) => `<li><span class="num">${i + 1}</span><span>${esc(p)}</span></li>`).join("");
  let chart = "";
  if (lesson.chartSvg) chart = figureHtml(lesson.chartSvg);
  return `<div class="lesson"><div>
      ${banner}
      <div class="why"><strong>Why it matters.</strong> ${esc(why)}</div>
      <div class="figure-grid">${figures}</div>
      <div class="prose reading">${paras.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
      <ol class="points">${points}</ol>
      <p class="mistake"><strong>Common mistake.</strong> ${esc(mistake)}</p>
      <p class="cite">Source: <a href="${esc(lesson.cite.url)}">${esc(lesson.cite.title)}</a></p>
      ${more}
      ${lesson.id === "eco-glossary" ? `<p><button class="ghost" data-go="#/glossary">Open the glossary</button></p>` : ""}
      ${lesson.id === "foundations-timeline" ? `<p><button class="solid" data-go="#/timeline">Open the full timeline</button></p>` : ""}
    </div>
    <aside class="glass" style="padding:14px"><p class="num">${esc(lesson.number.v)}</p><p class="meta">${esc(lesson.number.k)}</p><p>${esc(lesson.number.n)}</p>${chart}${diagram(lesson.diagram)}</aside></div>`;
}
function ladderHtml(lesson) {
  const kind = (lesson.animated && lesson.animated[0] && lesson.animated[0].kind) || "call-path";
  const steps = lesson.flow.map((step, i) => `<div class="ladder-step${i === 0 ? " is-on" : ""}" data-step="${i}"><span class="meta">${i + 1}</span><span><strong>${esc(step.label)}</strong><br>${esc(step.detail)}</span></div>`).join("");
  const motions = (lesson.animated || []).map((item) => `<figure class="glass figure anim">${item.svg}<figcaption>${esc(item.kind)} · ${esc(item.caption || "")}</figcaption></figure>`).join("");
  return `<div class="flow-controls">
      <button class="solid" id="lad-play">Play</button>
      <button class="ghost" id="lad-pause">Pause</button>
      <button class="ghost" id="lad-step">Step</button>
      <button class="ghost" id="lad-inspect" aria-pressed="false">Inspect</button>
    </div>
    <p class="caption">Kind ${esc(kind)}. Play walks the call or the event. Inspect shows the record for the lit step.</p>
    <div class="ladder" id="ladder">${steps}</div>
    <pre class="log" id="inspect" hidden></pre>
    <div class="figure-grid">${motions}</div>`;
}
function iacHtml(iac) {
  if (!iac) return `<p>This track has no provisioning snippet.</p>`;
  const links = (iac.urls || []).map(([title, href]) => `<a href="${esc(href)}">${esc(title)}</a>`).join(" · ");
  return `<p>${esc(iac.blurb)}</p><p class="cite">${links}</p>
    <div class="iac-grid">
      <div><p class="meta">AWS CDK</p><button class="ghost" id="copy-cdk" data-copy="cdk-code">Copy CDK</button><pre class="code" id="cdk-code">${esc(iac.cdk)}</pre></div>
      <div><p class="meta">CloudFormation</p><button class="ghost" id="copy-cfn" data-copy="cfn-code">Copy CloudFormation</button><pre class="code" id="cfn-code">${esc(iac.cfn)}</pre></div>
    </div>`;
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
      const next = i < nodes.length - 1 ? `<line x1="${x + 108}" y1="70" x2="${x + gap - 8}" y2="70" stroke="var(--cc-accent-1)" stroke-width="3"/>` : "";
      return `${next}<rect x="${x}" y="36" rx="14" width="116" height="68" fill="var(--cc-surface-2)" stroke="var(--cc-accent-2)"/><text x="${x + 58}" y="76" text-anchor="middle" fill="var(--cc-ink)" font-size="12">${esc(n.label).slice(0, 22)}</text>`;
    }).join("");
  } else if (spec.type === "layers") {
    body = nodes.map((n, i) => `<rect x="24" y="${16 + i * 56}" rx="14" width="560" height="46" fill="var(--cc-surface-2)" stroke="var(--cc-accent-1)"/><text x="40" y="${44 + i * 56}" fill="var(--cc-ink)" font-size="16">${esc(n.label)}</text>`).join("");
  } else if (spec.type === "split") {
    body = `<rect x="20" y="30" width="250" height="110" rx="16" fill="var(--cc-surface-2)" stroke="var(--cc-accent-2)"/><rect x="330" y="30" width="250" height="110" rx="16" fill="var(--cc-surface-2)" stroke="var(--cc-accent-1)"/><text x="145" y="92" text-anchor="middle" fill="var(--cc-ink)" font-size="16">${esc(nodes[0] ? nodes[0].label : "")}</text><text x="455" y="92" text-anchor="middle" fill="var(--cc-ink)" font-size="16">${esc(nodes[1] ? nodes[1].label : "")}</text>`;
  } else if (spec.type === "bars") {
    const max = Math.max(...nodes.map((n) => Number(n.value) || 1));
    body = nodes.map((n, i) => {
      const width = 40 + ((Number(n.value) || 0) / max) * 420;
      return `<text x="16" y="${28 + i * 34}" fill="var(--cc-muted)" font-size="12">${esc(n.label)}</text><rect x="150" y="${14 + i * 34}" width="${width}" height="16" rx="8" fill="var(--cc-accent-2)"/>`;
    }).join("");
  }
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc((spec && spec.caption) || "Diagram")}">${body}</svg><p class="caption">${esc((spec && spec.caption) || "")}</p>`;
}

function inspectPayload(step, kind) {
  const base = { hop: step.label, detail: step.detail, kind };
  if (kind === "event-stream") return Object.assign(base, { contactId: "11111111-2222-3333-4444-555555555555", stream: "Kinesis", join: "ContactId" });
  if (kind === "lambda-roundtrip") return Object.assign(base, { invocationType: "SYNCHRONOUS", invocationTimeLimitSeconds: 8, errorTypes: ["TimeLimitExceeded", "NoMatchingError"] });
  if (kind === "routing-decision") return Object.assign(base, { priority: 1, delaySeconds: 0, rule: "Lower priority number is offered first among eligible queues." });
  return Object.assign(base, { leg: "Connect media and flow", note: "The agent path is WebRTC, not a SIP trunk you configure on the CCP." });
}

let ladderIndex = 0;
function paintLadder() {
  const rows = $$("#ladder .ladder-step");
  rows.forEach((row, i) => row.classList.toggle("is-on", i === ladderIndex));
  const box = $("#inspect");
  if (!box || box.hidden || !currentLesson) return;
  const step = currentLesson.flow[ladderIndex];
  const kind = (currentLesson.animated && currentLesson.animated[0] && currentLesson.animated[0].kind) || "call-path";
  box.textContent = JSON.stringify(inspectPayload(step, kind), null, 2);
}
function playLadder() {
  if (!currentLesson) return;
  stopClock(ladderTimer);
  if (motionReduced()) { paintLadder(); return; }
  ladderTimer = every(() => {
    if (!currentLesson) return stopClock(ladderTimer);
    ladderIndex = (ladderIndex + 1) % currentLesson.flow.length;
    paintLadder();
  }, 900);
}

function viewLabs() {
  setTitle("Labs", "Twenty-four labs");
  const cards = hub.shell.labs.map((l) => `<button class="lab-card" data-go="#/lab/${l.id}"><p class="meta">${esc(l.minutes)} min · ${esc(l.track)}</p><h2>${esc(l.title)}</h2><p>${esc(l.summary)}</p></button>`).join("");
  return `<p class="lede">Nothing leaves the browser. The flow builder writes Connect flow-language JSON.</p><div class="grid-cards">${cards}</div>
    <div class="section-head"><h2>Studios</h2></div>
    <div class="actions"><button class="solid" data-go="#/ccp">CCP softphone</button><button class="ghost" data-go="#/lens">Contact Lens</button><button class="ghost" data-go="#/map">3D map</button></div>`;
}

async function viewLab(id) {
  const meta = hub.shell.labs.find((l) => l.id === id);
  if (!meta) { setTitle("Lab", "Unknown lab"); return `<p>That lab is not on the campus.</p>`; }
  if (id === "find-fault" || id === "translator" || id === "quota-headroom") hub.reference = hub.reference || await load("data/reference.json");
  if (id === "glossary-drill") hub.glossary = hub.glossary || await load("data/glossary.json");
  if (!state.labs.includes(id)) {
    state.labs.push(id);
    if (state.labs.length >= 5) award("labs");
    save();
  }
  if (id === "flow-builder") award("sandbox");
  setTitle("Lab · " + meta.track, meta.title);
  const body = LAB[id] ? LAB[id]() : `<p>This lab is not wired.</p>`;
  return `<p>${esc(meta.summary)}</p>${body}<p><button class="ghost" data-go="#/labs">All labs</button></p>`;
}

const LAB = {
  "flow-builder": flowBuilder,
  "call-path": callPath,
  "routing-designer": routingDesigner,
  "lambda-sim": lambdaSim,
  "ctr-inspector": ctrInspector,
  erlang: erlangLab,
  pricing: pricingLab,
  "iam-checker": iamLab,
  webrtc: webrtcLab,
  "find-fault": faultLab,
  translator: translatorLab,
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
  "glossary-drill": glossDrill,
};

function flowBuilder() {
  flowState = sampleOrderStatus();
  const docs = FLOW_DOCS.map((d) => `<a href="${esc(d.url)}">${esc(d.title)}</a>`).join(" · ");
  return `<p class="cite">Flow language ${docs}</p>
    <div class="lab-layout">
      <div class="glass palette"><p class="meta">Palette</p>${PALETTE.map((p) => `<button class="block-chip" draggable="true" data-pal="${esc(p)}">${esc(p)}</button>`).join("")}
        <button class="solid" id="load-sample">Load order-status sample</button>
        <button class="ghost" id="wire-missing">Wire open ports to Disconnect</button>
      </div>
      <div class="glass canvas-pane" id="canvas"></div>
      <div class="glass inspector">
        <p class="meta">Test call</p>
        <label class="field">Hours <select id="sc-hours"><option value="in">In hours</option><option value="out">Out of hours</option></select></label>
        <label class="field">DTMF <select id="sc-dtmf"><option>1</option><option>2</option><option>Timeout</option></select></label>
        <label class="field">Lambda <select id="sc-lambda"><option>Success</option><option>Error</option><option>Timeout</option></select></label>
        <label class="field">Queue <select id="sc-queue"><option>Staffed</option><option>At capacity</option></select></label>
        <button class="solid" id="run-flow">Run test call</button>
        <button class="ghost" id="export-flow">Export flow JSON</button>
        <button class="ghost" id="import-flow">Import JSON</button>
        <label class="field">Paste flow JSON<textarea id="flow-json" rows="6" placeholder='{"Version":"2019-10-30", ...}'></textarea></label>
        <div class="log" id="flow-log">Sample loaded. Press 1 in hours to reach the queue. Press 2 to see the missing branch.</div>
      </div>
    </div>`;
}
function paintFlow() {
  const canvas = $("#canvas");
  if (!canvas || !flowState) return;
  canvas.innerHTML = flowState.nodes.map((n) => `<div class="node" data-uid="${esc(n.uid)}" style="left:${n.x}px;top:${n.y}px"><strong>${esc(n.type)}</strong><div>${(PORTS[n.type] || ["Success"]).map((p) => `<button class="port" data-from="${esc(n.uid)}" data-port="${esc(p)}">${esc(p)}</button>`).join("")}</div></div>`).join("");
}
function runFlow() {
  const sc = { hours: $("#sc-hours").value, dtmf: $("#sc-dtmf").value, lambda: $("#sc-lambda").value, queue: $("#sc-queue").value };
  const log = [];
  let cur = flowState.nodes.find((n) => n.type === "Flow entry");
  const seen = new Set();
  for (let i = 0; i < 16 && cur; i += 1) {
    if (seen.has(cur.uid)) { log.push("Stopped a loop at " + cur.type); break; }
    seen.add(cur.uid);
    log.push("Ran " + cur.type);
    const ports = PORTS[cur.type] || [];
    if (!ports.length) { log.push("End of path."); break; }
    let port = ports[0];
    if (cur.type === "Check hours of operation") port = sc.hours === "in" ? "In hours" : "Out of hours";
    if (cur.type === "Get customer input") port = sc.dtmf;
    if (cur.type === "AWS Lambda function") port = sc.lambda;
    if (cur.type === "Transfer to queue" && sc.queue !== "At capacity") { log.push("Contact is queued. The agent whisper would play next."); break; }
    if (!ports.includes(port)) port = ports[0];
    const edge = flowState.edges.find((e) => e.from === cur.uid && e.port === port);
    if (!edge) { log.push("FAULT: no branch for " + port + " on " + cur.type); break; }
    cur = flowState.nodes.find((n) => n.uid === edge.to);
  }
  $("#flow-log").textContent = log.join("\n");
}
function showFlowReport(result) {
  const lines = [];
  lines.push(result.valid ? "Valid flow language. Version 2019-10-30." : "Not valid for import yet.");
  (result.errors || []).forEach((e) => lines.push("Error: " + e));
  (result.warnings || []).forEach((w) => lines.push("Warning: " + w));
  $("#flow-log").textContent = lines.join("\n");
  if (result.flow) $("#flow-json").value = JSON.stringify(result.flow, null, 2);
}

function callPath() {
  return `<div class="glass" style="padding:12px"><div class="flow-controls"><button class="solid" id="cp-play">Play</button><button class="ghost" id="cp-pause">Pause</button><button class="ghost" id="cp-step">Step</button><button class="ghost" id="cp-inspect">Inspect</button><button class="ghost" id="cp-fail">Inject Lex fallback</button></div><div id="cp-ladder"></div><pre class="log" id="cp-log"></pre></div>`;
}
const PATH = [
  ["PSTN", "Caller dials the claimed number."],
  ["Connect telephony", "The number is associated with a flow."],
  ["Flow", "Logging, hours, and Get customer input."],
  ["Lex V2", "Intent and slots return, or the fallback branch runs."],
  ["Queue", "Set working queue, then transfer."],
  ["Agent CCP", "Whisper, then WebRTC media on UDP 3478."],
];
let pathIndex = 0;
let pathFail = false;
let pathTimer = null;
function pathSteps() { return pathFail ? PATH.slice(0, 4).concat([["Fallback", "No intent. Branch to a person."]]) : PATH; }
function paintPath() {
  const steps = pathSteps();
  const host = $("#cp-ladder");
  if (!host) return;
  host.innerHTML = `<div class="ladder">${steps.map((s, i) => `<div class="ladder-step${i === pathIndex ? " is-on" : ""}"><span class="meta">${i + 1}</span><span><strong>${esc(s[0])}</strong><br>${esc(s[1])}</span></div>`).join("")}</div>`;
  const log = $("#cp-log");
  if (log && !log.hidden) {
    const step = steps[Math.min(pathIndex, steps.length - 1)];
    log.textContent = JSON.stringify({ hop: step[0], detail: step[1], contactId: "11111111-2222-3333-4444-555555555555" }, null, 2);
  }
}
function playPath() {
  stopClock(pathTimer);
  if (motionReduced()) { paintPath(); return; }
  pathTimer = every(() => {
    const max = pathSteps().length;
    pathIndex += 1;
    if (pathIndex >= max) { pathIndex = max - 1; stopClock(pathTimer); }
    paintPath();
  }, 800);
}

function routingDesigner() {
  return `<div class="glass" style="padding:12px"><p>Add queues to a profile. Lower priority is offered first. Delay holds the profile back.</p><div id="rq"></div><button class="solid" id="rq-add">Add queue row</button><button class="ghost" id="rq-run">Who is eligible now?</button>${field("Contact age in seconds", "rq-age", "20", "number")}<div class="log" id="rq-log"></div></div>`;
}
function lambdaSim() {
  return `<div class="glass" style="padding:12px"><label class="field">Mode <select id="lm-mode"><option>Synchronous</option><option>Asynchronous</option></select></label>${field("Block timeout seconds", "lm-to", "8", "number")}<label class="field">Validation <select id="lm-val"><option>STRING_MAP</option><option>JSON</option></select></label>${field("Function duration", "lm-dur", "2", "number")}<label class="field">Return body<textarea id="lm-body" rows="6">{"accountStatus":"open"}</textarea></label><button class="solid" id="lm-run">Invoke</button><div class="log" id="lm-log"></div></div>`;
}
function ctrInspector() {
  const ctr = { ContactId: "11111111-2222-3333-4444-555555555555", Channel: "VOICE", InitiationMethod: "INBOUND", DisconnectReason: "CUSTOMER_DISCONNECT", Queue: { Name: "Orders", Duration: 42 }, Agent: { ConnectedToAgentTimestamp: "2026-10-14T15:04:11Z", AfterContactWorkDuration: 35 }, Attributes: { AccountId: "A-100" }, Recording: { Location: "s3://recordings/2026/10/14/example.wav" } };
  return `<div class="glass" style="padding:12px"><div class="log">${esc(JSON.stringify(ctr, null, 2))}</div><div>${Object.keys(flatten(ctr)).map((k) => `<button class="chip" data-ctr="${esc(k)}">${esc(k)}</button>`).join("")}</div><p id="ctr-help"></p></div>`;
}
function flatten(obj, prefix, out) {
  const target = out || {};
  const pre = prefix || "";
  Object.keys(obj).forEach((k) => {
    const key = pre ? pre + "." + k : k;
    if (obj[k] && typeof obj[k] === "object") flatten(obj[k], key, target);
    else target[key] = obj[k];
  });
  return target;
}
function erlangB(a, n) {
  let b = 1;
  for (let k = 1; k <= n; k += 1) b = (a * b) / (k + a * b);
  return b;
}
function erlangC(a, n) {
  if (n <= a) return 1;
  const b = erlangB(a, n);
  return Math.min(1, Math.max(0, b / (1 - (a / n) * (1 - b))));
}
function serviceLevel(a, n, target, aht) {
  if (n <= a) return 0;
  return 1 - erlangC(a, n) * Math.exp(-(n - a) * (target / aht));
}
function erlangLab() {
  return `<div class="glass" style="padding:12px"><p>Teaching form of Erlang C. Not a workforce contract. The curve is service level as you add agents above the offered load.</p>
    ${field("Calls per hour", "er-c", "300", "number")}${field("AHT seconds", "er-a", "240", "number")}${field("Target answer seconds", "er-t", "20", "number")}${field("Service level target", "er-s", "0.8", "number")}${field("Shrinkage 0-0.9", "er-sh", "0.3", "number")}
    <button class="solid" id="er-run">Calculate</button><div id="er-out"></div></div>`;
}
function erlangChart(a, target, aht, chosen) {
  const start = Math.max(1, Math.ceil(a) + 1);
  const rows = [];
  for (let n = start; n < start + 12; n += 1) rows.push({ n, sl: Math.max(0, serviceLevel(a, n, target, aht)) });
  const bars = rows.map((r) => `<div class="bar-row"><span>${r.n}</span><div class="bar"><span style="width:${Math.round(r.sl * 100)}%"></span></div><span>${Math.round(r.sl * 100)}%</span></div>`).join("");
  return `<div class="bars" aria-label="Service level by agent count">${bars}</div><p class="caption">Highlighted roster before shrinkage is ${chosen} agents. Wait probability is Erlang C. Service level is 1 − C·e^{−(N−A)·t/AHT}.</p>`;
}
function pricingLab() {
  return `<div class="glass" style="padding:12px"><p><strong>Estimate, 14 October 2026.</strong> US West (Oregon) DID worked-example rates from the public appendix. Not an invoice.</p>
    <label class="field">Form <select id="pr-form"><option value="customer">Connect Customer</option><option value="basic">Customer Basic</option></select></label>
    ${field("Voice minutes", "pr-min", "1000", "number")}${field("Inbound DID minutes", "pr-in", "1000", "number")}${field("Outbound US minutes", "pr-out", "100", "number")}${field("DID days", "pr-days", "30", "number")}${field("Chat messages", "pr-chat", "0", "number")}${field("Emails", "pr-email", "0", "number")}
    <button class="solid" id="pr-run">Estimate</button><div id="pr-result"></div></div>`;
}
function iamLab() {
  return `<div class="glass" style="padding:12px"><p>Educational checker. It does not call AWS.</p>
    <button class="chip" data-policy="star">Broad connect:*</button><button class="chip" data-policy="ok">Instance-scoped</button><button class="chip" data-policy="voice">voiceid leftover</button>
    <textarea id="iam-body" rows="12">{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"connect:*","Resource":"*"}]}</textarea>
    <button class="solid" id="iam-run">Check</button><div class="log" id="iam-log"></div></div>`;
}
function webrtcLab() {
  return `<div class="glass" style="padding:12px"><p>Toggle the conditions on the agent's path.</p>
    <label><input type="checkbox" id="w-udp" checked> UDP 3478 to TurnNlb allowed</label><br>
    <label><input type="checkbox" id="w-tcp" checked> TCP 443 to the instance and transport domains</label><br>
    <label><input type="checkbox" id="w-vpn"> Media forced through a VPN</label><br>
    <label><input type="checkbox" id="w-stateless"> Stateless firewall, ephemeral range closed</label><br>
    <label><input type="checkbox" id="w-dns" checked> DNS resolves TurnNlb</label>
    <p><button class="solid" id="w-run">Explain this path</button> <button class="ghost" data-go="#/ccp">Open the CCP simulator</button></p>
    <div class="log" id="w-log"></div></div>`;
}
function faultLab() {
  const bank = hub.reference.faults;
  const item = bank[Math.floor(Math.random() * bank.length)];
  const opts = shuffle([item.fix].concat(hub.reference.errors.filter((e) => e.fix !== item.fix).slice(0, 3).map((e) => e.fix)), item.symptom);
  return `<div class="glass" style="padding:12px" id="fault-box" data-answer="${esc(item.fix)}"><p class="meta">Find the fault</p><h2>${esc(item.symptom)}</h2><p>${esc(item.cause)}</p>${opts.map((o) => `<button class="choice" data-fault="${esc(o)}">${esc(o)}</button>`).join("")}<div id="fault-why"></div><button class="ghost" id="fault-next">Another fault</button></div>`;
}
function translatorLab() {
  const platforms = [...new Set(hub.reference.bridge.map((b) => b.platform))];
  return `<div class="glass" style="padding:12px"><label class="field">Platform <select id="tr-p">${platforms.map((p) => `<option>${esc(p)}</option>`).join("")}</select></label><div id="tr-out"></div></div>`;
}
function hoursLab() {
  return `<div class="glass" style="padding:12px"><p>Queue time zone is America/Los_Angeles in this exercise. Weekly open 08:00-18:00, Monday to Friday. Override: closed all day on 2026-12-25.</p>${field("ISO local date-time", "hr-when", "2026-10-14T17:30")}<button class="solid" id="hr-run">Check hours</button><div class="log" id="hr-log"></div></div>`;
}
function queueLab() {
  return `<div class="glass" style="padding:12px"><p>One agent, two queues. Billing is priority 1 delay 0. Sales is priority 2 delay 30. A billing contact has waited 10s. A sales contact has waited 90s.</p><button class="solid" id="q-run">Who is offered?</button><div class="log" id="q-log"></div></div>`;
}
function lexLab() {
  return `<div class="glass" style="padding:12px"><label class="field">Utterance <input id="lx-u" value="where is order 1234"></label><button class="solid" id="lx-run">Map</button><div class="log" id="lx-log"></div></div>`;
}
function samlLab() {
  return `<div class="glass" style="padding:12px">${field("Role", "sa-role", "Agent")}${field("Routing profile", "sa-route", "Basic")}${field("Security profile", "sa-sec", "Agent")}<button class="solid" id="sa-run">Evaluate assertion</button><div class="log" id="sa-log"></div></div>`;
}
function resiliencyLab() {
  return `<div class="glass" style="padding:12px"><label class="field">Pair <select id="rs-pair"><option>us-east-1 / us-west-2</option><option>eu-central-1 / eu-west-2</option><option>ap-northeast-1 / ap-northeast-3</option><option>us-east-1 / eu-west-1</option></select></label>${field("Telephony percent on source", "rs-pct", "100", "number")}<button class="solid" id="rs-run">Drill</button><div class="log" id="rs-log"></div></div>`;
}
function quotaLab() {
  const opts = hub.reference.quotas.slice(0, 8);
  return `<div class="glass" style="padding:12px"><label class="field">Quota <select id="qq">${opts.map((q) => `<option value="${esc(q.name)}">${esc(q.name)}</option>`).join("")}</select></label>${field("Current usage", "qq-u", "8", "number")}<button class="solid" id="qq-run">Headroom</button><div class="log" id="qq-log"></div></div>`;
}
function certLab() {
  return `<div class="glass" style="padding:12px"><label class="field">Role <select id="ce"><option>Admin</option><option>Architect</option><option>Developer</option><option>Network</option><option>AI</option></select></label><button class="solid" id="ce-run">Plan</button><div id="ce-out"></div></div>`;
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
    ["E911", "CivicAddress", "Outbound whisper", "HQ address stored for a home agent"],
  ];
  return `<div class="glass table-scroll"><table><thead><tr><th>System</th><th>Key</th><th>Seam</th><th>First fault</th></tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
function e911Lab() {
  return `<div class="glass" style="padding:12px"><p>US East, US West, and GovCloud US-West only. Score the design. Do not place a real 911 call.</p>
    <label><input type="checkbox" id="e1"> Region is us-east-1, us-west-2, or GovCloud US-West</label><br>
    <label><input type="checkbox" id="e2"> Address validated and stored on the agent profile</label><br>
    <label><input type="checkbox" id="e3"> Outbound whisper sets CivicAddress for 911 and 933</label><br>
    <label><input type="checkbox" id="e4"> Test plan uses 933, not 911</label><br>
    <label><input type="checkbox" id="e5"> A task notifies security</label><br>
    <label><input type="checkbox" id="e6"> Direct dial only. Nobody transfers a live customer call to 911</label>
    <button class="solid" id="e-run">Score</button><div class="log" id="e-log"></div></div>`;
}
function wfmLab() {
  return `<div class="glass" style="padding:12px"><p>Schedule: 09:00-17:00 available, except 12:00-12:30 break.</p>
    ${field("Available minutes inside the shift", "wf-a", "390", "number")}${field("On-contact minutes", "wf-c", "0", "number")}${field("Break minutes", "wf-b", "30", "number")}${field("Unplanned offline minutes", "wf-o", "30", "number")}
    <button class="solid" id="wf-run">Adherence</button><div class="log" id="wf-log"></div></div>`;
}
function hooksLab() {
  return `<div class="glass" style="padding:12px"><label class="field">Need <select id="hk"><option value="pop">Screen pop</option><option value="wfm">Real-time adherence</option><option value="qm">Live recording</option><option value="bot">A tool call from a flow</option><option value="case">Case sync</option></select></label><button class="solid" id="hk-run">Which hook?</button><div class="log" id="hk-log"></div></div>`;
}
function glossDrill() {
  const rows = hub.glossary.terms;
  const g = rows[Math.floor(Math.random() * rows.length)];
  const opts = shuffle([g.term].concat(rows.filter((x) => x.term !== g.term).slice(0, 3).map((x) => x.term)), g.meaning);
  return `<div class="glass" style="padding:12px" data-answer="${esc(g.term)}"><p>${esc(g.meaning)}</p>${opts.map((o) => `<button class="choice" data-gloss="${esc(o)}">${esc(o)}</button>`).join("")}<div id="gloss-why"></div></div>`;
}
function shuffle(arr, seed) {
  const copy = arr.slice();
  let h = 0;
  const text = String(seed || "seed");
  for (let i = 0; i < text.length; i += 1) h = (h * 33 + text.charCodeAt(i)) >>> 0;
  for (let i = copy.length - 1; i > 0; i -= 1) {
    h = (h * 1664525 + 1013904223) >>> 0;
    const j = h % (i + 1);
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function viewCcp() {
  setTitle("Studio", "CCP softphone");
  return `<p class="lede">A teaching softphone. It does not register with Connect and it does not open a WebRTC peer. Ring, answer, and wrap up the way the CCP states line up.</p>
    <div class="studio-grid">
      <div class="ccp-phone" id="ccp">
        <p class="meta" id="ccp-state">Available</p>
        <h2 id="ccp-caller">No contact</h2>
        <p id="ccp-timer">00:00</p>
        <div class="sentiment" aria-hidden="true"><i id="ccp-needle" style="left:50%"></i></div>
        <p class="caption" id="ccp-mood">Sentiment idle</p>
        <div class="actions">
          <button class="solid" id="ccp-ring">Simulate inbound</button>
          <button class="ghost" id="ccp-answer">Answer</button>
          <button class="ghost" id="ccp-hold">Hold</button>
          <button class="ghost" id="ccp-end">End</button>
        </div>
        <label class="field">Wrap-up <select id="ccp-wrap"><option>Resolved</option><option>Callback</option><option>Transfer</option><option>Wrong queue</option></select></label>
        <button class="ghost" id="ccp-save">Save wrap-up</button>
        <p class="cite"><a href="https://docs.aws.amazon.com/connect/latest/adminguide/ccp-networking.html">CCP networking</a></p>
      </div>
      <div class="log" id="ccp-log">Waiting for a contact. The ring is a local tone, the North American 440 Hz and 480 Hz pair, two seconds on.</div>
    </div>`;
}
let ccp = null;
function ccpLog(line) {
  const el = $("#ccp-log");
  if (el) el.textContent = line;
}
function setCcp(next) {
  ccp = next;
  const stateEl = $("#ccp-state");
  const caller = $("#ccp-caller");
  if (stateEl) stateEl.textContent = next.status;
  if (caller) caller.textContent = next.caller;
}
function viewLens() {
  setTitle("Studio", "Contact Lens playback");
  return `<p class="lede">A scripted contact. Sentiment, category tags, and a card number that redacts. This is not Amazon Polly and not a live Contact Lens stream.</p>
    <div class="glass" style="padding:12px">
      <div class="flow-controls">
        <button class="solid" id="lens-play">Play</button>
        <button class="ghost" id="lens-pause">Pause</button>
        <label><input type="checkbox" id="lens-redact" checked> Redact card numbers</label>
      </div>
      <label class="field">Playhead <input id="lens-scrub" type="range" min="0" max="24" value="0"></label>
      <svg id="lens-chart" viewBox="0 0 640 160" role="img" aria-label="Sentiment curve"></svg>
      <p class="meter-read" id="lens-score">0.00</p>
      <p id="lens-line"></p>
      <p class="caption" id="lens-tags"></p>
      <p class="cite"><a href="https://docs.aws.amazon.com/connect/latest/adminguide/analyze-conversations.html">Conversational analytics</a> · <a href="https://docs.aws.amazon.com/connect/latest/adminguide/sensitive-data-redaction.html">Sensitive data redaction</a></p>
    </div>`;
}
let lensTime = 0;
let lensTimer = null;
function lensLine(t, redact) {
  let cursor = LENS_SCRIPT[0];
  LENS_SCRIPT.forEach((row) => { if (row.t <= t) cursor = row; });
  const text = redact ? cursor.text.replace(/\d{4}(?: \d{4}){3}/, "[CARD REDACTED]") : cursor.text;
  return { cursor, text };
}
function paintLens() {
  const redact = $("#lens-redact") ? $("#lens-redact").checked : true;
  const { cursor, text } = lensLine(lensTime, redact);
  const chart = $("#lens-chart");
  if (chart) {
    const pts = LENS_SCRIPT.map((row) => `${40 + (row.t / 24) * 560},${80 - row.score * 60}`).join(" ");
    const x = 40 + (lensTime / 24) * 560;
    chart.innerHTML = `<polyline fill="none" stroke="#f472b6" stroke-width="3" points="${pts}"/><line x1="${x}" y1="20" x2="${x}" y2="140" stroke="#ffb020"/>`;
  }
  const score = $("#lens-score");
  if (score) score.textContent = cursor.score.toFixed(2);
  const line = $("#lens-line");
  if (line) line.textContent = cursor.who + ": " + text;
  const tags = $("#lens-tags");
  if (tags) tags.textContent = cursor.tags.length ? "Categories: " + cursor.tags.join(", ") : "No category yet.";
  const scrub = $("#lens-scrub");
  if (scrub && document.activeElement !== scrub) scrub.value = String(Math.round(lensTime));
}
function playLens() {
  stopClock(lensTimer);
  if (motionReduced()) { paintLens(); return; }
  beep(520, 0, 0.12);
  lensTimer = every(() => {
    lensTime += 0.5;
    if (lensTime > 24) { lensTime = 24; stopClock(lensTimer); }
    paintLens();
  }, 500);
}

async function viewQuiz(track) {
  hub.quiz = hub.quiz || await load("data/quiz.json");
  quizPool = hub.quiz.questions.filter((q) => !track || q.track === track);
  quizIndex = 0;
  setTitle("Quiz", track ? "Quiz · " + track : "Quiz");
  return `<p class="meta" id="quiz-score">Answered ${state.quiz.answered}, correct ${state.quiz.correct}</p><div id="quiz-body">${quizCard()}</div>`;
}
function quizCard() {
  const q = quizPool[quizIndex % Math.max(quizPool.length, 1)];
  if (!q) return `<p>No questions in this slice.</p>`;
  return `<article class="glass" style="padding:16px" data-qi="${esc(q.id)}"><p class="meta">${esc(q.track)} · ${quizIndex + 1} of ${quizPool.length}</p><h2>${esc(q.q)}</h2>${q.choices.map((c, i) => `<button class="choice" data-choice="${i}">${esc(c)}</button>`).join("")}<div id="quiz-why"></div><button class="ghost" id="quiz-next">Next</button></article>`;
}
async function viewCards() {
  hub.cards = hub.cards || await load("data/cards.json");
  cardIndex = 0;
  cardShow = false;
  setTitle("Cards", "Flashcards");
  return `<p class="meta">Known ${state.cards.known.length} / ${hub.cards.cards.length}</p><div id="card-body">${cardFace()}</div>`;
}
function cardFace() {
  const cards = hub.cards.cards;
  const c = cards[cardIndex % cards.length];
  return `<button class="glass flip" id="flip">${cardShow ? esc(c.back) + " — " + esc(c.source) : esc(c.front)}</button><p class="actions"><button class="ghost" id="card-again">Again</button><button class="solid" id="card-known">Know it</button></p>`;
}
async function viewScenarios() {
  hub.reference = hub.reference || await load("data/reference.json");
  setTitle("Walkthroughs", "Walkthroughs");
  return `<div class="grid-cards">${hub.reference.scenarios.map((s) => `<button class="card" data-go="#/scenario/${s.id}"><p class="meta">${esc(s.track)}</p><h2>${esc(s.title)}</h2><p>${esc(s.brief)}</p><p class="meta">${s.steps.length} steps</p></button>`).join("")}</div>`;
}
async function viewScenario(id) {
  hub.reference = hub.reference || await load("data/reference.json");
  const s = hub.reference.scenarios.find((x) => x.id === id);
  if (!s) { setTitle("Walkthrough", "Unknown walkthrough"); return `<p>Unknown walkthrough.</p>`; }
  const step = state.scenario[id] || 0;
  const cur = s.steps[Math.min(step, s.steps.length - 1)];
  if (step >= s.steps.length) award("scenario");
  save();
  setTitle("Walkthrough", s.title);
  return `<p>${esc(s.brief)}</p>${diagram({ type: "path", nodes: s.steps.map((st, i) => ({ id: String(i), label: (i === step ? "▶ " : "") + st.title })), caption: cur.body })}<p class="why"><strong>Step ${Math.min(step, s.steps.length - 1) + 1}.</strong> ${esc(cur.body)}</p><button class="solid" id="sc-next" data-sid="${esc(id)}">${step + 1 >= s.steps.length ? "Finish" : "Next step"}</button>`;
}
async function viewTimeline() {
  hub.reference = hub.reference || await load("data/reference.json");
  setTitle("Timeline", "Feature timeline");
  const kinds = ["All"].concat([...new Set(hub.reference.timeline.map((t) => t.kind))]);
  return `<p class="lede">Dates come from AWS What's New, the admin guide, the AWS News Blog, or the 25 September 2026 compilation that cites them.</p><div id="kind-row">${kinds.map((k) => `<button class="chip" data-kind="${esc(k)}" aria-pressed="${k === "All" ? "true" : "false"}">${esc(k)}</button>`).join("")}</div><div class="timeline" id="time-list">${timelineItems(hub.reference.timeline)}</div>`;
}
function timelineItems(rows) {
  return rows.map((t) => `<article class="glass t-item"><div><strong>${esc(t.date)}</strong><p class="meta">${esc(t.kind)}</p></div><div><h2>${esc(t.name)}</h2><p>${esc(t.summary)}</p><p class="cite"><a href="${esc(t.url)}">${esc(t.source)}</a></p></div></article>`).join("");
}
async function viewGlossary() {
  hub.glossary = hub.glossary || await load("data/glossary.json");
  glossShown = 8;
  setTitle("Glossary", "Glossary");
  return `<p class="lede">One meaning per word, with a source.</p><input id="gloss-q" type="search" placeholder="Filter terms" aria-label="Filter glossary"><div id="gloss-list">${glossaryList("")}</div>`;
}
function glossaryList(q) {
  const query = q.toLowerCase();
  const rows = hub.glossary.terms.filter((g) => !query || g.term.toLowerCase().includes(query) || g.meaning.toLowerCase().includes(query));
  const slice = rows.slice(0, glossShown);
  const more = slice.length < rows.length ? `<p><button class="ghost" id="gloss-more">Show more</button></p>` : "";
  return `<p class="meta">${slice.length} of ${rows.length} terms</p>` + slice.map((g) => `<article class="glass gloss-row"><div class="mark-svg">${g.mark && g.mark.svg ? g.mark.svg : ""}</div><div><h2>${esc(g.term)}</h2><p>${esc(g.meaning)}</p><p class="cite"><a href="${esc(g.url)}">${esc(g.source)}</a></p></div></article>`).join("") + more;
}
async function viewCharts() {
  hub.charts = hub.charts || await load("data/charts.json");
  const atlas = await loadAtlas();
  chartPage = 0;
  setTitle("Charts", "Charts");
  const live = atlas.charts.map((chart) => `<article class="holo-card chart-card"><h2>${esc(chart.title)}</h2><div class="chart-host" data-chart-host="${esc(chart.id)}"></div><p>${esc(chart.caption)}</p><p class="cite"><a href="${esc(chart.url)}">${esc(chart.source)}</a></p></article>`).join("");
  return `<p class="lede">${atlas.charts.length} charts. Bars grow in, and hovering a bar names the value. Prices are the 14 October 2026 appendix.</p><div class="chart-live">${live}</div><div id="chart-list">${chartSlice()}</div>`;
}
function chartSlice() {
  const rows = hub.charts.charts;
  const slice = rows.slice(0, (chartPage + 1) * 4);
  const more = slice.length < rows.length ? `<p><button class="ghost" id="chart-more">Show more charts</button></p>` : "";
  return `<div class="figure-grid">${slice.map((c) => figureHtml(c)).join("")}</div>${more}`;
}
async function viewFaults() {
  hub.reference = hub.reference || await load("data/reference.json");
  faultPage = 0;
  setTitle("Faults", "Fault catalog");
  return `<p class="lede">${hub.reference.faults.length} faults. Each one names the symptom, the cause, the fix, and the source.</p><div id="fault-list">${faultSlice()}</div>`;
}
function faultSlice() {
  const rows = hub.reference.faults;
  const slice = rows.slice(faultPage * 4, faultPage * 4 + 4);
  const pages = Math.ceil(rows.length / 4);
  return `<div class="pager"><button class="ghost" id="fault-prev" ${faultPage === 0 ? "disabled" : ""}>Previous</button><span>${faultPage + 1} / ${pages}</span><button class="ghost" id="fault-next-page" ${faultPage >= pages - 1 ? "disabled" : ""}>Next</button></div>
    <div class="grid-cards">${slice.map((f) => `<article class="card"><p class="meta">${esc(f.hop)}</p><h2>${esc(f.symptom)}</h2>${figureHtml(f.figure)}<p><strong>Cause.</strong> ${esc(f.cause)}</p><p><strong>Fix.</strong> ${esc(f.fix)}</p><p class="cite"><a href="${esc(f.url)}">${esc(f.source)}</a></p><p><button class="solid" data-go="#/lesson/fault-${esc(f.id)}">Open the lesson</button></p></article>`).join("")}</div>`;
}
function viewAudio() {
  setTitle("Audio", "Offline tones");
  const clips = hub.shell.audioIndex || [];
  return `<p class="lede">Synthesized in the campus. DTMF, a short IVR sequence, ringback, busy, and the beeps used in the lessons.</p><div class="grid-cards">${clips.map((a) => `<article class="card"><h2>${esc(a.title)}</h2><p>${esc(a.blurb)}</p><button class="solid" data-clip="${esc(a.id)}">Play</button></article>`).join("")}</div>`;
}
async function viewSources() {
  hub.reference = hub.reference || await load("data/reference.json");
  setTitle("Sources", "Sources");
  return `<p class="lede">Primary pages used for facts. A secondary timeline is labeled as a compilation.</p><div class="table-scroll glass"><table><thead><tr><th>Title</th><th>URL</th></tr></thead><tbody>${hub.reference.sources.map((s) => `<tr><td>${esc(s.title)}</td><td><a href="${esc(s.url)}">${esc(s.url)}</a></td></tr>`).join("")}</tbody></table></div>`;
}

async function bootHero(gen) {
  const host = $("#hero-host");
  if (!host) return;
  if (motionReduced() || !window.WebGLRenderingContext) {
    host.dataset.mode = "flat";
    return;
  }
  try {
    const mod = await import("./hero.js");
    if (gen !== renderGen || !$("#hero-host")) return;
    const handle = mod.mountHero(host, state.theme || "dark");
    if (!handle) { host.dataset.mode = "flat"; return; }
    heroHandle = handle;
    host.dataset.mode = "webgl";
  } catch (err) {
    host.dataset.mode = "flat";
  }
}
let revealObserver = null;
function armReveal() {
  if (revealObserver) {
    revealObserver.disconnect();
    revealObserver = null;
  }
  const nodes = $$("#view .card, #view .holo-card, #view article, #view section").filter((node) => !node.classList.contains("hero-stage") && !node.querySelector("#hero-host"));
  if (motionReduced() || typeof IntersectionObserver !== "function") {
    nodes.forEach((node) => node.classList.add("revealed"));
    return;
  }
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("revealed");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -32px 0px" });
  nodes.forEach((node) => {
    node.classList.add("reveal");
    revealObserver.observe(node);
  });
}

async function afterRender(gen) {
  const stageMascot = document.querySelector(".mascot-stage");
  const headerMascot = document.getElementById("mascot");
  if (stageMascot && headerMascot && !stageMascot.querySelector("svg")) {
    const svg = headerMascot.querySelector("svg");
    if (svg) stageMascot.appendChild(svg.cloneNode(true));
  }
  applyLanguage(state.lang || "en");
  if (route.view === "home" || route.view === "track") {
    const icons = mountIcons(document);
    if (icons) iconHandle = icons;
  }
  if (route.view === "home") await bootHero(gen);
  if (route.view === "home" || route.view === "track") runCounters();
  if (route.view === "diagrams") paintMind();
  if (route.view === "charts") paintLiveCharts();
  if (route.view === "map") await bootScene(gen);
  if (route.view === "settings") fillVoices();
  armReveal();
  if (route.view === "lab" && route.id === "flow-builder") paintFlow();
  if (route.view === "lab" && route.id === "routing-designer") paintRoutes();
  if (route.view === "lab" && route.id === "translator") paintTranslator();
  if (route.view === "lab" && route.id === "call-path") paintPath();
  if (route.view === "lesson" && currentLesson) {
    const tone = (hub.shell.audioIndex || [])[Math.abs(hashId(currentLesson.id)) % Math.max(1, (hub.shell.audioIndex || []).length)];
    if (tone) $("#player-title").textContent = currentLesson.title;
  }
  if (route.view === "lens") paintLens();
  const pick = $("#clip-pick");
  if (pick && hub.shell && !pick.options.length) {
    pick.innerHTML = (hub.shell.audioIndex || []).map((a) => `<option value="${esc(a.id)}">${esc(a.title)}</option>`).join("");
  }
}
function hashId(text) {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 33 + text.charCodeAt(i)) >>> 0;
  return h;
}

function onClick(ev) {
  const tab = ev.target.closest("[data-tab]");
  if (tab && currentLesson) {
    lessonTab = tab.getAttribute("data-tab");
    $("#lesson-panel").innerHTML = lessonPanel(currentLesson, hub.shell.iac[currentLesson.track]);
    $$("[data-tab]").forEach((btn) => btn.setAttribute("aria-selected", btn === tab ? "true" : "false"));
    if (lessonTab === "flow") { ladderIndex = 0; paintLadder(); }
    return;
  }
  const diagramBtn = ev.target.closest("[data-open-diagram]");
  if (diagramBtn) { openLightbox(diagramBtn.getAttribute("data-open-diagram")); return; }
  if (ev.target.id === "lb-close") { const dlg = $("#lightbox"); if (dlg && dlg.open) dlg.close(); return; }
  if (ev.target.id === "lb-pause" || ev.target.id === "lb-play" || ev.target.id === "lb-step") {
    const svg = $("#lb-stage svg");
    if (svg && ev.target.id === "lb-pause") svg.pauseAnimations();
    if (svg && ev.target.id === "lb-play") svg.unpauseAnimations();
    if (svg && ev.target.id === "lb-step") {
      svg.pauseAnimations();
      try { svg.setCurrentTime((svg.getCurrentTime() || 0) + 0.4); } catch (err) { /* SMIL clock */ }
    }
    return;
  }
  const clipBtn = ev.target.closest("[data-clip-src]");
  if (clipBtn) {
    const audio = $("#architect-audio");
    if (audio) { audio.src = clipBtn.getAttribute("data-clip-src"); audio.play(); }
    return;
  }
  const atlasFilter = ev.target.closest("[data-atlas]");
  if (atlasFilter && $("#atlas-grid")) {
    const kind = atlasFilter.getAttribute("data-atlas");
    $$("[data-atlas]").forEach((btn) => btn.setAttribute("aria-pressed", btn === atlasFilter ? "true" : "false"));
    $$("#atlas-grid figure").forEach((fig) => {
      fig.hidden = kind !== "all" && fig.getAttribute("data-kind") !== kind;
    });
    return;
  }
  const menuBtn = ev.target.closest("#phone-menu, #quick-menu");
  if (menuBtn) {
    ev.preventDefault();
    if (sheetOpen()) closePhoneMenu("user");
    else openPhoneMenu(menuBtn);
    return;
  }
  if (ev.target.closest("#phone-close")) {
    ev.preventDefault();
    closePhoneMenu("user");
    return;
  }
  if (ev.target.closest("#sheet-search")) {
    ev.preventDefault();
    closePhoneMenu("user");
    openSearch();
    return;
  }
  const sheetLink = ev.target.closest("#phone-sheet a[href^='#']");
  if (sheetLink) {
    ev.preventDefault();
    closePhoneMenu("nav", sheetLink.getAttribute("href"));
    return;
  }
  const goBtn = ev.target.closest("[data-go]");
  if (goBtn) {
    const hash = goBtn.getAttribute("data-go");
    closeDrawer();
    if (goBtn.closest("#phone-sheet")) {
      closePhoneMenu("nav", hash);
      return;
    }
    closePhoneMenu("silent");
    go(hash);
    return;
  }
  if (ev.target.id === "menu" || ev.target.closest("#nav-tracks")) {
    $("#rail").classList.toggle("open");
    $("#backdrop").hidden = !$("#rail").classList.contains("open");
  }
  if (ev.target.id === "backdrop") closeDrawer();
  if (ev.target.id === "open-search" || ev.target.closest("[data-search]")) openSearch();
  if (ev.target.id === "retry") { mem.clear(); render(); }
  if (ev.target.id === "speak" || ev.target.id === "player-play") {
    const lesson = currentLesson;
    const text = lesson ? lesson.title + ". Why it matters. " + lesson.why : "Amazon Connect Lab.";
    speak(text, lesson ? lesson.title : "Amazon Connect Lab");
  }
  if (ev.target.id === "player-clip") playClip($("#clip-pick").value);
  if (ev.target.dataset.clip) playClip(ev.target.dataset.clip);
  if (ev.target.id === "player-stop") stopSpeak();
  if (ev.target.dataset.scenario) setScenario(ev.target.dataset.scenario);
  if (ev.target.id === "lad-play") playLadder();
  if (ev.target.id === "lad-pause") stopClock(ladderTimer);
  if (ev.target.id === "lad-step") {
    stopClock(ladderTimer);
    if (currentLesson) ladderIndex = (ladderIndex + 1) % currentLesson.flow.length;
    paintLadder();
  }
  if (ev.target.id === "lad-inspect") {
    const box = $("#inspect");
    if (box) { box.hidden = !box.hidden; ev.target.setAttribute("aria-pressed", box.hidden ? "false" : "true"); paintLadder(); }
  }
  if (ev.target.id === "more-figures" && currentLesson) {
    $("#more-figures-host").innerHTML = `<div class="figure-grid">${currentLesson.figures.slice(3).map(figureHtml).join("")}</div>`;
    ev.target.remove();
  }
  if (ev.target.dataset.copy) copyCode(ev.target.dataset.copy);
  if (ev.target.id === "run-flow") runFlow();
  if (ev.target.id === "load-sample") { flowState = sampleOrderStatus(); paintFlow(); $("#flow-log").textContent = "Sample loaded. Press 1 in hours to reach the queue. Out of hours plays a prompt and disconnects. Press 2 to see the missing branch."; }
  if (ev.target.id === "wire-missing" && flowState) {
    const result = wireMissing(flowState);
    paintFlow();
    $("#flow-log").textContent = result.note;
  }
  if (ev.target.id === "export-flow" && flowState) {
    const result = exportFlow(flowState);
    showFlowReport(result);
    if (result.valid) {
      const blob = new Blob([JSON.stringify(result.flow, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "connect-flow.json";
      a.click();
      URL.revokeObjectURL(url);
    }
  }
  if (ev.target.id === "import-flow") {
    const parsed = importFlow($("#flow-json").value);
    showFlowReport({ valid: parsed.ok, errors: parsed.errors, warnings: parsed.warnings, flow: parsed.flow });
    if (parsed.nodes.length) {
      flowState = { nodes: parsed.nodes, edges: parsed.edges, pending: null, seq: parsed.nodes.length + 1 };
      paintFlow();
    }
  }
  const port = ev.target.closest(".port");
  if (port && flowState) {
    if (!flowState.pending) flowState.pending = { from: port.dataset.from, port: port.dataset.port };
    else {
      flowState.edges.push({ from: flowState.pending.from, port: flowState.pending.port, to: port.dataset.from });
      flowState.pending = null;
      $("#flow-log").textContent = flowState.edges.map((e) => e.from + " " + e.port + " -> " + e.to).join("\n");
    }
  }
  if (ev.target.id === "cp-play") playPath();
  if (ev.target.id === "cp-pause") stopClock(pathTimer);
  if (ev.target.id === "cp-step") { stopClock(pathTimer); pathIndex = Math.min(pathSteps().length - 1, pathIndex + 1); paintPath(); }
  if (ev.target.id === "cp-inspect") { const log = $("#cp-log"); if (log) log.hidden = !log.hidden; paintPath(); }
  if (ev.target.id === "cp-fail") { pathFail = true; pathIndex = 0; paintPath(); playPath(); }
  if (ev.target.id === "lm-run") runLambda();
  if (ev.target.id === "er-run") runErlang();
  if (ev.target.id === "pr-run") runPrice();
  if (ev.target.id === "iam-run") runIam();
  if (ev.target.dataset.policy) loadPolicy(ev.target.dataset.policy);
  if (ev.target.id === "w-run") runWebrtc();
  if (ev.target.dataset.fault) gradeFault(ev.target.dataset.fault);
  if (ev.target.id === "fault-next") { $("#view").innerHTML = LAB["find-fault"](); }
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
    $("#ctr-help").textContent = help[ev.target.dataset.ctr] || "Field on the contact trace record.";
  }
  if (ev.target.dataset.choice != null && ev.target.closest("[data-qi]")) gradeQuiz(ev.target);
  if (ev.target.id === "quiz-next") { quizIndex += 1; $("#quiz-body").innerHTML = quizCard(); }
  if (ev.target.id === "flip") { cardShow = !cardShow; $("#card-body").innerHTML = cardFace(); }
  if (ev.target.id === "card-known" || ev.target.id === "card-again") {
    const c = hub.cards.cards[cardIndex % hub.cards.cards.length];
    if (ev.target.id === "card-known" && !state.cards.known.includes(c.id)) state.cards.known.push(c.id);
    cardIndex += 1;
    cardShow = false;
    save();
    $("#card-body").innerHTML = cardFace();
  }
  if (ev.target.id === "sc-next") {
    const id = ev.target.dataset.sid;
    state.scenario[id] = (state.scenario[id] || 0) + 1;
    save();
    render();
  }
  if (ev.target.id === "rq-add") addRouteRow();
  if (ev.target.id === "rq-run") runRoutes();
  if (ev.target.id === "ports-reset") {
    const best = (state.ports && state.ports.best) || 0;
    state.ports = { index: 0, score: 0, done: false, best };
    save();
    render();
    return;
  }
  if (ev.target.id === "ports-next") { render(); return; }
  const portBtn = ev.target.closest("[data-port]");
  if (portBtn && route.view === "ports") { answerPort(studioCtx(), Number(portBtn.getAttribute("data-port"))); return; }
  const dailyBtn = ev.target.closest("[data-daily]");
  if (dailyBtn && route.view === "daily") { answerDaily(studioCtx(), Number(dailyBtn.getAttribute("data-daily"))); return; }
  if (ev.target.id === "share-card") {
    shareCard(ev.target.getAttribute("data-share-title") || "Amazon Connect Lab", ev.target.getAttribute("data-share-line") || "Study card");
    return;
  }
  const syllabusBox = ev.target.closest("[data-syllabus]");
  if (syllabusBox) {
    state.syllabus = state.syllabus || {};
    const id = syllabusBox.getAttribute("data-syllabus");
    if (syllabusBox.checked) state.syllabus[id] = true;
    else delete state.syllabus[id];
    save();
  }
  if (ev.target.id === "theme-toggle") {
    if ((state.theme || "dark") === "light") state.theme = state.themeBack || "neon";
    else { state.themeBack = state.theme || "dark"; state.theme = "light"; }
    save();
    applyPrefs();
    $$("button[data-theme]").forEach((btn) => btn.setAttribute("aria-pressed", btn.dataset.theme === state.theme ? "true" : "false"));
    return;
  }
  const themeBtn = ev.target.closest("button[data-theme]");
  if (themeBtn && themeBtn.dataset.theme) {
    state.theme = themeBtn.dataset.theme;
    if (state.theme !== "light") state.themeBack = state.theme;
    save();
    applyPrefs();
    $$("button[data-theme]").forEach((btn) => btn.setAttribute("aria-pressed", btn.dataset.theme === state.theme ? "true" : "false"));
  }
  const fontBtn = ev.target.closest("button[data-font]");
  if (fontBtn && fontBtn.dataset.font) {
    state.fontSize = fontBtn.dataset.font;
    save();
    applyPrefs();
    $$("button[data-font]").forEach((btn) => btn.setAttribute("aria-pressed", btn.dataset.font === state.fontSize ? "true" : "false"));
  }
  if (ev.target.id === "preview-voice") speak("Amazon Connect Lab. This is the voice that reads a lesson.", "Voice preview", true);
  if (ev.target.dataset.kind && hub.reference) {
    $$("[data-kind]").forEach((b) => b.setAttribute("aria-pressed", b === ev.target ? "true" : "false"));
    const k = ev.target.dataset.kind;
    $("#time-list").innerHTML = timelineItems(k === "All" ? hub.reference.timeline : hub.reference.timeline.filter((t) => t.kind === k));
  }
  if (ev.target.id === "gloss-more") { glossShown += 8; $("#gloss-list").innerHTML = glossaryList($("#gloss-q") ? $("#gloss-q").value : ""); }
  if (ev.target.id === "chart-more") { chartPage += 1; $("#chart-list").innerHTML = chartSlice(); }
  if (ev.target.id === "fault-prev") { faultPage = Math.max(0, faultPage - 1); $("#fault-list").innerHTML = faultSlice(); }
  if (ev.target.id === "fault-next-page") { faultPage += 1; $("#fault-list").innerHTML = faultSlice(); }
  if (ev.target.id === "ccp-ring") startRing();
  if (ev.target.id === "ccp-answer") answerCall();
  if (ev.target.id === "ccp-hold") { if (ccp && ccp.status === "Connected") { ccp.held = !ccp.held; ccpLog(ccp.held ? "Customer on hold." : "Hold released."); } }
  if (ev.target.id === "ccp-end") endCall();
  if (ev.target.id === "ccp-save") saveWrap();
  if (ev.target.id === "lens-play") playLens();
  if (ev.target.id === "lens-pause") stopClock(lensTimer);
}

function setScenario(id) {
  $$("[data-scenario]").forEach((btn) => btn.setAttribute("aria-pressed", btn.dataset.scenario === id ? "true" : "false"));
  if (sceneHandle) sceneHandle.setScenario(id);
  const copy = SCENARIOS.find((row) => row[0] === id);
  const status = $("#arch-status");
  if (status && copy) status.textContent = copy[1] + ". " + copy[2];
  const fallback = $("#arch-fallback");
  if (fallback) {
    fallback.querySelectorAll("line").forEach((line) => { line.setAttribute("stroke", id === "none" ? "#2dd4bf" : "#fb7185"); });
  }
}
function copyCode(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const text = el.textContent;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => { el.dataset.copied = "yes"; }, () => selectFallback(el));
  } else selectFallback(el);
}
function selectFallback(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}
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
  $("#rq-log").textContent = eligible.length ? "Eligible, best priority first: " + eligible.map((r) => r.name + " (priority " + r.priority + ")").join(", ") + "." : "No queue is eligible yet.";
}
function paintTranslator() {
  const sel = $("#tr-p");
  if (!sel || !hub.reference) return;
  const rows = hub.reference.bridge.filter((b) => b.platform === sel.value);
  $("#tr-out").innerHTML = `<div class="table-scroll"><table><thead><tr><th>Old</th><th>Connect</th><th>Pitfall</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${esc(r.old)}</td><td>${esc(r.next)}</td><td>${esc(r.pitfall)}</td></tr>`).join("")}</tbody></table></div>`;
}
function runLambda() {
  const mode = $("#lm-mode").value;
  const timeout = Number($("#lm-to").value);
  const dur = Number($("#lm-dur").value);
  let body;
  try { body = JSON.parse($("#lm-body").value); }
  catch (err) { $("#lm-log").textContent = "Invalid JSON. The flow takes Error."; return; }
  const cap = mode === "Synchronous" ? Math.min(timeout, 8) : Math.min(timeout, 60);
  if (mode === "Synchronous" && timeout > 8) { $("#lm-log").textContent = "Synchronous timeout cannot exceed 8 seconds. Connect will not wait " + timeout + "s."; return; }
  if (dur > cap) { $("#lm-log").textContent = "Duration " + dur + "s exceeds the block wait of " + cap + "s. Branch: " + (mode === "Synchronous" ? "Timeout, exported as TimeLimitExceeded." : "the Wait you configured") + "."; return; }
  const flat = Object.values(body).every((v) => typeof v === "string");
  if ($("#lm-val").value === "STRING_MAP" && !flat) { $("#lm-log").textContent = "STRING_MAP requires a flat object of strings. Branch: Error."; return; }
  $("#lm-log").textContent = "Branch: Success. Attributes available to the next block:\n" + JSON.stringify(body, null, 2);
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
  for (; n < a + 400; n += 1) {
    sl = serviceLevel(a, n, target, aht);
    if (sl >= slTarget) break;
  }
  const roster = Math.ceil(n / (1 - shrink));
  const pWait = erlangC(a, n);
  $("#er-out").innerHTML = `<p class="num">${roster}</p><p>Raw agents ${n} at ${a.toFixed(2)} Erlangs. Probability of waiting ${ (pWait * 100).toFixed(1) }%. Service level ${(sl * 100).toFixed(1)}%. Shrinkage lifts the roster to ${roster}.</p>${erlangChart(a, target, aht, n)}`;
}
function runPrice() {
  const customer = $("#pr-form").value === "customer";
  const voice = customer ? 0.038 : 0.018;
  const chat = customer ? 0.010 : 0.004;
  const email = customer ? 0.080 : 0.050;
  const lines = [
    ["Voice service", Number($("#pr-min").value) * voice],
    ["US DID inbound telephony", Number($("#pr-in").value) * 0.0022],
    ["US outbound telephony", Number($("#pr-out").value) * 0.0048],
    ["DID daily", Number($("#pr-days").value) * 0.03],
    ["Chat", Number($("#pr-chat").value) * chat],
    ["Email", Number($("#pr-email").value) * email],
  ];
  const total = lines.reduce((s, r) => s + r[1], 0);
  $("#pr-result").innerHTML = `<p class="num">$${total.toFixed(2)}</p><p>Estimate dated 14 October 2026. ${customer ? "Connect Customer" : "Customer Basic"}.</p><div class="table-scroll"><table>${lines.map((r) => `<tr><td>${r[0]}</td><td>$${r[1].toFixed(2)}</td></tr>`).join("")}</table></div>`;
}
function loadPolicy(kind) {
  const samples = {
    star: '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"connect:*","Resource":"*"}]}',
    ok: '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["connect:DescribeInstance","connect:ListQueues"],"Resource":"arn:aws:connect:us-west-2:123456789012:instance/example"}]}',
    voice: '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"voiceid:*","Resource":"*"}]}',
  };
  $("#iam-body").value = samples[kind];
}
function runIam() {
  let doc;
  try { doc = JSON.parse($("#iam-body").value); }
  catch (err) { $("#iam-log").textContent = "Not JSON."; return; }
  const findings = [];
  [].concat(doc.Statement || []).forEach((st) => {
    [].concat(st.Action || []).forEach((a) => {
      if (a === "connect:*" || a === "*") findings.push("Action " + a + " is broader than an operator needs.");
      if (String(a).startsWith("voiceid:")) findings.push("voiceid is a retired feature as of 20 May 2026. Do not grant it for a new design.");
    });
    if ([].concat(st.Resource || []).includes("*")) findings.push("Resource * is not limited to one instance.");
  });
  if (!findings.length) findings.push("No broad-action findings. Still confirm the resource is the instance you mean.");
  $("#iam-log").textContent = findings.join("\n");
}
function runWebrtc() {
  const notes = [];
  if (!$("#w-udp").checked) notes.push("UDP 3478 blocked. Expect: failed to establish softphone, TurnNlb, ice_collection_timeout.");
  if (!$("#w-tcp").checked) notes.push("TCP 443 blocked. The CCP UI and signaling will not load.");
  if ($("#w-vpn").checked) notes.push("VPN on the media path. Expect jitter, drops, or one-way audio.");
  if ($("#w-stateless").checked) notes.push("Stateless firewall without the ephemeral range. Return media is dropped.");
  if (!$("#w-dns").checked) notes.push("DNS failure. The browser cannot resolve TurnNlb.");
  if (!notes.length) notes.push("This path matches domains on 443 and UDP 3478, no VPN, DNS working.");
  $("#w-log").textContent = notes.join("\n");
}
function gradeFault(choice) {
  const box = $("#fault-box");
  const ok = choice === box.dataset.answer;
  $("#fault-why").innerHTML = `<p>${ok ? "Correct." : "Not that fix."} ${esc(box.dataset.answer)}</p>`;
}
function runHours() {
  const raw = $("#hr-when").value;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) { $("#hr-log").textContent = "Unreadable date."; return; }
  const day = d.getDay();
  const mins = d.getHours() * 60 + d.getMinutes();
  const holiday = raw.startsWith("2026-12-25");
  const open = !holiday && day >= 1 && day <= 5 && mins >= 8 * 60 && mins < 18 * 60;
  $("#hr-log").textContent = open ? "In hours. Check hours takes the In hours branch." : "Out of hours. " + (holiday ? "Holiday override." : "Outside Monday-Friday 08:00-18:00.") ;
}
function runLex() {
  const u = $("#lx-u").value.toLowerCase();
  let intent = "Fallback";
  const slots = {};
  if (u.includes("order")) { intent = "OrderStatus"; const m = u.match(/\d+/); if (m) slots.OrderId = m[0]; }
  else if (u.includes("agent") || u.includes("person")) intent = "Agent";
  $("#lx-log").textContent = "Intent " + intent + "\nSlots " + JSON.stringify(slots) + "\nFallback goes to a queue, not another loop.";
}
function runSaml() {
  const missing = [];
  if (!$("#sa-role").value.trim()) missing.push("role");
  if (!$("#sa-route").value.trim()) missing.push("routing profile");
  if (!$("#sa-sec").value.trim()) missing.push("security profile");
  $("#sa-log").textContent = missing.length ? "Missing: " + missing.join(", ") + "." : "Assertion has the three required mappings.";
}
function runRes() {
  const pair = $("#rs-pair").value;
  const pct = Number($("#rs-pct").value);
  const lines = [];
  if (pair.includes("eu-west-1") && pair.startsWith("us-east-1")) lines.push("That pair is not a documented Global Resiliency pair.");
  else lines.push("Pair is supported. Source telephony at " + pct + " percent.");
  if (pct % 10 !== 0) lines.push("Distribution moves in 10 percent steps.");
  if (pair.startsWith("ap-northeast-1")) lines.push("Osaka is the replica. Inbound delivery can take up to 20 seconds.");
  $("#rs-log").textContent = lines.join("\n");
}
function runQuota() {
  const name = $("#qq").value;
  const row = hub.reference.quotas.find((q) => q.name === name);
  const used = Number($("#qq-u").value);
  const match = String(row.value).match(/\d+/);
  const cap = match ? Number(match[0]) : 0;
  const pct = cap ? Math.round((used / cap) * 100) : 0;
  $("#qq-log").textContent = row.name + " default: " + row.value + ".\nUsage is about " + pct + "% of the first number.\n" + (pct >= 80 ? "At or above 80 percent. Request a raise." : "Under 80 percent.") + "\nAdjustable: " + row.adjustable + ".";
}
function runCert() {
  const plans = {
    Admin: "Cloud Practitioner for vocabulary, then the Amazon Connect Fundamentals badge (80 percent). There is no Connect specialty exam.",
    Architect: "Solutions Architect - Associate matches the surrounding AWS design. Security - Specialty if you own IAM and KMS.",
    Developer: "Developer - Associate, then the Amazon Connect Developer badge: CLI, API, Lambda, Kinesis, EventBridge, CloudFormation.",
    Network: "The CCP path is the work: domains, UDP 3478, no VPN on media.",
    AI: "AI Practitioner for concepts. Amazon Connect AI Fundamentals for assist and conversational analytics. The badge is not a certification exam.",
  };
  $("#ce-out").innerHTML = `<p>${esc(plans[$("#ce").value])}</p><p class="cite"><a href="https://aws.amazon.com/certification/">AWS Certification catalog</a></p>`;
}
function runE911() {
  const ids = ["e1", "e2", "e3", "e4", "e5", "e6"];
  const labels = { e1: "Region", e2: "Validated address", e3: "CivicAddress whisper", e4: "933 test", e5: "Security task", e6: "Direct dial only" };
  const missing = ids.filter((id) => !$("#" + id).checked);
  $("#e-log").textContent = missing.length ? "Not ready: " + missing.map((id) => labels[id]).join(", ") + "." : "The checklist matches the US emergency-calling pages. Do not use the headquarters address for a home agent.";
}
function runWfm() {
  const planned = 450;
  const unplanned = Number($("#wf-o").value);
  const adherence = Math.max(0, (planned - unplanned) / planned);
  $("#wf-log").textContent = "Planned in-adherence minutes are 450.\nAdherence " + (adherence * 100).toFixed(1) + "%.\nAgent events are the actuals.";
}
function runHook() {
  const map = {
    pop: "Hook: contact attribute plus a Streams event on connecting. Key: ContactId and your customer id.",
    wfm: "Hook: agent event stream. Do not poll the real-time page.",
    qm: "Hook: S3 recording plus CTR, or Kinesis Video if the tool must hear the live call.",
    bot: "Hook: Lambda if you already own the function. Mind the 8-second sync cap.",
    case: "Hook: Cases block and the case id attribute.",
  };
  $("#hk-log").textContent = map[$("#hk").value];
}
function gradeQuiz(button) {
  const card = button.closest("[data-qi]");
  const q = hub.quiz.questions.find((item) => item.id === card.dataset.qi);
  const choice = Number(button.dataset.choice);
  const ok = choice === q.answer;
  if (!state.quiz.seen[q.id]) {
    state.quiz.seen[q.id] = true;
    state.quiz.answered += 1;
    if (ok) state.quiz.correct += 1;
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

let ccpTicker = null;
function startRing() {
  stopClock(ccpTicker);
  stopTones();
  setCcp({ status: "Ringing", caller: "Inbound · +1 503 555 0148", seconds: 0, held: false, sentiment: 0.2 });
  ccpLog("Incoming contact. The ring is local. Answer to start the talk clock.");
  if (!motionReduced()) {
    const pulse = () => { beep(440, 0, 0.4); beep(480, 0, 0.4); };
    pulse();
    ccpTicker = every(pulse, 2000);
  }
}
function answerCall() {
  if (!ccp || ccp.status !== "Ringing") { ccpLog("There is no ringing contact."); return; }
  stopClock(ccpTicker);
  stopTones();
  beep(523, 0, 0.08);
  beep(659, 0.1, 0.12);
  ccp.status = "Connected";
  ccp.seconds = 0;
  setCcp(ccp);
  ccpTicker = every(() => {
    if (!ccp || ccp.status !== "Connected") return;
    ccp.seconds += 1;
    ccp.sentiment = Math.max(-1, Math.min(1, ccp.sentiment + (Math.random() - 0.45) * 0.15));
    const timer = $("#ccp-timer");
    if (timer) timer.textContent = String(Math.floor(ccp.seconds / 60)).padStart(2, "0") + ":" + String(ccp.seconds % 60).padStart(2, "0");
    const needle = $("#ccp-needle");
    if (needle) needle.style.left = ((ccp.sentiment + 1) / 2 * 100) + "%";
    const mood = $("#ccp-mood");
    if (mood) mood.textContent = "Sentiment " + ccp.sentiment.toFixed(2);
  }, 1000);
  ccpLog("Connected. Media in this simulator is a tone, not WebRTC. Sentiment is a teaching meter.");
}
function endCall() {
  stopClock(ccpTicker);
  stopTones();
  beep(220, 0, 0.25);
  if (ccp) { ccp.status = "After contact work"; setCcp(ccp); }
  ccpLog("Contact ended. Choose a wrap-up code and save it. The agent is in ACW until then.");
}
function saveWrap() {
  const code = $("#ccp-wrap") ? $("#ccp-wrap").value : "Resolved";
  stopClock(ccpTicker);
  setCcp({ status: "Available", caller: "No contact", seconds: 0, held: false, sentiment: 0 });
  ccpLog("Wrap-up saved: " + code + ". Agent is Available.");
}

function speak(text, title, force) {
  $("#player-title").textContent = title || "Amazon Connect Lab";
  if (!force && state.narration === false) {
    $("#player-state").textContent = "Narration is off. Turn it on in Settings.";
    return;
  }
  if (!window.speechSynthesis) { $("#player-state").textContent = "This browser has no speech synthesis."; return; }
  const start = () => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return false;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = Math.min(1.6, Math.max(0.6, Number(state.rate) || 1));
    const voice = pickVoice(voices);
    if (voice) utter.voice = voice;
    else if (!state.voiceURI) {
      $("#player-state").textContent = "No non-Edge voice is installed. Pick a voice in Settings if you want one.";
      return true;
    }
    utter.onend = () => { const el = $("#player-state"); if (el) el.textContent = "Idle"; };
    window.speechSynthesis.speak(utter);
    $("#player-state").textContent = voice ? "Speaking · " + voice.name : "Speaking";
    drawWave();
    return true;
  };
  if (start()) return;
  const onVoices = () => {
    window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
    start();
  };
  window.speechSynthesis.addEventListener("voiceschanged", onVoices);
  window.speechSynthesis.getVoices();
  $("#player-state").textContent = "Waiting for voices";
}
function stopSpeak() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  stopTones();
  $("#player-state").textContent = "Stopped";
}
function drawWave() {
  const canvas = $("#wave");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#2dd4bf";
  ctx.beginPath();
  for (let x = 0; x < canvas.width; x += 1) {
    const y = 18 + Math.sin(x / 8) * (motionReduced() ? 2 : 10);
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}
async function playClip(id) {
  hub.audio = hub.audio || await load("data/audio.json");
  const clip = (hub.audio.clips || []).find((a) => a.id === id);
  const el = $("#clip");
  if (!clip || !el) return;
  el.src = "data:audio/wav;base64," + clip.b64;
  el.play();
  $("#player-title").textContent = clip.title;
  $("#player-state").textContent = "Tone";
  drawWave();
}
function openSearch() {
  $("#search-modal").hidden = false;
  $("#q").value = "";
  $("#hits").innerHTML = "";
  $("#q").focus();
}
async function search(query) {
  const n = query.trim().toLowerCase();
  if (!n) { $("#hits").innerHTML = ""; return; }
  if (!hub.search) hub.search = await load("data/search.json");
  const extra = [
    { href: "#/cheats", label: "Cheat codes", meta: "Downloads", text: "cheat sheet pdf png ports firewall glossary flashcards offline zip download" },
    { href: "#/syllabus", label: "Syllabus", meta: "Map", text: "fundamentals migration e911 wfm certification career checklist" },
    { href: "#/ports", label: "Ports game", meta: "Game", text: "3478 443 firewall udp tcp turn ports protocols mastery" },
    { href: "#/explorer", label: "Flow map explorer", meta: "Map", text: "pstn ccp call flow ladder signal path" },
    { href: "#/daily", label: "Daily challenge", meta: "Quiz", text: "daily question challenge" },
    { href: "#/career", label: "Career paths", meta: "Career", text: "interview badge certification architect" },
    { href: "#/sandbox", label: "Call flow sandbox", meta: "Lab", text: "build your own contact flow sandbox" },
    { href: "#/diagrams", label: "Diagrams", meta: "Atlas", text: "diagram atlas architecture firewall cutover e911" },
    { href: "#/flows", label: "Flows", meta: "Atlas", text: "animated flow ladder signal routing" },
    { href: "#/charts", label: "Charts", meta: "Atlas", text: "chart quota price concurrency" },
    { href: "#/play", label: "Play", meta: "Games", text: "play ports daily sandbox game" },
    { href: "#/downloads", label: "Downloads", meta: "Cheat codes", text: "download zip offline cheat sheet pdf png" },
  ];
  const hits = hub.search.hits.concat(extra).filter((h) => h.text.includes(n)).slice(0, 20);
  $("#hits").innerHTML = hits.map((h) => `<button class="hit" data-go="${esc(h.href)}"><strong>${esc(h.label)}</strong><br><span class="meta">${esc(h.meta)}</span></button>`).join("") || `<p>No matches.</p>`;
}

document.addEventListener("click", onClick);
window.addEventListener("hashchange", render);
window.addEventListener("popstate", () => {
  if (sheetOpen()) closePhoneMenu("back");
});
document.addEventListener("keydown", (ev) => {
  if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "k") { ev.preventDefault(); openSearch(); }
  if (ev.key === "Escape") {
    $("#search-modal").hidden = true;
    closeDrawer();
    if (sheetOpen()) closePhoneMenu("user");
  }
  if (sheetOpen() && ev.key === "Tab") {
    const items = $$("#phone-sheet a, #phone-sheet button, #phone-sheet select").filter((el) => !el.disabled);
    if (items.length) {
      const first = items[0];
      const last = items[items.length - 1];
      if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
    }
  }
  const typing = ev.target && (ev.target.tagName === "INPUT" || ev.target.tagName === "TEXTAREA" || ev.target.tagName === "SELECT");
  const menuLink = document.activeElement && document.activeElement.closest && document.activeElement.closest(".campus-menu a, .phone-sections a");
  if (menuLink && (ev.key === "ArrowRight" || ev.key === "ArrowLeft" || ev.key === "ArrowDown" || ev.key === "ArrowUp")) {
    const links = $$(menuLink.closest(".phone-sections") ? ".phone-sections a" : ".campus-menu a");
    const index = links.indexOf(menuLink);
    if (index >= 0) {
      ev.preventDefault();
      const forward = ev.key === "ArrowRight" || ev.key === "ArrowDown";
      const next = forward ? links[(index + 1) % links.length] : links[(index - 1 + links.length) % links.length];
      next.focus();
    }
  }
  if (typing) return;
  const key = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;
  if (key === KONAMI[konamiAt]) {
    konamiAt += 1;
    if (konamiAt === KONAMI.length) { konamiAt = 0; unlockEgg(); }
  } else {
    konamiAt = key === KONAMI[0] ? 1 : 0;
  }
});
$("#q").addEventListener("input", (ev) => { search(ev.target.value); });
document.body.addEventListener("input", (ev) => {
  if (ev.target.id === "gloss-q") { glossShown = 8; $("#gloss-list").innerHTML = glossaryList(ev.target.value); }
  if (ev.target.id === "lens-scrub") { lensTime = Number(ev.target.value); paintLens(); }
  if (ev.target.id === "lens-redact") paintLens();
  if (ev.target.id === "set-rate") {
    state.rate = Number(ev.target.value);
    save();
    const read = $("#set-rate-read");
    if (read) read.textContent = state.rate.toFixed(1) + "×";
  }
});
document.body.addEventListener("change", (ev) => {
  if (ev.target.id === "tr-p") paintTranslator();
  if (ev.target.id === "set-sound") { state.sound = ev.target.checked; save(); }
  if (ev.target.id === "set-narration") { state.narration = ev.target.checked; save(); }
  if (ev.target.id === "set-motion") {
    state.reducedMotion = ev.target.checked;
    save();
    applyPrefs();
    if (motionReduced()) {
      if (sceneHandle) { sceneHandle.dispose(); sceneHandle = null; }
      if (heroHandle) { heroHandle.dispose(); heroHandle = null; }
      const host = $("#hero-host");
      if (host) host.dataset.mode = "flat";
    } else if (route.view === "home") {
      bootHero(renderGen);
    }
  }
  if (ev.target.id === "set-voice") { state.voiceURI = ev.target.value; save(); }
  if (ev.target.id === "lang" || ev.target.id === "sheet-lang" || ev.target.id === "set-lang") {
    state.lang = ev.target.value;
    save();
    applyLanguage(state.lang);
    const mascot = $("#mascot");
    if (mascot) mascot.dataset.look = String((state.lang || "en").length % 5);
    if (route.view === "lesson" || route.view === "track") render();
  }
});
document.body.addEventListener("dragstart", (ev) => { if (ev.target.dataset.pal) ev.dataTransfer.setData("text/plain", ev.target.dataset.pal); });
document.body.addEventListener("dragover", (ev) => { if (ev.target.id === "canvas" || (ev.target.closest && ev.target.closest("#canvas"))) ev.preventDefault(); });
document.body.addEventListener("drop", (ev) => {
  const canvas = ev.target.id === "canvas" ? ev.target : ev.target.closest && ev.target.closest("#canvas");
  if (!canvas || !flowState) return;
  ev.preventDefault();
  const type = ev.dataTransfer.getData("text/plain");
  if (!PORTS[type] && type !== "Flow entry") return;
  const rect = canvas.getBoundingClientRect();
  flowState.nodes.push({ uid: "n" + (flowState.seq || flowState.nodes.length + 1), type, x: ev.clientX - rect.left - 40, y: ev.clientY - rect.top - 20 });
  flowState.seq = (flowState.seq || flowState.nodes.length) + 1;
  paintFlow();
});
window.addEventListener("pagehide", haltTimers);
applyPrefs();
if (window.speechSynthesis) {
  window.speechSynthesis.addEventListener("voiceschanged", () => { if ($("#set-voice")) fillVoices(); });
  window.speechSynthesis.getVoices();
}
tickMascot(motionReduced());
setInterval(() => tickMascot(motionReduced()), 7000);
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => { /* offline until the next visit */ });
}
setTimeout(() => {
  const modules = (hub.shell && hub.shell.modules) || [];
  modules.forEach((path) => { fetch(path).catch(() => { /* filled on the next open */ }); });
}, 12000);
render();
