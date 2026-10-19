/* Write data/lesson-map.json and data/sources.json from rooms/*.html and sources.json.
   Usage: node scripts/build_lesson_map.mjs
   The validator does not write. Run this only when the catalog changes. */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const LEVEL = {
  foundations: 0,
  instance: 1,
  telephony: 1,
  "contact flows": 2,
  routing: 2,
  "lex v2": 3,
  lambda: 3,
  "agent assist and agentic ai": 4,
  "ccp and workspace": 4,
  "profiles, cases, tasks": 5,
  "channels and campaigns": 5,
  analytics: 6,
  "security, quotas, price": 6,
  "global resiliency": 7,
  troubleshooting: 7,
  bridge: 8,
  integrations: 9,
  ecosystem: 10,
};

function plain(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function slug(url) {
  const path = String(url).replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  return path.slice(0, 96);
}

const roomsDir = join(root, "rooms");
const catalog = new Map();
const lessons = [];
const files = readdirSync(roomsDir).filter((name) => name.endsWith(".html")).sort();
for (const name of files) {
  const id = name.replace(/\.html$/, "");
  const html = readFileSync(join(roomsDir, name), "utf8");
  const title = plain((html.match(/<h1>([\s\S]*?)<\/h1>/) || [, ""])[1]);
  const track = plain((html.match(/<p class="kicker">([\s\S]*?)<\/p>/) || [, "foundations"])[1]).toLowerCase();
  const learn = (html.match(/<section[^>]*id="learn"[\s\S]*?<\/section>/i) || [""])[0];
  const bullets = [...learn.matchAll(/<li>([\s\S]*?)<\/li>/gi)].map((match) => plain(match[1])).filter((text) => text.length >= 8);
  const paras = [...learn.matchAll(/<p>([\s\S]*?)<\/p>/gi)].map((match) => plain(match[1])).filter((text) => text.length >= 8 && !/five minutes/i.test(text));
  const outcomes = (bullets.length ? bullets : paras).slice(0, 4);
  const sourcePath = join(roomsDir, id, "sources.json");
  const raw = existsSync(sourcePath) ? JSON.parse(readFileSync(sourcePath, "utf8")) : { sources: [] };
  const sourceIds = [];
  for (const source of raw.sources || []) {
    if (!source.url) continue;
    let sid = slug(source.url);
    while (catalog.has(sid) && catalog.get(sid).url !== source.url) sid = `${sid}-2`;
    if (!catalog.has(sid)) {
      catalog.set(sid, {
        id: sid,
        title: source.title || sid,
        url: source.url,
        kind: source.kind || "unconfirmed",
        last_checked: source.last_checked || null,
        status: source.status || "unconfirmed",
      });
    }
    sourceIds.push(sid);
  }
  const level = Object.prototype.hasOwnProperty.call(LEVEL, track) ? LEVEL[track] : null;
  lessons.push({
    key: `${track.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}/${id}`,
    title,
    track,
    level,
    minutes: 5,
    outcomes: outcomes.length ? outcomes : [`Explain the room: ${title}`],
    sources: sourceIds,
    has_exercise: /data-quiz/.test(html),
    last_verified: null,
    href: `rooms/${name}`,
  });
}

mkdirSync(join(root, "data"), { recursive: true });
writeFileSync(join(root, "data/sources.json"), `${JSON.stringify({ sources: [...catalog.values()] }, null, 2)}\n`);
writeFileSync(join(root, "data/lesson-map.json"), `${JSON.stringify({ schema: "connect-lesson-map/1", lessons }, null, 2)}\n`);
console.log(`lessons ${lessons.length} sources ${catalog.size}`);
