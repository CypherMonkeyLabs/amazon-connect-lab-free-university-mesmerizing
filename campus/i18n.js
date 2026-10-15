import { lessonHeading } from "./lesson-titles.js";

export { lessonHeading };

export const LANGS = [
  ["en", "English", "ltr"],
  ["es", "Español", "ltr"],
  ["hi", "हिन्दी", "ltr"],
  ["te", "తెలుగు", "ltr"],
  ["fr", "Français", "ltr"],
  ["de", "Deutsch", "ltr"],
  ["ja", "日本語", "ltr"],
  ["ar", "العربية", "rtl"],
];

const MENU = {
  en: ["Diagrams", "Flows", "Charts", "Cheat Codes", "Play", "Ecosystem", "Downloads", "Careers"],
  es: ["Diagramas", "Flujos", "Gráficos", "Chuletas", "Jugar", "Ecosistema", "Descargas", "Carreras"],
  hi: ["आरेख", "प्रवाह", "चार्ट", "चीट कोड", "खेल", "इकोसिस्टम", "डाउनलोड", "करियर"],
  te: ["రేఖాచిత్రాలు", "ప్రవాహాలు", "చార్టులు", "చీట్ కోడ్స్", "ఆడండి", "ఎకోసిస్టమ్", "డౌన్‌లోడ్స్", "కెరీర్"],
  fr: ["Schémas", "Flux", "Graphiques", "Antisèches", "Jouer", "Écosystème", "Téléchargements", "Parcours"],
  de: ["Diagramme", "Abläufe", "Charts", "Spickzettel", "Spielen", "Ökosystem", "Downloads", "Laufbahnen"],
  ja: ["図", "フロー", "チャート", "チート", "プレイ", "連携", "ダウンロード", "キャリア"],
  ar: ["مخططات", "تدفقات", "رسوم", "أوراق", "العب", "المنظومة", "تنزيل", "مسارات"],
};

const GREET = {
  en: "The call path is already moving.",
  es: "La ruta de la llamada ya se está moviendo.",
  hi: "कॉल पथ पहले से चल रहा है।",
  te: "కాల్ మార్గం ఇప్పటికే కదులుతోంది.",
  fr: "Le chemin de l'appel est déjà en mouvement.",
  de: "Der Anrufweg bewegt sich schon.",
  ja: "通話経路はもう動いています。",
  ar: "مسار المكالمة يتحرك الآن.",
};

const KEYS = ["diagrams", "flows", "charts", "cheats", "play", "ecosystem", "downloads", "careers"];

export function pack(lang) {
  const code = MENU[lang] ? lang : "en";
  const menu = {};
  KEYS.forEach((key, index) => { menu[key] = MENU[code][index]; });
  return {
    code,
    dir: code === "ar" ? "rtl" : "ltr",
    greet: GREET[code],
    menu,
    note: code === "en"
      ? "Lesson headings follow this switch. The first lesson of each track is translated. Every other lesson body stays in English, and the page says so."
      : GREET[code],
  };
}

export function applyLanguage(lang) {
  const copy = pack(lang);
  const root = document.documentElement;
  root.lang = copy.code;
  root.dir = copy.dir;
  document.querySelectorAll(".campus-menu a[data-menu]").forEach((link) => {
    const label = copy.menu[link.dataset.menu];
    if (label) link.textContent = label;
  });
  const greet = document.getElementById("hero-greet");
  if (greet) greet.textContent = copy.greet;
  const note = document.getElementById("lang-note");
  if (note) note.textContent = copy.code === "en"
    ? "Lesson headings follow this switch. The first lesson of each track is translated. Every other lesson body stays in English, and the page says so."
    : copy.greet;
  document.querySelectorAll("[data-en]").forEach((el) => {
    const english = el.dataset.en;
    if (!english) return;
    el.textContent = lessonHeading(copy.code, english);
  });
  const select = document.getElementById("lang");
  if (select && select.value !== copy.code) select.value = copy.code;
  return copy;
}
