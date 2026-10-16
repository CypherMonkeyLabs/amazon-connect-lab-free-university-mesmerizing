import { matchIntent } from "./engine.mjs";

function monkeyMarkup(id) {
  return '<svg class="monkey pose-idle" viewBox="0 0 200 230" role="img" aria-label="Guide monkey wearing glasses">' +
    '<defs><linearGradient id="' + id + '" x1="30" y1="20" x2="170" y2="210">' +
    '<stop offset="0" stop-color="#fef3c7"/><stop offset="0.45" stop-color="#fbbf24"/><stop offset="1" stop-color="#f59e0b"/>' +
    "</linearGradient></defs>" +
    '<ellipse cx="100" cy="214" rx="48" ry="8" fill="#1e1b4b" opacity="0.16"/>' +
    '<circle class="ear" cx="32" cy="92" r="30" fill="url(#' + id + ')" stroke="#b45309" stroke-width="4"/>' +
    '<circle class="ear-inner" cx="32" cy="92" r="15" fill="#fecdd3"/>' +
    '<circle class="ear" cx="168" cy="92" r="30" fill="url(#' + id + ')" stroke="#b45309" stroke-width="4"/>' +
    '<circle class="ear-inner" cx="168" cy="92" r="15" fill="#fecdd3"/>' +
    '<path class="tail" d="M148 170 C188 162 192 124 166 114" fill="none" stroke="#ea580c" stroke-width="11" stroke-linecap="round"/>' +
    '<ellipse cx="100" cy="176" rx="54" ry="36" fill="url(#' + id + ')" stroke="#b45309" stroke-width="3"/>' +
    '<ellipse cx="100" cy="184" rx="28" ry="18" fill="#fff7ed"/>' +
    '<path class="arm arm-left" d="M58 158 C28 156 16 188 38 202" fill="none" stroke="#f59e0b" stroke-width="14" stroke-linecap="round"/>' +
    '<path class="arm arm-wave" d="M142 156 C174 146 188 176 170 198" fill="none" stroke="#f59e0b" stroke-width="14" stroke-linecap="round"/>' +
    '<path d="M74 40 Q88 16 100 38 Q114 14 128 42" fill="#f59e0b" stroke="#b45309" stroke-width="3" stroke-linejoin="round"/>' +
    '<circle cx="100" cy="98" r="64" fill="url(#' + id + ')" stroke="#b45309" stroke-width="4"/>' +
    '<ellipse cx="100" cy="122" rx="38" ry="28" fill="#fff7ed" stroke="#fdba74" stroke-width="2"/>' +
    '<circle cx="58" cy="116" r="11" fill="#fb7185"/>' +
    '<circle cx="142" cy="116" r="11" fill="#fb7185"/>' +
    '<g class="eye"><ellipse cx="74" cy="90" rx="16" ry="18" fill="#fff" stroke="#1e1b4b" stroke-width="2"/>' +
    '<circle cx="76" cy="94" r="7.5" fill="#1e1b4b"/><circle cx="79" cy="90" r="2.6" fill="#fff"/></g>' +
    '<g class="eye"><ellipse cx="126" cy="90" rx="16" ry="18" fill="#fff" stroke="#1e1b4b" stroke-width="2"/>' +
    '<circle cx="128" cy="94" r="7.5" fill="#1e1b4b"/><circle cx="131" cy="90" r="2.6" fill="#fff"/></g>' +
    '<circle cx="76" cy="92" r="24" fill="none" stroke="#312e81" stroke-width="4.5"/>' +
    '<circle cx="128" cy="92" r="24" fill="none" stroke="#312e81" stroke-width="4.5"/>' +
    '<path d="M100 92h4" stroke="#312e81" stroke-width="4.5" stroke-linecap="round"/>' +
    '<path d="M52 88 H40 M152 88 H164" stroke="#312e81" stroke-width="4.5" stroke-linecap="round"/>' +
    '<ellipse cx="100" cy="120" rx="9" ry="7" fill="#ea580c"/>' +
    '<ellipse cx="97" cy="118" rx="2.2" ry="1.5" fill="#fff" opacity="0.8"/>' +
    '<path d="M80 136 Q100 154 120 136" fill="none" stroke="#9a3412" stroke-width="3.2" stroke-linecap="round"/>' +
    "</svg>";
}

