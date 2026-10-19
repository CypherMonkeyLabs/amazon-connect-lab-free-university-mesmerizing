const VERSION = "acl-campus-v26";
const SHELL = ["index.html", "campus.css", "app.js", "studio.js", "flowlang.js", "i18n.js", "lesson-titles.js", "lesson-bodies.js", "palette.js", "icons.js", "hero.js", "guide-bot.js", "boot.js", "guide-kb.json", "favicon.svg", "favicon.ico", "data/shell.json", "data/mastery.json", "data/atlas.json", "audio/use.mp3", "audio/share.mp3", "og-card.png"];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)))).then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith("/sw.js")) {
    event.respondWith(fetch(req));
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(req);
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    } catch (err) {
      if (req.mode === "navigate") {
        const home = await cache.match("index.html");
        if (home) return home;
      }
      throw err;
    }
  })());
});
