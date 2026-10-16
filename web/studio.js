/** Cheat codes, syllabus, ports game, flow explorer, daily challenge, and share cards. */

const REPO = "https://github.com/CypherMonkeyLabs/amazon-connect-lab-free-university-mesmerizing";
const HOME = "https://cyphermonkeylabs.com";

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

function hashText(text) {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 33 + text.charCodeAt(i)) >>> 0;
  return h;
}

async function mastery(ctx) {
  ctx.hub.mastery = ctx.hub.mastery || await ctx.load("data/mastery.json");
  return ctx.hub.mastery;
}

function sheetLinks(slug) {
  return `<p class="actions"><a class="ghost" href="downloads/${slug}.html">HTML</a><a class="ghost" href="downloads/${slug}.pdf">PDF</a><a class="ghost" href="downloads/${slug}.png">PNG</a></p>`;
}

export async function viewCheats(ctx) {
  const data = await mastery(ctx);
  ctx.setTitle("Downloads", "Cheat codes");
  ctx.award("cheat");
  const cards = data.sheets.map((sheet) => `<article class="card"><p class="meta">Sheet</p><h2>${ctx.esc(sheet.title)}</h2><p>${ctx.esc(sheet.intro)}</p>${sheetLinks(sheet.slug)}</article>`).join("");
  return `<p class="lede">One page per topic. HTML to read here, PDF to file, PNG to pin. The zip is the whole campus, including these sheets. Print any HTML sheet to paper from the browser.</p>
    <div class="why"><strong>Why it matters.</strong> A firewall change and a cutover both go better when the table is in the ticket, not in someone's memory.</div>
    <p class="actions"><a class="solid" href="downloads/amazon-connect-lab.zip" download="amazon-connect-lab.zip">Download the offline bundle</a><a class="ghost" href="downloads/index.html">Open the sheet index</a><a class="ghost" href="downloads/flashcards.json" download>Flashcards JSON</a></p>
    <div class="grid-cards">${cards}</div>
    <p class="cite">Each sheet names its source. Study text is original. Vendor pages are linked, not copied.</p>`;
}

export async function viewSyllabus(ctx) {
  const data = await mastery(ctx);
  ctx.setTitle("Map", "Syllabus");
  const done = ctx.state.syllabus || {};
  const cards = data.syllabus.map((row) => {
    const on = done[row.id] ? " checked" : "";
    return `<article class="card"><p class="meta">${ctx.esc(row.level)}</p><h2>${ctx.esc(row.title)}</h2><p>${ctx.esc(row.blurb)}</p>
      <p class="actions"><button class="ghost" data-go="${ctx.esc(row.href)}">Open</button></p>
      <label class="checkline"><input type="checkbox" data-syllabus="${ctx.esc(row.id)}"${on}> Marked read on this browser</label></article>`;
  }).join("");
  const count = Object.keys(done).length;
  return `<p class="lede">${count} of ${data.syllabus.length} sections marked read. The lessons were already on the campus. This page is the map.</p><div class="grid-cards">${cards}</div>`;
}

export async function viewCareer(ctx) {
  const data = await mastery(ctx);
  ctx.setTitle("Career", "Paths and interview prompts");
  const roles = data.careers.map((row) => `<article class="card"><h2>${ctx.esc(row.role)}</h2><p>${ctx.esc(row.proof)}</p><p>${ctx.esc(row.credential)}</p><p class="actions"><button class="ghost" data-go="${ctx.esc(row.href)}">Open the track</button></p><p class="cite">Source: <a href="${ctx.esc(row.url)}">${ctx.esc(row.source)}</a></p></article>`).join("");
  const prompts = data.interview.map((row) => `<article class="card"><h2>${ctx.esc(row.q)}</h2><p>${ctx.esc(row.a)}</p></article>`).join("");
  return `<p class="lede">Five roles. The credential line says badge or exam, never both for the same piece of paper.</p><div class="grid-cards">${roles}</div><div class="section-head"><h2>Interview prompts</h2><button class="ghost" data-go="#/tips">Per-track traps</button></div><div class="grid-cards">${prompts}</div>`;
}

