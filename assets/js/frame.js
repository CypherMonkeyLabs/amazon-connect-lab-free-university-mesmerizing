/* Banner, drawer, display controls, room quizzes. The bot lives in guide/guide.js. */
(function () {
  var root = document.documentElement;

  function bootDisplay() {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem("acl-display") || "{}"); } catch (err) { saved = {}; }
    if (saved.theme === "dark") root.dataset.theme = "dark";
    else root.dataset.theme = "bright";
    if (saved.font) root.dataset.font = saved.font;
    if (saved.ink && /^#[0-9a-fA-F]{6}$/.test(saved.ink)) root.style.setProperty("--ink", saved.ink);
    if (saved.motion === "reduce") root.dataset.motion = "reduce";
  }
  bootDisplay();

  function saveDisplay(partial) {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem("acl-display") || "{}"); } catch (err) { saved = {}; }
    Object.keys(partial).forEach(function (key) { saved[key] = partial[key]; });
    localStorage.setItem("acl-display", JSON.stringify(saved));
  }

  var menuBtn = document.querySelector("[data-open-menu]");
  var drawer = document.getElementById("site-drawer");
  var scrim = document.querySelector(".drawer-scrim");
  var displayBtn = document.querySelector("[data-open-display]");
  var displayPop = document.querySelector(".display-pop");

  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle("is-open", open);
    if (scrim) scrim.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    if (open) drawer.removeAttribute("inert");
    else drawer.setAttribute("inert", "");
    document.body.classList.toggle("drawer-open", open);
    if (menuBtn) menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      var search = drawer.querySelector("[data-menu-filter]");
      if (search) search.focus();
    } else if (menuBtn) menuBtn.focus();
  }

  if (menuBtn && drawer) {
    menuBtn.addEventListener("click", function () {
      setDrawer(!drawer.classList.contains("is-open"));
    });
  }
  document.querySelectorAll("[data-close-drawer]").forEach(function (node) {
    node.addEventListener("click", function () { setDrawer(false); });
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (drawer && drawer.classList.contains("is-open")) setDrawer(false);
      if (displayPop && !displayPop.hidden) {
        displayPop.hidden = true;
        if (displayBtn) displayBtn.focus();
      }
    }
  });

  var filter = document.querySelector("[data-menu-filter]");
  if (filter) {
    filter.addEventListener("input", function () {
      var q = filter.value.toLowerCase();
      document.querySelectorAll(".drawer-row").forEach(function (row) {
        var text = row.textContent.toLowerCase();
        row.classList.toggle("is-hidden", q && text.indexOf(q) === -1);
      });
    });
  }

  document.querySelectorAll("[data-filter-cards]").forEach(function (input) {
    input.addEventListener("input", function () {
      var q = input.value.toLowerCase();
      var scope = document.querySelector(input.getAttribute("data-filter-cards"));
      if (!scope) return;
      scope.querySelectorAll("[data-card]").forEach(function (card) {
        card.hidden = q && card.textContent.toLowerCase().indexOf(q) === -1;
      });
    });
  });

  document.querySelectorAll("[data-rail]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var rail = document.querySelector(".section-rail");
      if (!rail) return;
      rail.scrollBy({ left: Number(btn.getAttribute("data-rail")) * 220, behavior: "smooth" });
    });
  });

  if (displayBtn && displayPop) {
    displayBtn.addEventListener("click", function () {
      displayPop.hidden = !displayPop.hidden;
      displayBtn.setAttribute("aria-expanded", displayPop.hidden ? "false" : "true");
    });
  }
  document.querySelectorAll("[data-font-set]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var size = btn.getAttribute("data-font-set");
      root.dataset.font = size;
      saveDisplay({ font: size });
    });
  });
  document.querySelectorAll("[data-set-theme]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var theme = btn.getAttribute("data-set-theme");
      root.dataset.theme = theme === "dark" ? "dark" : "bright";
      saveDisplay({ theme: root.dataset.theme });
    });
  });
  var ink = document.querySelector("[data-ink]");
  if (ink) {
    ink.addEventListener("input", function () {
      if (!/^#[0-9a-fA-F]{6}$/.test(ink.value)) return;
      root.style.setProperty("--ink", ink.value);
      saveDisplay({ ink: ink.value });
    });
  }
  var motion = document.querySelector("[data-reduce-motion]");
  if (motion) {
    motion.checked = root.dataset.motion === "reduce";
    motion.addEventListener("change", function () {
      if (motion.checked) root.dataset.motion = "reduce";
      else root.removeAttribute("data-motion");
      saveDisplay({ motion: motion.checked ? "reduce" : "full" });
    });
  }

  document.querySelectorAll("[data-quiz]").forEach(function (quiz) {
    var answer = Number(quiz.getAttribute("data-answer"));
    quiz.querySelectorAll("button").forEach(function (btn, index) {
      btn.addEventListener("click", function () {
        quiz.querySelectorAll("button").forEach(function (peer) {
          peer.classList.remove("is-right", "is-wrong");
        });
        btn.classList.add(index === answer ? "is-right" : "is-wrong");
        document.dispatchEvent(new CustomEvent("acl-quiz", { detail: { ok: index === answer } }));
      });
    });
  });

  var params = new URLSearchParams(location.search);
  var shot = params.get("shot");
  if (shot === "menu" && drawer) setDrawer(true);

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && root.dataset.motion !== "reduce") root.classList.add("motion");
})();
