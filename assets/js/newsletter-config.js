/* ═══════════════════════════════════════════════════════════════════════
   Capital Logistics — Newsletter sign-up destination
   ───────────────────────────────────────────────────────────────────────
   Where submitted emails are sent. Leave blank to collect nothing (the pop-up
   still validates and shows a thank-you). To store emails with no server:

   1. Create a Google Sheet with a header row: email | date
   2. Extensions ▸ Apps Script, paste:

        function doPost(e){
          var s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
          s.appendRow([e.parameter.email, new Date()]);
          return ContentService.createTextOutput('ok');
        }

   3. Deploy ▸ New deployment ▸ Web app ▸ Execute as: Me ▸
      Who has access: Anyone. Copy the /exec URL and paste it below.

   The email is sent as a POST (application/x-www-form-urlencoded, field "email").
   ═══════════════════════════════════════════════════════════════════════ */
window.CL_NEWSLETTER = {
  endpoint: ""
};
