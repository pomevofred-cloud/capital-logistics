/* Track page — shipment lookup (live from Supabase via window.CL_getShipment).
   The lookup is asynchronous. All output goes through textContent, so
   database values can never inject markup. */
(function () {
  var form = document.getElementById("trkForm"),
    input = document.getElementById("trkInput"),
    res = document.getElementById("trkResult"),
    reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

  function fr() { try { return localStorage.getItem("cl_lang") === "fr"; } catch (e) { return false; } }

  function paint() {
    if (reduce || !res) return;
    res.style.transition = "none";
    res.style.opacity = ".45";
    res.style.transform = "translateY(6px)";
    requestAnimationFrame(function () {
      res.style.transition = "opacity .4s ease, transform .4s ease";
      res.style.opacity = "1";
      res.style.transform = "none";
    });
  }

  var lastRef = null, lastRec = null; // remembered so we can re-render on language change

  function render(ref, rec) {
    lastRef = ref; lastRec = rec;
    var loc = window.CL_localizeShipment ? window.CL_localizeShipment(rec) : rec;
    document.getElementById("trkRef").textContent = ref;
    document.getElementById("trkId").textContent = loc.origin + " → " + loc.destination;
    document.getElementById("trkStatus").textContent = loc.status;
    document.querySelectorAll("#trkTimeline .tl-step").forEach(function (el, i) {
      el.classList.toggle("done", i < loc.step);
    });
    paint();
  }

  function notFound(ref) {
    lastRef = ref; lastRec = null;
    document.getElementById("trkRef").textContent = ref;
    document.getElementById("trkId").textContent = fr()
      ? "Aucun envoi trouvé — vérifiez le numéro ou contactez votre gestionnaire."
      : "No shipment found — check the number or contact your account manager.";
    document.getElementById("trkStatus").textContent = fr() ? "INTROUVABLE" : "NOT FOUND";
    document.querySelectorAll("#trkTimeline .tl-step").forEach(function (el) { el.classList.remove("done"); });
    paint();
  }

  function show(ref) {
    ref = (ref || "").trim().toUpperCase();
    if (!ref) ref = "CL-2024-001234";
    Promise.resolve(window.CL_getShipment ? window.CL_getShipment(ref) : null).then(function (rec) {
      if (rec) render(ref, rec); else notFound(ref);
    });
  }

  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      show(input.value);
    });
  if (window.CL_ready)
    window.CL_ready.then(function () {
      if (input && input.value) show(input.value);
    });
  document.querySelectorAll(".track-try button").forEach(function (b) {
    b.addEventListener("click", function () {
      input.value = b.getAttribute("data-ref");
      show(b.getAttribute("data-ref"));
    });
  });

  /* re-render the current result when the visitor switches language */
  window.addEventListener("cl:langchange", function () {
    if (lastRef == null) return;
    if (lastRec) render(lastRef, lastRec); else notFound(lastRef);
  });
})();
