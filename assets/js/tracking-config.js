/* ═══════════════════════════════════════════════════════════════════════
   Capital Logistics — Tracking data source
   ───────────────────────────────────────────────────────────────────────
   Manage all shipment/tracking info from a GOOGLE SHEET — no code edits.

   ONE-TIME SETUP
   1. Create a Google Sheet. Row 1 = headers (exact lowercase names):

        reference        status        origin                destination            step
        CL-2024-001234   IN TRANSIT    Matadi Port Terminal  Kinshasa Warehouse 03  2
        CL-2024-001235   AT CUSTOMS    Boma Port             Kikwit Depot 01         3
        CL-2024-001236   DELIVERED     Kinshasa Hub          Tshikapa Terminal       5

      step = which stage the shipment reached:
        1 Picked up · 2 In transit · 3 At customs · 4 Out for delivery · 5 Delivered

   2. In the Sheet:  File ▸ Share ▸ Publish to web
        → choose the sheet/tab → "Comma-separated values (.csv)" → Publish.
      Copy the URL Google gives you (it ends in "...output=csv").

   3. Paste that URL between the quotes below, and save.

   That's it. To update tracking, just edit the Sheet — the website reads it
   automatically (no re-deploy). Leave the URL blank to use the demo data.
   ═══════════════════════════════════════════════════════════════════════ */
window.CL_TRACKING = {
  sheetCsvUrl: ""
};
