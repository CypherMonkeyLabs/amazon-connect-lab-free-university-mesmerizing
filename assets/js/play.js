/* Small drills. The correct choice is the index stored on the form. */
(function () {
  document.querySelectorAll("[data-game]").forEach(function (form) {
    var answer = Number(form.getAttribute("data-answer"));
    var note = form.querySelector("[data-game-note]");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var picked = form.querySelector("input:checked");
      if (!picked) {
        if (note) note.textContent = "Pick one option.";
        return;
      }
      var ok = Number(picked.value) === answer;
      if (note) note.textContent = ok ? "That matches the lesson." : "Not this one. Open the cited answer under the choices.";
      document.dispatchEvent(new CustomEvent("acl-quiz", { detail: { ok: ok } }));
    });
  });
})();
