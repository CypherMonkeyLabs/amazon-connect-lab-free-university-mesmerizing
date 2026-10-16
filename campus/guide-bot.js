import { motionReducedNow } from "./palette.js";

const THRESHOLD = 0.45;
let kb = null;
let open = false;
let typing = 0;
let tour = null;
let tourStep = 0;
let quizAt = -1;

function $(id) {
  return document.getElementById(id);
}

function norm(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokens(text) {
  return norm(text).split(" ").filter((word) => word.length > 1);
}

function scoreEntry(query, entry) {
  const q = norm(query);
  if (!q) return 0;
  const hay = norm([entry.title, ...(entry.terms || []), entry.answer].join(" "));
  if (q.length > 3 && hay.includes(q)) return 1;
  const qt = tokens(q);
  const ht = tokens(hay);
  if (!qt.length || !ht.length) return 0;
  let hit = 0;
  qt.forEach((word) => {
    if (ht.includes(word)) hit += 1;
    else if (ht.some((item) => item.startsWith(word) && word.length > 3)) hit += 0.65;
  });
  return hit / qt.length;
}

function bestEntry(query) {
  let best = null;
  let bestScore = 0;
  (kb.entries || []).forEach((entry) => {
    const value = scoreEntry(query, entry);
    if (value > bestScore) {
      best = entry;
      bestScore = value;
    }
  });
  if (!best || bestScore < THRESHOLD) return null;
  return best;
}

function endpoint() {
  const value = window.ACL_GUIDE_ENDPOINT;
  return typeof value === "string" && value.startsWith("https://") ? value : "";
}

async function askCloud(question) {
  const url = endpoint();
  if (!url) return null;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || typeof data.answer !== "string" || !data.answer.trim()) return null;
    if (typeof data.source !== "string" || !data.source.trim()) return null;
    if (typeof data.url !== "string" || !data.url.trim()) return null;
    return {
      title: "Cloud guide",
      answer: data.answer.trim(),
      source: data.source.trim(),
      url: data.url.trim(),
      href: typeof data.href === "string" ? data.href : "",
    };
  } catch (err) {
    return null;
  }
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function typeText(node, text) {
  const token = typing + 1;
  typing = token;
  if (motionReducedNow()) {
    node.textContent = text;
    return token === typing;
  }
  node.textContent = "";
  const step = text.length > 180 ? 3 : 1;
  for (let i = 0; i < text.length; i += step) {
    if (token !== typing) return false;
    node.textContent = text.slice(0, i + step);
    await wait(12);
  }
  return token === typing;
}

function bubble(role, html) {
  const log = $("guide-log");
  const row = document.createElement("div");
  row.className = "guide-row " + role;
  const item = document.createElement("div");
  item.className = "guide-bubble";
  item.innerHTML = html;
  row.appendChild(item);
  log.appendChild(row);
  log.scrollTop = log.scrollHeight;
  return item;
}

function esc(text) {
  return String(text).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function citeLine(entry) {
  const href = esc(entry.url);
  const source = esc(entry.source);
  const more = entry.href ? ` <a href="${esc(entry.href)}">Open in the lab</a>` : "";
  return `<p class="guide-cite">Source: <a href="${href}">${source}</a>${more}</p>`;
}

function setChips(chips) {
  const host = $("guide-chips");
  host.replaceChildren();
  chips.forEach((chip) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "guide-chip";
    button.textContent = chip.label;
    button.addEventListener("click", () => onChip(chip));
    host.appendChild(button);
  });
}

function welcomeChips() {
  return kb.chips || [];
}

async function sayBot(text, extraHtml) {
  const node = bubble("bot", '<span class="guide-typing" aria-hidden="true"></span>');
  const span = document.createElement("span");
  node.replaceChildren(span);
  const finished = await typeText(span, text);
  if (!finished) return;
  if (extraHtml) node.insertAdjacentHTML("beforeend", extraHtml);
  const log = $("guide-log");
  log.scrollTop = log.scrollHeight;
}

function markTour(menu) {
  document.querySelectorAll(".guide-target").forEach((el) => el.classList.remove("guide-target"));
  if (!menu) return;
  document.querySelectorAll(`[data-menu="${menu}"]`).forEach((el) => el.classList.add("guide-target"));
}

