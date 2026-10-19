/* Build the offline Connect chat index from this lab's own pages.
   Usage: node pipeline/build_connectbot_index.mjs
   Writes js/content/connectbot-index.json. Do not edit that file by hand. */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tokens } from "../shared/pybot-chat/engine.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "js/content/connectbot-index.json");

const SYN = {
  softphone: "ccp",
  softphones: "ccp",
  ccp: "ccp",
  routing: "route",
  routes: "route",
  routed: "route",
  queu: "queue",
  profiles: "profile",
  ivr: "flow",
  ivrs: "flow",
  flows: "flow",
  ctrs: "ctr",
  "contacttrace": "ctr",
  trace: "ctr",
  lens: "lens",
  contactlens: "lens",
  conversational: "analytics",
  analytics: "lens",
  lambda: "lambda",
  lamda: "lambda",
  lex: "lex",
  slots: "slot",
  intents: "intent",
  dtmf: "dtmf",
  saml: "saml",
  iam: "iam",
  kms: "kms",
  kinesis: "kinesis",
  sip: "sip",
  pstn: "pstn",
  did: "did",
  e911: "e911",
  whatsapp: "whatsapp",
  sms: "sms",
  salesforce: "salesforce",
  servicenow: "servicenow",
  genesys: "genesys",
  avaya: "avaya",
  cucm: "cucm",
  uccx: "uccx",
  ucce: "ucce",
  webex: "webex",
  twilio: "twilio",
  cpaas: "cpaas",
  webrtc: "webrtc",
  whisper: "whisper",
  callback: "callback",
  callbacks: "callback",
  quickconnect: "quickconnect",
  proficiency: "proficiency",
  proficiencies: "proficiency",
  erlang: "erlang",
  wfm: "wfm",
  quota: "quota",
  quotas: "quota",
  resiliency: "resiliency",
  regions: "region",
  redaction: "redaction",
  transcript: "transcript",
  transcripts: "transcript",
  attributes: "attribute",
  modules: "module",
  blocks: "block",
  prompts: "prompt",
  campaigns: "campaign",
  agents: "agent",
  workspaces: "workspace",
  voiceid: "voiceid",
  wisdom: "wisdom",
  q: "assist",
};