export async function viewExplorer(ctx) {
  const data = await mastery(ctx);
  ctx.setTitle("Signal path", "Flow map explorer");
  ctx.award("explorer");
  const nodes = data.explorer.map((node) => `<g class="hop-node"><rect x="${node.x - 58}" y="${node.y - 22}" width="116" height="44" rx="12" fill="#131d31" stroke="#3dcfb4"/><text x="${node.x}" y="${node.y + 5}" text-anchor="middle" fill="#f3efe4" font-size="13">${ctx.esc(node.title)}</text></g>`).join("");
  const hops = data.explorer.map((node) => `<details class="hop glass"><summary>${ctx.esc(node.title)}</summary><p>${ctx.esc(node.body)}</p><p class="cite">Source: <a href="${ctx.esc(node.url)}">${ctx.esc(node.source)}</a></p></details>`).join("");
  return `<p class="lede">Click a hop. The packet on the line is the contact. The 3D map is the other view of the same system. The home hero is a separate full-bleed scene.</p>
    <figure class="glass figure explorer-map"><svg viewBox="0 0 700 180" role="img" aria-label="Call path from the PSTN through Connect to the CCP">
      <line x1="60" y1="80" x2="620" y2="80" stroke="#e5843b" stroke-width="3"/>
      <line x1="340" y1="80" x2="480" y2="40" stroke="#8eb8ff" stroke-width="2"/>
      <line x1="340" y1="80" x2="480" y2="130" stroke="#3dcfb4" stroke-width="2"/>
      <circle r="7" fill="#ffb020"><animateMotion dur="6s" repeatCount="indefinite" path="M60,80 L200,80 L340,80 L480,130 L620,80"/></circle>
      ${nodes}
    </svg><figcaption>PSTN to CCP. Lex and the queue branch off the flow.</figcaption></figure>
    <div class="hop-list">${hops}</div>
    <p class="actions"><button class="solid" data-go="#/map">Open the 3D map</button><button class="ghost" data-go="#/sandbox">Build a call flow</button><button class="ghost" data-go="#/ports">Ports game</button></p>`;
}

export async function viewPorts(ctx) {
  const data = await mastery(ctx);
  ctx.setTitle("Mastery", "Ports and protocols game");
  const quiz = data.portsQuiz;
  const progress = ctx.state.ports || { index: 0, score: 0, done: false, best: 0 };
  if (progress.done) {
    const best = Math.max(progress.best || 0, progress.score);
    return `<p class="lede">You scored ${progress.score} of ${quiz.length}. Best on this browser: ${best}.</p>
      <div class="why"><strong>Pass mark.</strong> 8 of 10 earns the Ports badge. The questions use the same figures as the network lesson.</div>
      <p class="actions"><button class="solid" id="ports-reset" type="button">Play again</button><button class="ghost" id="share-card" type="button" data-share-title="Ports game" data-share-line="${progress.score} of ${quiz.length}">Share card</button><button class="ghost" data-go="#/cheats">Firewall sheet</button></p>
      <div class="table-scroll glass">${firewallTable(ctx, data.firewall)}</div>`;
  }
  const item = quiz[progress.index];
  const choices = item.choices.map((choice, index) => `<button class="choice" type="button" data-port="${index}">${ctx.esc(choice)}</button>`).join("");
  return `<p class="meta">Question ${progress.index + 1} of ${quiz.length} · score ${progress.score}</p>
    <h2>${ctx.esc(item.q)}</h2>
    <div id="port-choices">${choices}</div>
    <p id="port-why" class="why" hidden></p>`;
}

function firewallTable(ctx, rows) {
  const body = rows.map((row) => `<tr${row.unverified ? ' class="flag"' : ""}><th scope="row">${ctx.esc(row.hop)}</th><td>${ctx.esc(row.proto)}</td><td>${ctx.esc(row.port)}</td><td>${ctx.esc(row.direction)}</td><td>${ctx.esc(row.note)}</td></tr>`).join("");
  return `<table class="sheet"><thead><tr><th>Hop</th><th>Protocol</th><th>Port</th><th>Direction</th><th>Note</th></tr></thead><tbody>${body}</tbody></table>`;
}

export async function answerPort(ctx, index) {
  const data = await mastery(ctx);
  const progress = ctx.state.ports || { index: 0, score: 0, done: false, best: 0 };
  if (progress.done) return;
  const item = data.portsQuiz[progress.index];
  const why = document.getElementById("port-why");
  const buttons = document.querySelectorAll("[data-port]");
  buttons.forEach((button) => {
    const choice = Number(button.getAttribute("data-port"));
    button.disabled = true;
    if (choice === item.answer) button.classList.add("good");
    if (choice === index && choice !== item.answer) button.classList.add("bad");
  });
  if (why) {
    why.hidden = false;
    why.innerHTML = `<strong>${index === item.answer ? "Correct." : "Not this one."}</strong> ${ctx.esc(item.why)} <a href="${ctx.esc(item.url)}">${ctx.esc(item.source)}</a>`;
  }
  if (index === item.answer) progress.score += 1;
  progress.index += 1;
  if (progress.index >= data.portsQuiz.length) {
    progress.done = true;
    progress.best = Math.max(progress.best || 0, progress.score);
    if (progress.score >= 8) ctx.award("ports");
  }
  ctx.state.ports = progress;
  ctx.save();
  if (progress.done) {
    document.getElementById("view").innerHTML = await viewPorts(ctx);
  } else {
    const next = document.createElement("p");
    next.className = "actions";
    next.innerHTML = `<button class="solid" type="button" id="ports-next">Next question</button>`;
    why.insertAdjacentElement("afterend", next);
  }
}

