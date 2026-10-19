(function () {
  var form = document.getElementById("desk");
  var out = document.getElementById("desk-result");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var data = new FormData(form);
    var seconds = Number(data.get("lambda"));
    var line = "Simulation only. ";
    if (data.get("hours") === "closed") line += "Hours are closed, so Check hours would take the closed branch before the queue.";
    else if (data.get("queue") === "missing") line += "Set working queue has not run, so there is no queue to offer.";
    else if (data.get("profile") === "no") line += "The queue has no agent whose profile includes it, so the contact waits.";
    else if (!(seconds >= 0) || Number.isNaN(seconds)) line += "Enter a Lambda wait in seconds.";
    else if (seconds > 8) line += "A flow invoke that waits past 8 seconds can take the timeout branch. A longer console timeout does not extend that wait.";
    else line += "Hours are open, the queue is set, and a profile includes it. The contact can be offered. Lambda is within 8 seconds.";
    out.textContent = line;
  });
})();
