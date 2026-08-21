/* Capital Logistics — newsletter pop-up.
   Shows once per visitor (after a delay or on exit intent), validates the
   email client-side, and POSTs it to the configured endpoint (see
   newsletter-config.js). No secrets in the frontend; the endpoint is a
   serverless Google Apps Script that appends to a private Sheet. */
(function () {
  var modal = document.getElementById("newsletter");
  if (!modal) return;
  var KEY = "cl_nl";
  var form = document.getElementById("nlForm");
  var email = document.getElementById("nlEmail");
  var msg = document.getElementById("nlMsg");

  var MSG = {
    en: { invalid: "Please enter a valid email address.", ok: "Thank you — you’re on the list." },
    fr: { invalid: "Veuillez saisir une adresse e-mail valide.", ok: "Merci — vous êtes inscrit(e)." }
  };
  function lang() { try { return localStorage.getItem("cl_lang") === "fr" ? "fr" : "en"; } catch (e) { return "en"; } }
  function seen() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function remember(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function open() {
    if (modal.classList.contains("is-open")) return;
    modal.hidden = false;
    requestAnimationFrame(function () { modal.classList.add("is-open"); });
    var f = modal.querySelector("#nlEmail");
    if (f) setTimeout(function () { f.focus(); }, 380);
  }
  function close() {
    modal.classList.remove("is-open");
    setTimeout(function () { modal.hidden = true; }, 340);
  }

  if (!seen()) {
    var opened = false;
    var fire = function () { if (!opened) { opened = true; clearTimeout(timer); open(); } };
    var timer = setTimeout(fire, 12000);
    document.addEventListener("mouseout", function (e) {
      if (!e.relatedTarget && e.clientY <= 0) fire();
    });
  }

  modal.querySelectorAll("[data-nl-close]").forEach(function (el) {
    el.addEventListener("click", function () { remember("dismissed"); close(); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("is-open")) { remember("dismissed"); close(); }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = (email.value || "").trim();
    var L = MSG[lang()];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      msg.textContent = L.invalid; msg.className = "nl-msg is-err"; email.focus(); return;
    }
    var done = function () {
      remember("subscribed");
      msg.textContent = L.ok; msg.className = "nl-msg is-ok";
      form.querySelector(".nl-btn--primary").disabled = true;
      setTimeout(close, 1700);
    };
    var url = (window.CL_NEWSLETTER || {}).endpoint || "";
    if (url) {
      fetch(url, {
        method: "POST", mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "email=" + encodeURIComponent(v)
      }).then(done, done);
    } else { done(); }
  });
})();
