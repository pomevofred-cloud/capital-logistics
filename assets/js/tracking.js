/* Capital Logistics — tracking data loader (Google Sheet CSV or demo data) */
(function () {
  "use strict";
  var cfg = window.CL_TRACKING || {};

  // Built-in demo data (fallback: no sheet configured, or reference not found)
  var DB = {
    "CL-2024-001234": { status: "IN TRANSIT", origin: "Matadi Port Terminal", destination: "Kinshasa Warehouse 03", step: 2 },
    "CL-2024-001235": { status: "AT CUSTOMS", origin: "Boma Port", destination: "Kikwit Depot 01", step: 3 },
    "CL-2024-001236": { status: "DELIVERED", origin: "Kinshasa Hub", destination: "Tshikapa Terminal", step: 5 }
  };

  function parseCSV(text) {
    var rows = [], cur = [], val = "", q = false, c;
    for (var i = 0; i < text.length; i++) {
      c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { val += '"'; i++; } else q = false; }
        else val += c;
      } else if (c === '"') q = true;
      else if (c === ",") { cur.push(val); val = ""; }
      else if (c === "\n") { cur.push(val); rows.push(cur); cur = []; val = ""; }
      else if (c !== "\r") val += c;
    }
    if (val !== "" || cur.length) { cur.push(val); rows.push(cur); }
    return rows;
  }

  function ingest(text) {
    var rows = parseCSV(text).filter(function (r) { return r.length && r.join("").trim() !== ""; });
    if (rows.length < 2) return;
    var head = rows[0].map(function (h) { return h.trim().toLowerCase(); });
    var ri = head.indexOf("reference"), si = head.indexOf("status"),
        oi = head.indexOf("origin"), di = head.indexOf("destination"), ti = head.indexOf("step");
    if (ri < 0) return;
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i], ref = (r[ri] || "").trim().toUpperCase();
      if (!ref) continue;
      DB[ref] = {
        status: ((si >= 0 ? r[si] : "") || "IN TRANSIT").trim(),
        origin: (oi >= 0 ? r[oi] : "").trim(),
        destination: (di >= 0 ? r[di] : "").trim(),
        step: parseInt((ti >= 0 ? r[ti] : "2"), 10) || 2
      };
    }
  }

  var ready = Promise.resolve();
  if (cfg.sheetCsvUrl) {
    ready = fetch(cfg.sheetCsvUrl, { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw 0; return r.text(); })
      .then(ingest)
      .catch(function () { /* keep demo data on any failure */ });
  }

  window.CL_ready = ready;
  window.CL_getShipment = function (ref) { return DB[(ref || "").trim().toUpperCase()] || null; };
  window.CL_defaultShipment = function () {
    return { status: "IN TRANSIT", origin: "Matadi Port Terminal", destination: "Kinshasa Warehouse 03", step: 2 };
  };
})();
