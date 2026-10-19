/* Rewrite the SHELL list in sw.js from the files this lab must open offline.
   Budget: 3.5 MB. Chat engine, UI, CSS, and the index are required.
   Usage: node scripts/build_precache.mjs */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const budget = 3_500_000;
const seen = new Set();

function walk(file) {
  const abs = path.resolve(file);
  if (seen.has(abs) || !fs.existsSync(abs)) return;
  if (!/\.(js|mjs)$/.test(abs)) return;
  seen.add(abs);
  const text = fs.readFileSync(abs, "utf8");
  const re = /from\s+["'](\.[^"']+)["']/g;
  let match;
  while ((match = re.exec(text))) {
    let rel = match[1];
    if (!/\.(js|mjs)$/.test(rel)) rel += ".js";
    walk(path.resolve(path.dirname(abs), rel));
  }
}

walk(path.join(root, "guide/guide.js"));
walk(path.join(root, "assets/js/university.js"));
walk(path.join(root, "assets/js/frame.js"));
walk(path.join(root, "assets/js/play.js"));

const required = [
  "index.html",
  "offline.html",
  "start.html",
  "play.html",
  "sim.html",
  "help.html",
  "rooms/route-queue.html",
  "site.webmanifest",
  "manifest.webmanifest",
  "favicon.svg",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/icon-maskable-512.png",
  "js/content/connectbot-index.json",
  "shared/pybot-chat/engine.js",
  "shared/pybot-chat/ui.js",
  "shared/pybot-chat/chat.css",
  "guide/guide.js",
  "guide/guide.css",
  "guide/dragbot.js",
  "guide/engine.mjs",
];
for (const name of fs.readdirSync(path.join(root, "assets/css"))) {
  if (name.endsWith(".css")) required.push(`assets/css/${name}`);
}
for (const name of ["frame.js", "university.js", "play.js", "study.js"]) {
  required.push(`assets/js/${name}`);
}

const imports = [...seen].map((abs) => path.relative(root, abs).split(path.sep).join("/"));
const chosen = [];
let total = 0;
const skipped = [];
function consider(rel, must) {
  const abs = path.join(root, rel);
  if (chosen.includes(rel)) return;
  if (!fs.existsSync(abs)) {
    if (must) skipped.push(`missing ${rel}`);
    return;
  }
  const size = fs.statSync(abs).size;
  if (total + size > budget) {
    skipped.push(`over budget ${rel} (${size})`);
    return;
  }
  chosen.push(rel);
  total += size;
}
for (const rel of required) consider(rel, true);
for (const rel of imports.sort()) consider(rel, false);

if (skipped.some((line) => line.startsWith("missing") || line.startsWith("over budget"))) {
  console.log(skipped.join("\n"));
  if (skipped.some((line) => required.some((rel) => line.includes(rel)))) {
    console.log("build_precache: required file missing or over budget");
    process.exit(1);
  }
}

const body = chosen.map((rel) => `  "./${rel}",`).join("\n");
const swPath = path.join(root, "sw.js");
let sw = fs.readFileSync(swPath, "utf8");
if (!/var SHELL = \[[\s\S]*?\];/.test(sw)) {
  console.log("build_precache: SHELL list not found");
  process.exit(1);
}
sw = sw.replace(/var SHELL = \[[\s\S]*?\];/, `var SHELL = [\n${body}\n];`);
fs.writeFileSync(swPath, sw);
console.log(`precache ${chosen.length} files, ${total} bytes, budget ${budget}`);
if (skipped.length) console.log(skipped.join("\n"));