export async function viewDaily(ctx) {
  ctx.setTitle("Today", "Daily challenge");
  const pack = ctx.hub.quiz || await ctx.load("data/quiz.json");
  ctx.hub.quiz = pack;
  const questions = pack.questions || [];
  const key = dayKey();
  const item = questions[hashText(key) % questions.length];
  const daily = ctx.state.daily || { day: "", correct: false };
  if (daily.day === key && daily.answered) {
    ctx.award("daily");
    return `<p class="lede">Today's challenge is already answered${daily.correct ? ", and it was right" : ""}.</p>
      <article class="card"><h2>${ctx.esc(item.q)}</h2><p>${ctx.esc(item.why)}</p><p class="cite">Source: <a href="${ctx.esc(item.url)}">${ctx.esc(item.source)}</a></p></article>
      <p class="actions"><button class="ghost" id="share-card" type="button" data-share-title="Daily challenge" data-share-line="${key} · ${daily.correct ? "correct" : "reviewed"}">Share card</button><button class="ghost" data-go="#/quiz">More quiz</button></p>`;
  }
  const choices = item.choices.map((choice, index) => `<button class="choice" type="button" data-daily="${index}">${ctx.esc(choice)}</button>`).join("");
  return `<p class="lede">One question for ${ctx.esc(key)}. It stays the same until tomorrow. The deck is the campus quiz, so the wrong answers are other real terms.</p>
    <h2>${ctx.esc(item.q)}</h2><div id="daily-choices">${choices}</div><p id="daily-why" class="why" hidden></p>`;
}

export async function answerDaily(ctx, index) {
  const pack = ctx.hub.quiz;
  const questions = pack.questions || [];
  const key = dayKey();
  const item = questions[hashText(key) % questions.length];
  const why = document.getElementById("daily-why");
  document.querySelectorAll("[data-daily]").forEach((button) => {
    const choice = Number(button.getAttribute("data-daily"));
    button.disabled = true;
    if (choice === item.answer) button.classList.add("good");
    if (choice === index && choice !== item.answer) button.classList.add("bad");
  });
  const correct = index === item.answer;
  if (why) {
    why.hidden = false;
    why.innerHTML = `<strong>${correct ? "Correct." : "Reviewed."}</strong> ${ctx.esc(item.why)}`;
  }
  ctx.state.daily = { day: key, answered: true, correct };
  ctx.save();
  ctx.award("daily");
}

export function shareCard(title, line) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#07141c";
  ctx.fillRect(0, 0, 1200, 630);
  ctx.fillStyle = "#e5843b";
  ctx.fillRect(0, 0, 1200, 14);
  ctx.fillStyle = "#f0c56a";
  ctx.font = "28px sans-serif";
  ctx.fillText("AMAZON CONNECT LAB", 64, 90);
  ctx.fillStyle = "#f3efe4";
  ctx.font = "64px serif";
  ctx.fillText(title.slice(0, 28), 64, 200);
  ctx.font = "36px sans-serif";
  ctx.fillStyle = "#3dcfb4";
  ctx.fillText(line.slice(0, 48), 64, 280);
  ctx.fillStyle = "#c9d6df";
  ctx.font = "24px sans-serif";
  ctx.fillText("Free offline study · cyphermonkeylabs.com", 64, 420);
  ctx.fillText("Not affiliated with Amazon Web Services", 64, 460);
  ctx.fillStyle = "#e5843b";
  ctx.fillText(HOME, 64, 540);
  ctx.fillText(REPO.replace("https://", ""), 64, 580);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "amazon-connect-lab-card.png";
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 4000);
  });
}

export function tickMascot(reduced) {
  const nodes = document.querySelectorAll(".mascot");
  if (!nodes.length) return;
  const hour = new Date().getHours();
  let shift = "day";
  if (hour < 5) shift = "night";
  else if (hour < 11) shift = "morning";
  else if (hour >= 17) shift = "evening";
  const poses = ["idle", "wave", "think", "celebrate"];
  const section = (location.hash || "#/").split("/")[1] || "home";
  const sectionLook = { home: 0, diagrams: 1, flows: 2, charts: 3, cheats: 4, play: 2, track: 3, downloads: 1, career: 4 }[section] || 0;
  const look = (sectionLook + Math.floor(Date.now() / 180000)) % 5;
  const pose = reduced ? "idle" : poses[Math.floor(Date.now() / 7000) % poses.length];
  nodes.forEach((el) => {
    el.dataset.shift = shift;
    el.dataset.look = String(look);
    el.dataset.section = section || "home";
    el.dataset.pose = pose;
  });
}

export const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
