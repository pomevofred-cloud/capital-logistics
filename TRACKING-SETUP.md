# Managing tracking info from a Google Sheet

You can update all shipment tracking on the website by editing a Google Sheet —
**no code changes, no re-deploy**. The site reads the Sheet automatically.

## 1. Create the Sheet

Make a new Google Sheet. Put these headers in **row 1** (exact, lowercase):

| reference | status | origin | destination | step |
|---|---|---|---|---|
| CL-2024-001234 | IN TRANSIT | Matadi Port Terminal | Kinshasa Warehouse 03 | 2 |
| CL-2024-001235 | AT CUSTOMS | Boma Port | Kikwit Depot 01 | 3 |
| CL-2024-001236 | DELIVERED | Kinshasa Hub | Tshikapa Terminal | 5 |

- **reference** — the tracking number customers type (e.g. `CL-2024-001234`)
- **status** — free text shown as the status chip (e.g. `IN TRANSIT`, `AT CUSTOMS`, `DELIVERED`)
- **origin** / **destination** — start and end locations
- **step** — how far along (used for the timeline on the Track page):
  `1` Picked up · `2` In transit · `3` At customs · `4` Out for delivery · `5` Delivered

Add one row per shipment. Edit any time.

## 2. Publish the Sheet as CSV

In the Sheet: **File → Share → Publish to web** → pick the sheet/tab →
choose **Comma-separated values (.csv)** → **Publish**.
Copy the URL it gives you (it ends in `output=csv`).

## 3. Connect it to the site

Open **`assets/js/tracking-config.js`** and paste your URL between the quotes:

```js
window.CL_TRACKING = {
  sheetCsvUrl: "https://docs.google.com/spreadsheets/d/e/XXXX/pub?output=csv"
};
```

Save. Done — the tracker on the Home page and the Track page now read live from your Sheet.

## Notes

- Leave `sheetCsvUrl` **blank** to use the built-in demo data (CL-2024-001234/5/6).
- If the Sheet can't be reached, the site quietly falls back to the demo data (it never breaks).
- Changes in the Sheet appear on the site on the next page load (Google may cache the CSV a few minutes).
- This is the simplest reliable setup: no server, no API key, no database.