async function startTour(id) {
  tour = (kb.tours || []).find((item) => item.id === id) || null;
  tourStep = 0;
  quizAt = -1;
  if (!tour) {
    await sayBot(kb.fallback);
    setChips(welcomeChips());
    return;
  }
  await showTourStep();
}

async function showTourStep() {
  const step = tour.steps[tourStep];
  if (!step) {
    tour = null;
    markTour("");
    await sayBot("That is the end of the tour. The pages you opened are the ones this lab already has.");
    setChips(welcomeChips());
    return;
  }
  if (location.hash !== step.href) location.hash = step.href;
  markTour(step.menu);
  await sayBot(step.say);
  const last = tourStep >= tour.steps.length - 1;
  setChips([
    { label: last ? "Finish tour" : "Next stop", action: "tour-next" },
    { label: "Stop tour", action: "reset" },
  ]);
}

async function startQuiz() {
  tour = null;
  markTour("");
  if (!kb.quiz || !kb.quiz.length) {
    await sayBot(kb.fallback);
    setChips(welcomeChips());
    return;
  }
  quizAt = 0;
  await showQuiz();
}

async function showQuiz() {
  const item = kb.quiz[quizAt];
  await sayBot(item.q);
  setChips(item.choices.map((label, index) => ({ label, action: "quiz-choice", index })));
}

async function gradeQuiz(index) {
  const item = kb.quiz[quizAt];
  const right = index === item.answer;
  const lead = right ? "Correct. " : "Not this one. ";
  await sayBot(lead + item.why, citeLine(item));
  quizAt += 1;
  if (quizAt >= kb.quiz.length) {
    quizAt = -1;
    await sayBot("That is the end of this short quiz. Every answer was one of the four items stored with the guide.");
    setChips(welcomeChips());
    return;
  }
  setChips([{ label: "Next question", action: "quiz-next" }, { label: "Stop quiz", action: "reset" }]);
}

async function answer(question) {
  bubble("user", esc(question));
  const cloud = await askCloud(question);
  const entry = cloud || bestEntry(question);
  if (!entry) {
    await sayBot(kb.fallback);
    setChips(welcomeChips());
    return;
  }
  await sayBot(entry.answer, citeLine(entry));
  setChips(welcomeChips());
}

async function onChip(chip) {
  if (chip.action === "ask") {
    await answer(chip.q);
    return;
  }
  if (chip.action === "tour") {
    await startTour(chip.id);
    return;
  }
  if (chip.action === "quiz") {
    await startQuiz();
    return;
  }
  if (chip.action === "tour-next") {
    tourStep += 1;
    await showTourStep();
    return;
  }
  if (chip.action === "quiz-choice") {
    await gradeQuiz(chip.index);
    return;
  }
  if (chip.action === "quiz-next") {
    await showQuiz();
    return;
  }
  if (chip.action === "reset") {
    tour = null;
    quizAt = -1;
    markTour("");
    await sayBot("Stopped. Ask another question from this lab, or start again.");
    setChips(welcomeChips());
    return;
  }
  await sayBot(kb.fallback);
  setChips(welcomeChips());
}

function setOpen(next) {
  open = next;
  const panel = $("guide-panel");
  const button = $("guide-open");
  panel.hidden = !open;
  button.setAttribute("aria-expanded", open ? "true" : "false");
  if (open) {
    const field = $("guide-q");
    if (field) field.focus();
  }
}

export async function mountGuide() {
  const button = $("guide-open");
  const panel = $("guide-panel");
  if (!button || !panel || button.dataset.ready) return;
  button.dataset.ready = "1";
  button.addEventListener("click", () => setOpen(!open));
  $("guide-close").addEventListener("click", () => setOpen(false));
  $("guide-form").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const field = $("guide-q");
    const question = field.value.trim();
    if (!question) return;
    field.value = "";
    tour = null;
    quizAt = -1;
    answer(question);
  });
  try {
    const res = await fetch("guide-kb.json");
    if (!res.ok) throw new Error("missing");
    kb = await res.json();
  } catch (err) {
    kb = {
      welcome: "The guide notes did not load. I will not guess.",
      fallback: "The guide notes did not load. I will not guess.",
      chips: [],
      entries: [],
      quiz: [],
      tours: [],
    };
  }
  await sayBot(kb.welcome);
  setChips(welcomeChips());
}
