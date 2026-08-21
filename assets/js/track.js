/* Track page — shipment lookup. Reads from window.CL_getShipment (Google Sheet
   or demo data). All output goes through textContent, so sheet data can never
   inject markup. */
(function () {
  var form = document.getElementById("trkForm"),
    input = document.getElementById("trkInput"),
    res = document.getElementById("trkResult"),
    reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

  function show(ref) {
    ref = (ref || "").trim().toUpperCase();
    if (!ref) ref = "CL-2024-001234";
    var rec =
      (window.CL_getShipment && window.CL_getShipment(ref)) ||
      (window.CL_defaultShipment
        ? window.CL_defaultShipment()
        : { status: "IN TRANSIT", origin: "Matadi Port Terminal", destination: "Kinshasa Warehouse 03", step: 2 });
    document.getElementById("trkRef").textContent = ref;
    document.getElementById("trkId").textContent = rec.origin + " → " + rec.destination;
    document.getElementById("trkStatus").textContent = rec.status;
    var steps = document.querySelectorAll("#trkTimeline .tl-step");
    steps.forEach(function (el, i) {
      el.classList.toggle("done", i < rec.step);
    });
    if (!reduce) {
      res.style.transition = "none";
      res.style.opacity = ".45";
      res.style.transform = "translateY(6px)";
      requestAnimationFrame(function () {
        res.style.transition = "opacity .4s ease, transform .4s ease";
        res.style.opacity = "1";
        res.style.transform = "none";
      });
    }
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
})();
