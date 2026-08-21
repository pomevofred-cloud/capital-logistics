/* Capital Logistics — lightweight bilingual (EN/FR) layer.
   Translates text nodes + a few attributes via the CL_I18N.fr dictionary,
   remembers the choice in localStorage, and drives the EN/FR switcher.
   English is the source markup; French is applied on top and can be undone,
   so no page is duplicated. Elements marked [data-no-i18n] are left untouched
   (used for live data such as tracker results). */
(function () {
  var DICT = (window.CL_I18N && window.CL_I18N.fr) || {};
  var KEY = "cl_lang";
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, CODE: 1, svg: 1, SVG: 1 };
  var norm = function (s) { return s.replace(/\s+/g, " ").trim(); };

  var textNodes = []; // {node, key, lead, trail, orig}
  var attrNodes = []; // {el, attr, key, orig}

  function excluded(el, root) {
    var p = el;
    while (p && p !== root) {
      if (SKIP[p.nodeName]) return true;
      if (p.getAttribute && p.getAttribute("data-no-i18n") !== null) return true;
      p = p.parentNode;
    }
    return false;
  }

  function collect() {
    var body = document.body;
    var w = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = w.nextNode())) {
      if (!n.nodeValue || !n.nodeValue.trim()) continue;
      if (excluded(n.parentNode, body)) continue;
      var key = norm(n.nodeValue);
      if (DICT[key] !== undefined) {
        var lead = n.nodeValue.match(/^\s*/)[0];
        var trail = n.nodeValue.match(/\s*$/)[0];
        textNodes.push({ node: n, key: key, lead: lead, trail: trail, orig: n.nodeValue });
      }
    }
    var ATTRS = ["placeholder", "aria-label", "alt", "title"];
    document.querySelectorAll("[placeholder],[aria-label],[alt],[title]").forEach(function (el) {
      if (excluded(el, body)) return;
      ATTRS.forEach(function (a) {
        if (!el.hasAttribute(a)) return;
        var key = norm(el.getAttribute(a));
        if (DICT[key] !== undefined) attrNodes.push({ el: el, attr: a, key: key, orig: el.getAttribute(a) });
      });
    });
    var md = document.querySelector('meta[name="description"]');
    if (md) { var mk = norm(md.getAttribute("content") || ""); if (DICT[mk] !== undefined) attrNodes.push({ el: md, attr: "content", key: mk, orig: md.getAttribute("content") }); }
    var tk = norm(document.title || "");
    if (DICT[tk] !== undefined) attrNodes.push({ el: document, attr: "__title", key: tk, orig: document.title });
  }

  function apply(lang) {
    var fr = lang === "fr";
    textNodes.forEach(function (o) {
      o.node.nodeValue = fr ? o.lead + DICT[o.key] + o.trail : o.orig;
    });
    attrNodes.forEach(function (o) {
      var v = fr ? DICT[o.key] : o.orig;
      if (o.attr === "__title") document.title = v;
      else o.el.setAttribute(o.attr, v);
    });
    document.documentElement.setAttribute("lang", fr ? "fr" : "en");
    document.querySelectorAll("[data-lang]").forEach(function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function setLang(lang) {
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    apply(lang);
  }

  function initialLang() {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved === "fr" || saved === "en") return saved;
    return (navigator.language || "").toLowerCase().indexOf("fr") === 0 ? "fr" : "en";
  }

  function init() {
    collect();
    document.querySelectorAll("[data-lang]").forEach(function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); setLang(b.getAttribute("data-lang")); });
    });
    apply(initialLang());
    window.CL_setLang = setLang;
    window.CL_lang = initialLang;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
