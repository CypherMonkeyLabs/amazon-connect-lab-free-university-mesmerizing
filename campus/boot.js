try {
  var saved = JSON.parse(localStorage.getItem("acl-campus-v1") || "{}");
  if (saved.theme) document.documentElement.dataset.theme = saved.theme;
  if (saved.fontSize) document.documentElement.dataset.font = saved.fontSize;
  var reduce = saved.reducedMotion;
  if (reduce === true || (reduce == null && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    document.documentElement.dataset.motion = "reduce";
  }
} catch (err) { /* keep the default theme */ }
