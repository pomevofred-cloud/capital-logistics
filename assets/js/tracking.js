/* Capital Logistics — public tracking lookup (live from Supabase).
   Read-only: fetches ONE shipment by its reference number. When no backend
   is configured it falls back to built-in demo records so the sample
   tracking numbers on the site keep working. Every downstream renderer uses
   textContent, so database values can never inject markup. */
(function () {
  "use strict";
  var cfg = window.CL_SUPABASE || {};
  var LIVE = !!(cfg.url && cfg.anonKey);
  var BASE = (cfg.url || "").replace(/\/+$/, "");

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
      note: row.note || ""
    };
  }
  function demo(ref) { return DEMO[ref] ? norm(DEMO[ref], ref) : null; }

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
    return { status: "IN TRANSIT", origin: "Matadi Port Terminal", destination: "Kinshasa Warehouse 03", step: 2, location: "" };
  };
})();