var STEPS = [
  { sel: "[data-tour='home']", title: "Home", text: "Home is the track map. Start here when you want the whole lab." },
  { sel: "[data-tour='menu']", title: "Menu", text: "Menu opens the drawer. Each row has an icon, a name, and one line. Search sits at the top." },
  { sel: "[data-tour='learn']", title: "Learn", text: "Learn is the ten-minute path and the full course." },
  { sel: "[data-tour='diagrams']", also: "[data-tour='downloads']", title: "Diagrams", text: "Diagrams are the pictures. Downloads, in this same row, keeps the sheets and the zip." },
  { sel: "[data-tour='play']", title: "Play", text: "Play is the routing, Lambda, port, and bridge drills. They cite the lesson they use." },
  { sel: "[data-tour='listen']", also: "[data-tour='bot']", title: "Listen", text: "Listen holds the study clips. The monkey bot docks on this side after the tour. Replay anytime from Help." }
];

var kbPromise = null;
var speaking = false;
var follow = false;
var recog = null;
var ambientStop = null;
var idleOffers = 0;
var idleTimer = 0;
var drag = null;

function prefix() {
  var nodes = document.querySelectorAll("script[src]");
  for (var i = 0; i < nodes.length; i++) {
    var src = nodes[i].getAttribute("src") || "";
    var at = src.indexOf("guide/guide.js");
    if (at !== -1) return src.slice(0, at);
  }
  return "";
}
var rootPrefix = prefix();

