/* Capital Logistics — newsletter pop-up.
   Shows once per visitor (after a delay or on exit intent), validates the
   email client-side, and saves it to the Supabase database (see
   supabase-config.js). No secrets in the frontend: the public anon key can
   only INSERT a newsletter row — Row-Level-Security blocks everything else. */
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
    document.body.classList.add("nl-lock");
    requestAnimationFrame(function () { modal.classList.add("is-open"); });
    var f = modal.querySelector("#nlEmail");
    if (f) setTimeout(function () { f.focus(); }, 380);
  }
  function close() {
    modal.classList.remove("is-open");
    document.body.classList.remove("nl-lock");
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
    var sb = window.CL_SUPABASE || {};
    if (sb.url && sb.anonKey) {
      fetch(sb.url.replace(/\/+$/, "") + "/rest/v1/newsletter", {
        method: "POST",
        headers: {
          apikey: sb.anonKey,
          Authorization: "Bearer " + sb.anonKey,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify({ email: v })
      }).then(done, done);
    } else { done(); }
  });
})();
