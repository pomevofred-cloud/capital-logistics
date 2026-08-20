/* =========================================================================
   Capital Logistics — interactions & motion (subtle, professional)
   ========================================================================= */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header solid-on-scroll ---------- */
  var header = document.getElementById("siteHeader");
  var overlay = header && header.classList.contains("site-header--over");
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("is-solid", window.scrollY > 24 || !overlay);
  }
  onScrollHeader();

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var scrim = document.getElementById("navScrim");
  var panel = document.getElementById("mobilePanel");
  function setNav(open) {
    document.body.classList.toggle("nav-open", open);
    if (toggle) { toggle.setAttribute("aria-expanded", open ? "true" : "false"); toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu"); }
  }
  if (toggle) toggle.addEventListener("click", function () { setNav(!document.body.classList.contains("nav-open")); });
  if (scrim) scrim.addEventListener("click", function () { setNav(false); });
  var navClose = document.getElementById("navClose");
  if (navClose) navClose.addEventListener("click", function () { setNav(false); });
  if (panel) panel.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setNav(false); });

  /* ---------- Scroll reveal ---------- */
  var revealEls = [].slice.call(document.querySelectorAll(".reveal,[data-stagger]"));
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    document.querySelectorAll("[data-stagger]").forEach(function (g) {
      for (var i = 0; i < g.children.length; i++) g.children[i].style.transitionDelay = (i * 85) + "ms";
    });
    revealEls.forEach(function (el) { var d = el.getAttribute("data-delay"); if (d) el.style.transitionDelay = d + "ms"; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
    /* Reveal anything already in the first screen right away — the observer's
       first callback can lag on load, which would leave the hero blank. */
    requestAnimationFrame(function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      revealEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.9 && r.bottom > 0) { el.classList.add("in"); io.unobserve(el); }
      });
    });
  }

  /* ---------- Animated counters ---------- */
  function fmt(n, o) { var s = String(n); if (o.pad) while (s.length < o.pad) s = "0" + s; if (o.comma) s = n.toLocaleString("en-US"); return s; }
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count")); if (isNaN(target)) return;
    var out = el.querySelector(".val") || el;
    var o = { pad: parseInt(el.getAttribute("data-pad") || "0", 10), comma: el.getAttribute("data-format") === "comma" };
    if (reduce) { out.textContent = fmt(target, o); return; }
    var dur = 1400, start = null;
    (function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      out.textContent = fmt(Math.round(target * e), o);
      if (p < 1) requestAnimationFrame(tick); else out.textContent = fmt(target, o);
    })(performance.now());
  }
  var counters = [].slice.call(document.querySelectorAll("[data-count]"));
  if (reduce || !("IntersectionObserver" in window)) counters.forEach(runCounter);
  else {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- FAQ accordion ---------- */
  var faqs = [].slice.call(document.querySelectorAll(".faq"));
  function setFaq(f, open) {
    var b = f.querySelector(".faq__q"), a = f.querySelector(".faq__a");
    f.classList.toggle("is-open", open);
    if (b) b.setAttribute("aria-expanded", open ? "true" : "false");
    if (a) a.style.height = open ? a.firstElementChild.scrollHeight + "px" : "0px";
  }
  faqs.forEach(function (f) {
    setFaq(f, f.classList.contains("is-open"));
    var b = f.querySelector(".faq__q");
    if (b) b.addEventListener("click", function () { setFaq(f, !f.classList.contains("is-open")); });
  });
  window.addEventListener("resize", function () {
    faqs.forEach(function (f) { if (f.classList.contains("is-open")) { var a = f.querySelector(".faq__a"); if (a) a.style.height = a.firstElementChild.scrollHeight + "px"; } });
  });

  /* ---------- Tracker (data from tracking.js → Google Sheet or demo) ---------- */
  var form = document.getElementById("trackForm");
  if (form) {
    function show(ref) {
      ref = (ref || "").trim().toUpperCase(); if (!ref) ref = "CL-2024-001234";
      var r = (window.CL_getShipment && window.CL_getShipment(ref)) ||
              (window.CL_defaultShipment ? window.CL_defaultShipment() : { status: "IN TRANSIT", origin: "Matadi Port Terminal", destination: "Kinshasa Warehouse 03" });
      document.getElementById("trackRefLabel").textContent = ref;
      document.getElementById("trackId").textContent = "Shipment " + ref;
      document.getElementById("trackStatus").textContent = r.status;
      form.parentNode.querySelector(".tracker__node--from .n-name").textContent = r.origin;
      form.parentNode.querySelector(".tracker__node--to .n-name").textContent = r.destination;
      var res = document.getElementById("trackResult");
      if (!reduce && res) {
        res.style.transition = "none"; res.style.opacity = ".45"; res.style.transform = "translateY(6px)";
        requestAnimationFrame(function () { res.style.transition = "opacity .4s ease, transform .4s ease"; res.style.opacity = "1"; res.style.transform = "none"; });
      }
    }
    form.addEventListener("submit", function (e) { e.preventDefault(); show(document.getElementById("trackInput").value); });
    document.querySelectorAll(".tracker__try button").forEach(function (b) {
      b.addEventListener("click", function () { var v = b.getAttribute("data-ref"); document.getElementById("trackInput").value = v; show(v); });
    });
    if (window.CL_ready) window.CL_ready.then(function () { var el = document.getElementById("trackInput"); if (el && el.value) show(el.value); });
  }

  /* ---------- Subtle hero parallax ---------- */
  var px = document.querySelector("[data-parallax]"), ticking = false;
  if (px && !reduce) px.style.transform = "scale(1.06)";
  window.addEventListener("scroll", function () {
    onScrollHeader();
    if (px && !reduce && !ticking) {
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.2) px.style.transform = "translate3d(0," + (y * 0.12) + "px,0) scale(1.06)";
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  /* ---------- Testimonial slider (swipe + arrows + drag) ---------- */
  document.querySelectorAll(".tslider").forEach(function (sl) {
    var track = sl.querySelector(".tslider__track");
    if (!track) return;
    function step() { var c = track.querySelector(".testi-card"); return c ? c.getBoundingClientRect().width + 16 : track.clientWidth * 0.85; }
    sl.querySelectorAll(".tslider__btn").forEach(function (b) {
      b.addEventListener("click", function () { track.scrollBy({ left: step() * parseInt(b.getAttribute("data-dir"), 10), behavior: "smooth" }); });
    });
    function upd() {
      var pb = sl.querySelector('.tslider__btn[data-dir="-1"]'), nb = sl.querySelector('.tslider__btn[data-dir="1"]');
      if (pb) pb.disabled = track.scrollLeft < 6;
      if (nb) nb.disabled = track.scrollLeft > track.scrollWidth - track.clientWidth - 6;
    }
    track.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd); upd();
    var down = false, sx = 0, s0 = 0;
    track.addEventListener("pointerdown", function (e) { if (e.pointerType === "mouse") { down = true; sx = e.clientX; s0 = track.scrollLeft; track.classList.add("is-drag"); } });
    window.addEventListener("pointermove", function (e) { if (down) track.scrollLeft = s0 - (e.clientX - sx); });
    window.addEventListener("pointerup", function () { if (down) { down = false; track.classList.remove("is-drag"); } });
  });

  /* ---------- Cookie consent ---------- */
  var ck = document.getElementById("cookieBanner");
  if (ck) {
    var stored = null;
    try { stored = localStorage.getItem("cl-cookie-consent"); } catch (e) {}
    if (!stored) setTimeout(function () { ck.classList.add("show"); }, 1400);
    function closeCk(v) {
      try { localStorage.setItem("cl-cookie-consent", v); } catch (e) {}
      ck.classList.remove("show");
    }
    var acc = document.getElementById("cookieAccept");
    if (acc) acc.addEventListener("click", function () { closeCk("accepted"); });
    var more = ck.querySelector(".cookie__more");
    if (more) more.addEventListener("click", function (e) { e.preventDefault(); closeCk("dismissed"); });
  }
})();
