/* App shell for the Amazon Connect lab. Same-origin GET only.
   SHELL is rewritten by scripts/build_precache.mjs. */
var CACHE = "connect-lab-r3-v3";
var SHELL = [
  "./index.html",
  "./offline.html",
  "./start.html",
  "./play.html",
  "./sim.html",
  "./help.html",
  "./rooms/route-queue.html",
  "./site.webmanifest",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-512.png",
  "./js/content/connectbot-index.json",
  "./shared/pybot-chat/engine.js",
  "./shared/pybot-chat/ui.js",
  "./shared/pybot-chat/chat.css",
  "./guide/guide.js",
  "./guide/guide.css",
  "./guide/dragbot.js",
  "./guide/engine.mjs",
  "./assets/css/footer.css",
  "./assets/css/frame.css",
  "./assets/css/wow.css",
  "./assets/js/frame.js",
  "./assets/js/university.js",
  "./assets/js/play.js",
  "./assets/js/study.js",
];

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return cache.addAll(SHELL);
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) { return key !== CACHE; }).map(function (key) {
      return caches.delete(key);
    }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;
  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(caches.match(request).then(function (hit) {
    var network = fetch(request).then(function (response) {
      if (response && response.ok && response.type === "basic") {
        var copy = response.clone();
        caches.open(CACHE).then(function (cache) { cache.put(request, copy); });
      }
      return response;
    }).catch(function () {
      if (hit) return hit;
      if (request.mode === "navigate") return caches.match("./offline.html");
      return new Response("", { status: 504, statusText: "offline" });
    });
    return hit || network;
  }));
});
