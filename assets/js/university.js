/* Service worker and small page helpers. Paths stay relative. */
(function () {
  function prefix() {
    var nodes = document.querySelectorAll("script[src]");
    for (var i = 0; i < nodes.length; i++) {
      var src = nodes[i].getAttribute("src") || "";
      var at = src.indexOf("assets/js/university.js");
      if (at !== -1) return src.slice(0, at);
    }
    return "";
  }
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register(prefix() + "sw.js").catch(function () { /* pages still open */ });
    });
  }
  document.querySelectorAll("[data-replay-tour]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      localStorage.removeItem("acl-tour-v1");
      if (window.ConnectGuide && window.ConnectGuide.replay) window.ConnectGuide.replay();
    });
  });
})();
