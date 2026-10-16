/* App shell for the Amazon Connect lab. Same-origin GET only. */
var CACHE = "connect-lab-r2-v1";
var SHELL = [
  "./",
  "./index.html",
  "./start.html",
  "./help.html",
  "./downloads.html",
  "./site.webmanifest",
  "./favicon.svg",
  "./assets/css/frame.css",
  "./assets/css/wow.css",
  "./assets/css/footer.css",
  "./assets/js/frame.js",
  "./assets/js/university.js",
  "./guide/guide.js",
  "./guide/guide.css",
  "./guide/engine.mjs",
  "./guide/kb.json"
];

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return Promise.all(SHELL.map(function (url) {
      return cache.add(url).catch(function () { return null; });
    }));
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
    }).catch(function () { return hit; });
    return hit || network;
  }));
});