function plain(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function section(html, id) {
  const re = new RegExp(`<section[^>]*id="${id}"[\\s\\S]*?</section>`, "i");
  const match = html.match(re);
  return match ? match[0] : "";
}

function clip(text, max = 320) {
  const clean = plain(text);
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "));
  if (stop > 80) return cut.slice(0, stop + 1);
  return cut.trim();
}

const docs = [];

function add(doc) {
  const bodyText = [doc.ti, doc.body, doc.alias || ""].filter(Boolean).join("\n");
  docs.push({
    i: doc.i,
    k: doc.k,
    ti: doc.ti,
    h: doc.h,
    s: doc.s || "",
    ex: clip(doc.ex || doc.body || doc.ti),
    eg: String(doc.eg || "").replace(/\s+$/g, "").slice(0, 180),
    fu: doc.fu || "",
    fq: doc.fq || "",
    act: doc.act || "",
    w: tokens(bodyText, SYN, 3),
    tw: tokens(`${doc.ti} ${doc.alias || ""}`, SYN, 2),
  });
}

function sourceNote(sources) {
  const checked = (sources || []).map((item) => item.last_checked).filter(Boolean);
  const date = checked[0] || "unconfirmed";
  const unconfirmed = (sources || []).some((item) => item.status && item.status !== "verified");
  const tail = unconfirmed
    ? ` Source last checked ${date}. A source on that page is unconfirmed.`
    : ` Source last checked ${date}. Prices, limits, versions, and availability in this excerpt are only as current as that check.`;
  return tail;
}

const roomsDir = join(root, "rooms");
const roomFiles = readdirSync(roomsDir).filter((name) => name.endsWith(".html")).sort();
for (const name of roomFiles) {
  const id = name.replace(/\.html$/, "");
  const html = readFileSync(join(roomsDir, name), "utf8");
  const title = plain((html.match(/<h1>([\s\S]*?)<\/h1>/) || [, id])[1]);
  const kicker = plain((html.match(/<p class="kicker">([\s\S]*?)<\/p>/) || [, ""])[1]);
  const learn = section(html, "learn").replace(/<div class="section-bar">[\s\S]*?<\/div>/i, "");
  const example = section(html, "example").replace(/<div class="section-bar">[\s\S]*?<\/div>/i, "");
  const learnText = plain(learn).replace(/^About five minutes of reading\s*/i, "");
  const exampleText = plain(example).replace(/^Worked example\s*/, "");
  const topic = id.replace(/^[a-z]{2,4}-/, "").replace(/-/g, " ");
  const indexedBody = `${learnText}\nAmazon Connect contact center\n${topic}`;
  let sources = [];
  const sourcePath = join(roomsDir, id, "sources.json");
  if (existsSync(sourcePath)) {
    try { sources = JSON.parse(readFileSync(sourcePath, "utf8")).sources || []; } catch { sources = []; }
  }
  const note = sourceNote(sources);
  add({
    i: `room:${id}`,
    k: "lesson",
    ti: title,
    h: `rooms/${name}`,
    s: kicker,
    ex: `${clip(learnText, 260)}${note}`,
    eg: clip(exampleText, 160),
    body: indexedBody,
    alias: `${kicker} ${topic}`,
    fu: "Where do I start?",
    fq: "Where do I start?",
  });
}

const pages = [
  ["page:start", "Start", "start.html", "Start here", "The start page is the ten-minute path and the full course. Nothing on it calls Amazon Connect."],
  ["page:downloads", "Downloads", "downloads.html", "Downloads", "Downloads keeps the sheets, the cards, the templates, and the zip. They are files from this lab."],
  ["page:play", "Play", "play.html", "Play", "Play holds short drills for routing, Lambda, ports, and bridges. They are simulations. They do not call Amazon Connect."],
  ["page:listen", "Listen", "listen.html", "Listen", "Listen holds short study audio clips and read-along. The clips are synthesized."],
  ["page:flows", "Flows", "flows.html", "Flows", "Flows are animated pictures of call and data paths in this lab. They are not a live call."],
  ["page:chapters", "Chapters", "chapters/index.html", "Chapters", "Chapters group the rooms into study paths, from fundamentals toward the bridge and the ecosystem."],
  ["page:sim", "Routing desk", "sim.html", "Routing desk", "The routing desk is a simulation. You set hours, a queue, a routing profile, and a Lambda wait, and the page shows the branch. It does not call Amazon Connect."],
  ["page:help", "Help", "help.html", "Help", "Help explains the menu, the tour, the guide monkey, and the downloads."],
];
for (const [id, title, href, sectionName, text] of pages) {
  add({
    i: id,
    k: id === "page:downloads" ? "download" : "guide",
    ti: title,
    h: href,
    s: sectionName,
    ex: text,
    body: text,
    alias: sectionName,
  });
}

const seeds = [];
for (const doc of docs) {
  if (doc.k !== "lesson") continue;
  const id = doc.i.replace(/^room:/, "").replace(/-/g, " ");
  const terms = [...new Set(tokens(id, SYN, 1))].filter((term) => term.length >= 4 || ["ccp", "ctr", "lex", "sip", "iam", "kms", "sms", "did"].includes(term));
  if (!terms.length || terms.length > 3) continue;
  seeds.push({
    i: doc.i,
    h: doc.h,
    ti: doc.ti,
    k: doc.k,
    ex: doc.ex,
    eg: doc.eg,
    topic: terms[0],
    all: terms,
    any: terms,
    allow: [...new Set([...terms, "amazon", "connect", "center", "contact"])],
    block: ["chime", "pinpoint", "wickr", "five9", "cxone", "talkdesk", "honeycode", "appsync", "monitron", "sagemaker", "kubernetes", "pytorch", "sourdough"],
    how: false,
    rank: 4,
  });
}

const index = { v: 2, syn: SYN, seeds, docs };
writeFileSync(outPath, `${JSON.stringify(index)}\n`);
console.log(`rooms ${roomFiles.length} docs ${docs.length} seeds ${seeds.length} -> ${outPath}`);
