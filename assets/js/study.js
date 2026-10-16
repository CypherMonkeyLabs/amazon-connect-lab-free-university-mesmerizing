/* Flashcards and the practice quiz. Progress stays in this browser. */
(function () {
  function prefix() {
    var nodes = document.querySelectorAll("script[src]");
    for (var i = 0; i < nodes.length; i++) {
      var src = nodes[i].getAttribute("src") || "";
      var at = src.indexOf("assets/js/study.js");
      if (at !== -1) return src.slice(0, at);
    }
    return "";
  }
  document.querySelectorAll("[data-deck]").forEach(function (host) {
    var mode = host.getAttribute("data-mode");
    fetch(prefix() + host.getAttribute("data-deck")).then(function (res) { return res.json(); }).then(function (data) {
      var items = data.cards || data.questions || [];
      var at = 0;
      function paint() {
        var item = items[at];
        if (!item) {
          host.innerHTML = "<p>Nothing in this deck.</p>";
          return;
        }
        if (mode === "cards") {
          host.innerHTML = '<p class="kicker">Card ' + (at + 1) + " of " + items.length + "</p>" +
            "<h2>" + escapeHtml(item.front) + "</h2>" +
            "<details><summary>Show the meaning</summary><p>" + escapeHtml(item.back) + "</p>" +
            citedLine(item) + "</details>" +
            '<div class="actions"><button type="button" data-again>Again</button><button type="button" data-know>Know</button></div>' +
            sourcesBlock(item);
        } else {
          var choices = (item.choices || []).map(function (choice, index) {
            return '<button type="button" data-choice="' + index + '">' + escapeHtml(choice) + "</button>";
          }).join("");
          host.innerHTML = '<p class="kicker">Question ' + (at + 1) + " of " + items.length + "</p>" +
            "<h2>" + escapeHtml(item.q) + "</h2><div class=\"quiz-options\">" + choices + "</div>" +
            "<details><summary>Show the cited answer</summary><p>" + escapeHtml(item.why) + "</p>" +
            citedLine(item) + "</details>";
          host.querySelectorAll("[data-choice]").forEach(function (btn) {
            btn.addEventListener("click", function () {
              var ok = Number(btn.getAttribute("data-choice")) === Number(item.answer);
              btn.classList.add(ok ? "is-right" : "is-wrong");
              document.dispatchEvent(new CustomEvent("acl-quiz", { detail: { ok: ok } }));
            });
          });
        }
        var again = host.querySelector("[data-again]");
        var know = host.querySelector("[data-know]");
        if (again) again.addEventListener("click", function () { at = (at + 1) % items.length; paint(); });
        if (know) know.addEventListener("click", function () { at = (at + 1) % items.length; paint(); });
      }
      paint();
    }).catch(function () {
      host.innerHTML = "<p>The deck file did not load. Use the download buttons on this page.</p>";
    });
  });
  function citedLine(item) {
    if (item.status === "verified" && item.url) {
      return '<p><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.source || item.title || "") + "</a></p>";
    }
    if (item.status === "confirm" || !item.url) {
      return "<p><strong>confirm</strong> " + escapeHtml(item.source || item.title || "This fact") +
        ". last checked 2026-10.</p>";
    }
    return '<p><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.source || "") + "</a></p>";
  }
  function sourcesBlock(item) {
    var list = item.sources || [];
    if (!list.length) return "";
    var labels = { aws: "AWS docs", rfc: "RFC", community: "community", wikipedia: "Wikipedia" };
    var rows = list.map(function (src) {
      var kind = labels[src.kind] || src.kind || "";
      var checked = "last checked " + (src.last_checked || "");
      if (src.status === "verified" && src.url) {
        return "<li><a href=\"" + escapeHtml(src.url) + "\">" + escapeHtml(src.title) + "</a> " +
          escapeHtml(kind) + ". " + escapeHtml(checked) + "</li>";
      }
      return "<li><strong>confirm</strong> " + escapeHtml(src.title) + ". " + escapeHtml(kind) + ". " +
        escapeHtml(checked) + ". " + escapeHtml(src.note || "") + "</li>";
    }).join("");
    return '<section class="sources-deeper"><h2>Sources and go deeper</h2><ul>' + rows + "</ul></section>";
  }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
})();
