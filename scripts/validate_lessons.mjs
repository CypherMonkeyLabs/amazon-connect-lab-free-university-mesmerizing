/* Validate data/lesson-map.json against rooms/*.html and data/sources.json.
   Exit 1 on any problem.
   Usage: node scripts/validate_lessons.mjs */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const map = JSON.parse(readFileSync(join(root, "data/lesson-map.json"), "utf8"));
const schema = JSON.parse(readFileSync(join(root, "data/lesson-schema.json"), "utf8"));
const sources = JSON.parse(readFileSync(join(root, "data/sources.json"), "utf8"));
const problems = [];
const sourceIds = new Set((sources.sources || []).map((item) => item.id));
const required = schema.required;
const seen = new Set();
const roomFiles = new Set(readdirSync(join(root, "rooms")).filter((name) => name.endsWith(".html")));

function plain(html) {
  return String(html || "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
}

for (const lesson of map.lessons || []) {
  seen.add(lesson.href);
  for (const field of required) if (!(field in lesson)) problems.push(`${lesson.key}: missing field ${field}`);
  if (!Number.isInteger(lesson.level) || lesson.level < 0 || lesson.level > 10) problems.push(`${lesson.key}: level must be 0-10`);
  if (!Array.isArray(lesson.outcomes) || lesson.outcomes.length < 1 || lesson.outcomes.some((item) => typeof item !== "string" || item.length < 8)) {
    problems.push(`${lesson.key}: needs at least one outcome`);
  }
  if (!Array.isArray(lesson.sources) || lesson.sources.length < 1) problems.push(`${lesson.key}: needs at least one source`);
  for (const id of lesson.sources || []) if (!sourceIds.has(id)) problems.push(`${lesson.key}: unknown source id ${id}`);
  if (lesson.last_verified !== null && !/^\d{4}-\d{2}-\d{2}$/.test(lesson.last_verified || "")) {
    problems.push(`${lesson.key}: last_verified must be null or YYYY-MM-DD`);
  }
  const file = join(root, lesson.href || "");
  if (!lesson.href || !existsSync(file)) {
    problems.push(`${lesson.key}: missing page ${lesson.href}`);
    continue;
  }
  const html = readFileSync(file, "utf8");
  const title = plain((html.match(/<h1>([\s\S]*?)<\/h1>/) || [, ""])[1]);
  if (lesson.title !== title) problems.push(`${lesson.key}: title differs from the room h1`);
  const id = lesson.href.split("/").pop();
  if (!roomFiles.has(id)) problems.push(`${lesson.key}: room file ${id} is not in rooms/`);
}
for (const name of roomFiles) {
  const href = `rooms/${name}`;
  if (![...seen].includes(href)) problems.push(`${href}: room is not in lesson-map.json`);
}

const perLevel = {};
for (const lesson of map.lessons || []) perLevel[lesson.level] = (perLevel[lesson.level] || 0) + 1;
for (const problem of problems) console.log("FAIL", problem);
console.log("lessons:", (map.lessons || []).length, "rooms:", roomFiles.size, "per level:", JSON.stringify(perLevel));
console.log("validate_lessons:", problems.length, "problems");
process.exit(problems.length ? 1 : 0);