function abs(href) {
  if (!href) return "";
  if (/^(https?:|#)/.test(href)) return href;
  return rootPrefix + href.replace(/^\//, "");
}

function reduced() {
  return document.documentElement.dataset.motion === "reduce" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function pose(name) {
  document.querySelectorAll(".monkey").forEach(function (node) {
    node.setAttribute("class", "monkey pose-" + name);
  });
}

function loadKb() {
  if (!kbPromise) {
    kbPromise = fetch(abs("guide/kb.json")).then(function (res) { return res.json(); }).catch(function () {
      return { rooms: [], pages: [] };
    });
  }
  return kbPromise;
}

var host = document.getElementById("guide-mount") || document.body;
var launcher = document.createElement("button");
launcher.type = "button";
launcher.className = "bot-launcher";
launcher.setAttribute("data-tour", "bot");
launcher.setAttribute("aria-label", "Open the guide monkey");
launcher.innerHTML = monkeyMarkup("fur-dock");
launcher.setAttribute("aria-expanded", "false");
host.appendChild(launcher);

var scrim = document.createElement("div");
scrim.className = "bot-scrim";
scrim.hidden = true;
host.appendChild(scrim);

var sheet = document.createElement("div");
sheet.className = "bot-sheet";
sheet.hidden = true;
sheet.setAttribute("role", "dialog");
sheet.setAttribute("aria-modal", "true");
sheet.setAttribute("aria-label", "Guide monkey");
sheet.innerHTML =
  '<div class="sheet-handle" data-handle role="presentation" aria-hidden="true"></div>' +
  '<div class="sheet-scroll">' +
  '<div class="greet-hero">' + monkeyMarkup("fur-sheet") +
  '<div><p class="kicker">Connect guide</p><p>Pick a path. Read this page glows each section as it is spoken.</p></div></div>' +
  '<div class="choice-grid">' +
  '<button type="button" data-go="start.html#ten">Finish in 10 minutes</button>' +
  '<button type="button" data-go="index.html#rooms">Full course</button>' +
  '<button type="button" data-go="downloads.html">Just download</button>' +
  "</div>" +
  '<p class="export-offer" data-export-offer></p>' +
  '<div class="bot-log" data-log></div>' +
  '<p class="say-line" data-say hidden><mark data-say-mark></mark></p>' +
  '<details class="bot-extra">' +
  '<summary>Rate, sound, and ask</summary>' +
  '<div class="bot-controls">' +
  '<button type="button" data-follow>Read along</button>' +
  '<button type="button" data-mic>Mic</button>' +
  "</div>" +
  '<div class="voice-row">' +
  '<label>Rate <input data-rate type="range" min="0.6" max="1.3" step="0.05" value="0.92"></label>' +
  '<label>Pitch <input data-pitch type="range" min="0.8" max="1.3" step="0.05" value="1"></label>' +
  '<label class="check-line"><input data-ambient type="checkbox"> Soft ambient sound, off unless you check this</label>' +
  "</div>" +
  '<form class="bot-form" data-ask><input type="text" data-ask-text aria-label="Ask for a page" placeholder="Try queues, lambda, or downloads"><button type="submit">Go</button></form>' +
  "</details>" +
  "</div>" +
  '<div class="read-row">' +
  '<button type="button" data-read-page>Read this page</button>' +
  '<button type="button" data-stop-speech>Stop</button>' +
  '<label>Voice <select data-voice-name></select></label>' +
  "</div>" +
  '<button type="button" class="sheet-close" data-close-bot>Close</button>';
host.appendChild(sheet);

var greet = document.createElement("div");
greet.className = "bot-greet";
greet.hidden = true;
greet.setAttribute("role", "dialog");
greet.setAttribute("aria-modal", "true");
greet.setAttribute("aria-label", "Welcome");
greet.innerHTML =
  '<div class="greet-hero">' + monkeyMarkup("fur-greet") +
  '<div><p class="kicker">Welcome to CypherMonkey Labs</p>' +
  "<p>I'm the Connect guide. This lab is independent and free. I can only talk about the pages here.</p></div></div>" +
  '<div class="choice-grid">' +
  '<button type="button" data-go="start.html#ten">Finish in 10 minutes</button>' +
  '<button type="button" data-go="index.html#rooms">Full course</button>' +
  '<button type="button" data-go="downloads.html">Just download</button>' +
  "</div>" +
  '<div class="bot-controls"><button type="button" data-close-greet>Dock the monkey</button></div>';
host.appendChild(greet);

var idlePop = document.createElement("div");
idlePop.className = "idle-pop bot-sheet";
idlePop.hidden = true;
idlePop.innerHTML = "<p>Need a hand with this page?</p>" +
  '<div class="bot-controls"><button type="button" data-idle-yes>Yes</button>' +
  '<button type="button" data-idle-later>Not now</button>' +
  '<button type="button" data-idle-stop>Stop offering</button></div>';
host.appendChild(idlePop);

var tour = document.createElement("div");
tour.className = "tour-layer";
tour.hidden = true;
tour.innerHTML = '<div class="tour-card" role="dialog" aria-modal="true" aria-label="Page tour">' +
  '<p data-tour-step></p><p data-tour-text></p>' +
  '<div class="tour-actions"><button type="button" data-tour-back>Back</button>' +
  '<button type="button" data-tour-next>Next</button><button type="button" data-tour-skip>Skip</button></div></div>';
document.body.appendChild(tour);

var stepAt = 0;
var spots = [];

function clearSpots() {
  spots.forEach(function (node) { node.classList.remove("is-spot"); });
  spots = [];
}
function visible(selector) {
  var nodes = document.querySelectorAll(selector);
  for (var i = 0; i < nodes.length; i++) {
    var style = getComputedStyle(nodes[i]);
    var rect = nodes[i].getBoundingClientRect();
    if (style.display === "none" || style.visibility === "hidden" || rect.width < 2 || rect.height < 2) continue;
    return nodes[i];
  }
  return nodes[0] || null;
}
function syncChrome() {
  var touring = !tour.hidden;
  var greeting = !greet.hidden;
  var open = !sheet.hidden;
  var showBot = STEPS[stepAt] && STEPS[stepAt].also === "[data-tour='bot']";
  launcher.hidden = greeting || open || (touring && !showBot);
  scrim.hidden = greeting || open ? false : true;
  scrim.classList.toggle("is-greet", greeting);
}
function showStep() {
  syncChrome();
  clearSpots();
  var step = STEPS[stepAt];
  var target = visible(step.sel);
  if (target) {
    target.classList.add("is-spot");
    spots.push(target);
    target.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  if (step.also) {
    var extra = visible(step.also);
    if (extra) {
      extra.classList.add("is-spot");
      spots.push(extra);
    }
  }
  tour.querySelector("[data-tour-step]").textContent = "Step " + (stepAt + 1) + " of " + STEPS.length + " · " + step.title;
  tour.querySelector("[data-tour-text]").textContent = step.text;
  var card = tour.querySelector(".tour-card");
  var rect = target ? target.getBoundingClientRect() : { bottom: 80, left: 16 };
  var top = rect.bottom + 12;
  if (top > window.innerHeight - 190) top = Math.max(12, rect.top - 176);
  if (top < 12) top = 12;
  card.style.top = top + "px";
  card.style.left = Math.max(12, Math.min(window.innerWidth - 400, rect.left)) + "px";
}
function endTour(done) {
  tour.hidden = true;
  clearSpots();
  if (done) localStorage.setItem("acl-tour-v1", "done");
  maybeGreet();
  scheduleIdle();
  syncChrome();
}
function startTour() {
  greet.hidden = true;
  sheet.hidden = true;
  tour.hidden = false;
  stepAt = 0;
  showStep();
}
tour.querySelector("[data-tour-next]").addEventListener("click", function () {
  if (stepAt >= STEPS.length - 1) endTour(true);
  else { stepAt += 1; showStep(); }
});
tour.querySelector("[data-tour-back]").addEventListener("click", function () {
  stepAt = Math.max(0, stepAt - 1);
  showStep();
});
tour.querySelector("[data-tour-skip]").addEventListener("click", function () { endTour(true); });

function maybeGreet() {
  if (localStorage.getItem("acl-greet-v1") === "done") {
    syncChrome();
    return;
  }
  greet.hidden = false;
  pose("wave");
  syncChrome();
}
function dockGreet() {
  greet.hidden = true;
  localStorage.setItem("acl-greet-v1", "done");
  pose("idle");
  applySavedPos();
  syncChrome();
}
greet.querySelector("[data-close-greet]").addEventListener("click", dockGreet);
function goFrom(btn) {
  dockGreet();
  closeSheet();
  location.href = abs(btn.getAttribute("data-go"));
}
greet.querySelectorAll("[data-go]").forEach(function (btn) {
  btn.addEventListener("click", function () { goFrom(btn); });
});
sheet.querySelectorAll("[data-go]").forEach(function (btn) {
  btn.addEventListener("click", function () { goFrom(btn); });
});

function openSheet() {
  greet.hidden = true;
  sheet.hidden = false;
  launcher.setAttribute("aria-expanded", "true");
  syncChrome();
  pose("wave");
  offerExport();
}
function closeSheet() {
  sheet.hidden = true;
  launcher.setAttribute("aria-expanded", "false");
  pose("idle");
  syncChrome();
}
scrim.addEventListener("click", function () {
  if (!greet.hidden) dockGreet();
  else closeSheet();
});
var handleDrag = null;
var handle = sheet.querySelector("[data-handle]");
handle.addEventListener("pointerdown", function (event) {
  handleDrag = { y: event.clientY, id: event.pointerId };
  handle.setPointerCapture(event.pointerId);
});
handle.addEventListener("pointerup", function (event) {
  if (!handleDrag || handleDrag.id !== event.pointerId) return;
  if (event.clientY - handleDrag.y > 48) closeSheet();
  handleDrag = null;
});
launcher.addEventListener("click", function () {
  if (drag && drag.moved) return;
  if (sheet.hidden) openSheet();
  else closeSheet();
});
sheet.querySelector("[data-close-bot]").addEventListener("click", closeSheet);

function applySavedPos() {
  try {
    var pos = JSON.parse(localStorage.getItem("acl-bot-pos") || "null");
    if (!pos) return;
    launcher.style.left = pos.left + "px";
    launcher.style.top = pos.top + "px";
    launcher.style.right = "auto";
    launcher.style.bottom = "auto";
  } catch (err) { /* default corner */ }
}
launcher.addEventListener("pointerdown", function (event) {
  if (event.button !== 0) return;
  var rect = launcher.getBoundingClientRect();
  drag = { dx: event.clientX - rect.left, dy: event.clientY - rect.top, moved: false, id: event.pointerId };
  launcher.setPointerCapture(event.pointerId);
});
launcher.addEventListener("pointermove", function (event) {
  if (!drag || drag.id !== event.pointerId) return;
  var x = event.clientX - drag.dx;
  var y = event.clientY - drag.dy;
  if (Math.abs(event.movementX) + Math.abs(event.movementY) > 3) drag.moved = true;
  x = Math.max(8, Math.min(window.innerWidth - 80, x));
  y = Math.max(8, Math.min(window.innerHeight - 80, y));
  launcher.style.left = x + "px";
  launcher.style.top = y + "px";
  launcher.style.right = "auto";
  launcher.style.bottom = "auto";
});
function endDrag(event) {
  if (!drag || drag.id !== event.pointerId) return;
  if (drag.moved) {
    var rect = launcher.getBoundingClientRect();
    localStorage.setItem("acl-bot-pos", JSON.stringify({ left: Math.round(rect.left), top: Math.round(rect.top) }));
  }
  drag = null;
}
launcher.addEventListener("pointerup", endDrag);
launcher.addEventListener("pointercancel", endDrag);

function say(text) {
  var log = sheet.querySelector("[data-log]");
  var line = document.createElement("p");
  line.textContent = text;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}

function exportLine() {
  var page = document.body.dataset.page || "";
  if (page === "diagrams") return "This page exports every diagram as SVG, PNG, and HTML.";
  if (page === "flows") return "Each flow on this page has SVG, PNG, and HTML.";
  if (page === "downloads") return "The zip on this page is the full bundle.";
  if (page === "room") return "This room's diagram and flow have SVG, PNG, and HTML buttons in the visual section.";
  if (page === "listen") return "The clips are on this page. Read-along uses the browser voice.";
  return "Look for the colored download buttons in each section. The full list is on Downloads.";
}
function offerExport() {
  var node = sheet.querySelector("[data-export-offer]");
  if (node) node.textContent = exportLine();
}

var voice = { name: "", rate: 0.92, pitch: 1 };
function pickVoice(list) {
  var best = null;
  var bestScore = -1;
  list.forEach(function (item) {
    var name = (item.name + " " + item.lang).toLowerCase();
    var score = 0;
    if (/en[-_]/.test(item.lang) || item.lang === "en") score += 8;
    if (/natural|neural|enhanced|premium/.test(name)) score += 40;
    if (/aria|jenny|guy|sonia|libby|serena|samantha/.test(name)) score += 24;
    if (/compact|espeak/.test(name)) score -= 10;
    if (score > bestScore) { bestScore = score; best = item; }
  });
  return best;
}
function fillVoices() {
  var synth = window.speechSynthesis;
  if (!synth) return;
  var list = synth.getVoices();
  var select = sheet.querySelector("[data-voice-name]");
  select.innerHTML = "";
  if (!list.length) {
    var empty = document.createElement("option");
    empty.value = "";
    empty.textContent = "System voice";
    select.appendChild(empty);
    return;
  }
  var chosen = pickVoice(list);
  list.forEach(function (item) {
    var option = document.createElement("option");
    option.value = item.name;
    option.textContent = item.name;
    if (chosen && item.name === chosen.name) option.selected = true;
    select.appendChild(option);
  });
  if (chosen) voice.name = chosen.name;
}
if (window.speechSynthesis) {
  fillVoices();
  window.speechSynthesis.addEventListener("voiceschanged", fillVoices);
}
sheet.querySelector("[data-voice-name]").addEventListener("change", function (event) {
  voice.name = event.target.value;
});
sheet.querySelector("[data-rate]").addEventListener("input", function (event) {
  voice.rate = Number(event.target.value);
});
sheet.querySelector("[data-pitch]").addEventListener("input", function (event) {
  voice.pitch = Number(event.target.value);
});

function speak(text, done) {
  if (!window.speechSynthesis) {
    window.setTimeout(function () { if (done) done(); }, reduced() ? 0 : 700);
    return;
  }
  window.speechSynthesis.cancel();
  var utter = new SpeechSynthesisUtterance(text);
  utter.rate = voice.rate;
  utter.pitch = voice.pitch;
  var match = window.speechSynthesis.getVoices().filter(function (item) { return item.name === voice.name; })[0];
  if (match) utter.voice = match;
  utter.onend = function () { if (done) done(); };
  utter.onerror = function () { if (done) done(); };
  window.speechSynthesis.speak(utter);
}
function stopSpeech() {
  speaking = false;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  document.querySelectorAll(".is-reading").forEach(function (node) { node.classList.remove("is-reading"); });
  var line = sheet.querySelector("[data-say]");
  if (line) line.hidden = true;
}
sheet.querySelector("[data-stop-speech]").addEventListener("click", stopSpeech);

function sentences(text) {
  return String(text || "").split(/(?<=[.!?])\s+/).map(function (part) { return part.trim(); }).filter(Boolean);
}
function showSentence(text) {
  var line = sheet.querySelector("[data-say]");
  var mark = sheet.querySelector("[data-say-mark]");
  line.hidden = false;
  mark.textContent = text;
}
function readNodes(nodes, index) {
  if (!speaking || index >= nodes.length) { speaking = false; pose("idle"); return; }
  var node = nodes[index];
  document.querySelectorAll(".is-reading").forEach(function (item) { item.classList.remove("is-reading"); });
  node.classList.add("is-reading");
  node.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
  var parts = sentences(node.innerText);
  var at = 0;
  function nextPart() {
    if (!speaking) return;
    if (at >= parts.length) { readNodes(nodes, index + 1); return; }
    showSentence(parts[at]);
    var current = parts[at];
    at += 1;
    speak(current, nextPart);
  }
  pose("point");
  nextPart();
}
function readPage() {
  var nodes = Array.prototype.slice.call(document.querySelectorAll("[data-read]"));
  if (!nodes.length) { say("This page has no read-along sections."); return; }
  speaking = true;
  openSheet();
  readNodes(nodes, 0);
}
sheet.querySelector("[data-read-page]").addEventListener("click", readPage);
sheet.querySelector("[data-follow]").addEventListener("click", function (event) {
  follow = !follow;
  event.currentTarget.setAttribute("aria-pressed", follow ? "true" : "false");
  event.currentTarget.textContent = follow ? "Read along on" : "Read along";
  say(follow ? "Read-along will follow the section in view and the menu." : "Read-along is off.");
});

var followTimer = 0;
if ("IntersectionObserver" in window) {
  var observer = new IntersectionObserver(function (entries) {
    if (!follow) return;
    var visible = entries.filter(function (entry) { return entry.isIntersecting; }).sort(function (a, b) {
      return b.intersectionRatio - a.intersectionRatio;
    })[0];
    if (!visible) return;
    window.clearTimeout(followTimer);
    followTimer = window.setTimeout(function () {
      document.querySelectorAll(".is-reading").forEach(function (node) { node.classList.remove("is-reading"); });
      visible.target.classList.add("is-reading");
      if (speaking) return;
      speaking = true;
      readNodes([visible.target], 0);
    }, 500);
  }, { threshold: [0.55] });
  document.querySelectorAll("[data-read]").forEach(function (node) { observer.observe(node); });
}

document.querySelectorAll(".drawer-row, .section-chip, .phone-dock a").forEach(function (link) {
  link.addEventListener("click", function () {
    if (!follow) return;
    try { sessionStorage.setItem("acl-follow", "1"); } catch (err) { /* ignore */ }
  });
});

function ask(text) {
  loadKb().then(function (kb) {
    var hit = matchIntent(text, kb);
    pose(hit.pose || "think");
    say(hit.say);
    if (hit.href) {
      window.setTimeout(function () { location.href = abs(hit.href); }, 400);
    }
  });
}
sheet.querySelector("[data-ask]").addEventListener("submit", function (event) {
  event.preventDefault();
  var input = sheet.querySelector("[data-ask-text]");
  ask(input.value);
});

var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
var micBtn = sheet.querySelector("[data-mic]");
if (!Rec) {
  micBtn.textContent = "Type instead";
  micBtn.addEventListener("click", function () { sheet.querySelector("[data-ask-text]").focus(); });
} else {
  micBtn.addEventListener("click", function () {
    if (recog) { recog.stop(); return; }
    recog = new Rec();
    recog.lang = "en-US";
    recog.onstart = function () { pose("listen"); micBtn.textContent = "Listening"; };
    recog.onresult = function (event) {
      var text = event.results[0][0].transcript;
      sheet.querySelector("[data-ask-text]").value = text;
      ask(text);
    };
    recog.onerror = function () { say("The mic did not return text. Type the request instead."); };
    recog.onend = function () { recog = null; micBtn.textContent = "Mic"; pose("idle"); };
    recog.start();
  });
}

sheet.querySelector("[data-ambient]").addEventListener("change", function (event) {
  if (ambientStop) { ambientStop(); ambientStop = null; }
  if (!event.target.checked) return;
  var Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) { say("This browser has no Web Audio for the ambient tone."); return; }
  var ctx = new Ctx();
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 174;
  gain.gain.value = 0.01;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  ambientStop = function () { osc.stop(); ctx.close(); };
});

function scheduleIdle() {
  if (localStorage.getItem("acl-idle-stop") === "1") return;
  if (idleOffers >= 3) return;
  var wait = 150000 + idleOffers * 60000;
  window.clearTimeout(idleTimer);
  idleTimer = window.setTimeout(function () {
    if (document.hidden) { scheduleIdle(); return; }
    if (!greet.hidden || !tour.hidden) { scheduleIdle(); return; }
    idleOffers += 1;
    idlePop.hidden = false;
    pose("wave");
  }, wait);
}
["pointerdown", "keydown"].forEach(function (type) {
  document.addEventListener(type, function () {
    if (localStorage.getItem("acl-idle-stop") === "1") return;
    if (!idlePop.hidden) return;
    scheduleIdle();
  }, { passive: true });
});
idlePop.querySelector("[data-idle-later]").addEventListener("click", function () {
  idlePop.hidden = true;
  pose("idle");
  scheduleIdle();
});
idlePop.querySelector("[data-idle-stop]").addEventListener("click", function () {
  localStorage.setItem("acl-idle-stop", "1");
  idlePop.hidden = true;
  pose("idle");
});
idlePop.querySelector("[data-idle-yes]").addEventListener("click", function () {
  idlePop.hidden = true;
  openSheet();
});

document.addEventListener("acl-quiz", function (event) {
  pose(event.detail && event.detail.ok ? "cheer" : "think");
});

var shot = new URLSearchParams(location.search).get("shot");
if (shot === "bot") {
  localStorage.setItem("acl-tour-v1", "done");
  localStorage.setItem("acl-greet-v1", "done");
  openSheet();
} else if (shot === "tour") {
  startTour();
} else if (shot === "greet") {
  localStorage.removeItem("acl-tour-v1");
  localStorage.removeItem("acl-greet-v1");
  greet.hidden = false;
  syncChrome();
  pose("wave");
} else if (shot === "menu" || shot === "home" || shot === "room" || shot === "downloads" || shot === "footer" || shot === "tiles" || shot === "neon" || shot === "read") {
  localStorage.setItem("acl-tour-v1", "done");
  localStorage.setItem("acl-greet-v1", "done");
  applySavedPos();
  syncChrome();
} else if (localStorage.getItem("acl-tour-v1") !== "done") {
  startTour();
} else {
  applySavedPos();
  maybeGreet();
  scheduleIdle();
}

window.ConnectGuide = {
  replay: startTour,
  readPage: readPage,
  ask: ask
};
