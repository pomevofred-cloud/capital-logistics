/* Contact form — inline confirmation (no backend; message is prepared client-side). */
(function () {
  var f = document.getElementById("contactForm");
  if (!f) return;
  f.addEventListener("submit", function (e) {
    e.preventDefault();
    var foot = f.querySelector(".cform__foot");
    if (!foot) return;
    foot.textContent = "";
    var p = document.createElement("p");
    p.className = "note";
    p.style.color = "var(--blue)";
    p.style.fontWeight = "500";
    var fr = (function () { try { return localStorage.getItem("cl_lang") === "fr"; } catch (e) { return false; } })();
    p.textContent = fr
      ? "✓ Merci — votre message est prêt. Nous répondrons sous un jour ouvrable."
      : "✓ Thanks, your message is ready. We'll respond within one business day.";
    foot.appendChild(p);
  });
})();
