/* Capital Logistics — public tracking lookup (live from Supabase).
   Read-only: fetches ONE shipment by its reference number. When no backend
   is configured it falls back to built-in demo records so the sample
   tracking numbers on the site keep working. Every downstream renderer uses
   textContent, so database values can never inject markup.

   Multilingual: a shipment may carry a `translations` object,
   e.g. { fr: { status, origin, destination, location, note } }, managed from
   the CMS. CL_localizeShipment() returns a copy in the requested language,
   using those overrides first, then auto-translating standard statuses, then
   falling back to the base (English) value — so one language never overwrites
   another and untranslated fields still display. */
(function () {
  "use strict";
  var cfg = window.CL_SUPABASE || {};
  var LIVE = !!(cfg.url && cfg.anonKey);
  var BASE = (cfg.url || "").replace(/\/+$/, "");

  /* standard-status auto-translation (used when a record has no explicit override) */
  var STATUS_I18N = {
    fr: {
      "PICKED UP": "ENLEVÉ", "IN TRANSIT": "EN TRANSIT", "AT CUSTOMS": "EN DOUANE",
      "OUT FOR DELIVERY": "EN LIVRAISON", "DELIVERED": "LIVRÉ", "DELAYED": "RETARDÉ",
      "ON HOLD": "EN ATTENTE", "EXCEPTION": "EXCEPTION"
    }
  };

  var DEMO = {
    "CL-2024-001234": { status: "IN TRANSIT", origin: "Matadi Port Terminal", destination: "Kinshasa Warehouse 03", step: 2, location: "N1 corridor" },
    "CL-2024-001235": { status: "AT CUSTOMS", origin: "Boma Port", destination: "Kikwit Depot 01", step: 3, location: "Kinshasa customs" },
    "CL-2024-001236": { status: "DELIVERED", origin: "Kinshasa Hub", destination: "Tshikapa Terminal", step: 5, location: "Signed — POD on file" }
  };

  function norm(row, ref) {
    if (!row) return null;
    return {
      reference: row.reference || ref || "",
      status: (row.status || "IN TRANSIT"),
      origin: row.origin || "",
      destination: row.destination || "",
      step: Math.max(1, Math.min(5, parseInt(row.step, 10) || 2)),
      location: row.location || "",
      eta: row.eta || "",
      note: row.note || "",
      translations: (row.translations && typeof row.translations === "object") ? row.translations : {}
    };
  }
  function demo(ref) { return DEMO[ref] ? norm(DEMO[ref], ref) : null; }

  function curLang() {
    try { return localStorage.getItem("cl_lang") === "fr" ? "fr" : "en"; } catch (e) { return "en"; }
  }

  /* return a copy of the record rendered in `lang` (defaults to the saved language) */
  window.CL_localizeShipment = function (rec, lang) {
    if (!rec) return rec;
    lang = lang || curLang();
    var tr = (rec.translations && rec.translations[lang]) || {};
    function pick(field) {
      return (tr[field] != null && String(tr[field]).trim() !== "") ? tr[field] : rec[field];
    }
    var status = pick("status");
    if (lang !== "en" && !(tr.status && String(tr.status).trim())) {
      var map = STATUS_I18N[lang];
      var up = (rec.status || "").toUpperCase();
      if (map && map[up]) status = map[up];
    }
    return {
      reference: rec.reference,
      status: status,
      origin: pick("origin"),
      destination: pick("destination"),
      step: rec.step,
      location: pick("location"),
      eta: rec.eta,
      note: pick("note"),
      translations: rec.translations
    };
  };

  function fetchLive(ref) {
    var url = BASE + "/rest/v1/shipments?select=*&archived=eq.false&reference=eq." +
      encodeURIComponent(ref) + "&limit=1";
    return fetch(url, {
      headers: { apikey: cfg.anonKey, Authorization: "Bearer " + cfg.anonKey },
      cache: "no-store"
    }).then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (rows) { return norm(rows && rows[0], ref); });
  }

  window.CL_ready = Promise.resolve();
  window.CL_live = LIVE;
  window.CL_getShipment = function (ref) {
    ref = (ref || "").trim().toUpperCase();
    if (!ref) return Promise.resolve(null);
    if (LIVE) {
      return fetchLive(ref)
        .then(function (rec) { return rec || demo(ref); })
        .catch(function () { return demo(ref); });
    }
    return Promise.resolve(demo(ref));
  };
  window.CL_defaultShipment = function () {
    return { status: "IN TRANSIT", origin: "Matadi Port Terminal", destination: "Kinshasa Warehouse 03", step: 2, location: "", translations: {} };
  };
})();
