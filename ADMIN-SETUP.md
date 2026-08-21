# Admin dashboard — one‑time setup (free, ~15 minutes)

The website has a free admin dashboard (built on Google Apps Script + Google
Sheets). From it you can **add/edit/delete shipment tracking**, and **view
newsletter sign‑ups** — no code editing, no monthly cost, and the password
never touches the website.

Nothing here needs a server. Everything runs on your Google account over HTTPS.

---

## Step 1 — Create the Google Sheet

1. Go to <https://sheets.new> and name it e.g. **Capital Logistics — Data**.
2. Rename the first tab to **`Tracking`** and put these headers in row 1:

   | reference | status | origin | destination | step |
   |-----------|--------|--------|-------------|------|

   (Add a couple of example rows if you like — `step` is 1–5.)
3. Add a second tab named **`Newsletter`** with headers `email` and `date`.

> The dashboard will auto‑create these tabs if they’re missing, but making them
> now lets you publish the CSV in Step 4.

## Step 2 — Add the dashboard code

1. In the Sheet: **Extensions ▸ Apps Script**.
2. Delete the sample `Code.gs` content and paste the contents of
   **`admin/Code.gs`** (from this project).
3. Click the **＋** next to *Files* ▸ **HTML**, name it exactly **`Dashboard`**,
   and paste the contents of **`admin/Dashboard.html`**. Save (💾).

## Step 3 — Set the admin password

1. In Apps Script: **Project Settings (⚙) ▸ Script properties ▸ Add property**.
2. Property = **`ADMIN_PASSWORD`**, Value = a strong password of your choice. Save.

   > The password lives here on Google’s server only. It is never in the website
   > or the code.

## Step 4 — Deploy the dashboard

1. **Deploy ▸ New deployment ▸ Select type: Web app**.
2. Description: `Admin`. **Execute as: Me**. **Who has access: Anyone**.
3. **Deploy**, authorise when asked, and **copy the Web app URL** (ends in
   `/exec`). Open it — you’ll see the sign‑in screen. That URL **is** your
   dashboard; bookmark it.

## Step 5 — Connect the website

**Newsletter sign‑ups** → open `assets/js/newsletter-config.js` and paste the
`/exec` URL between the quotes:

```js
window.CL_NEWSLETTER = { endpoint: "https://script.google.com/macros/s/……/exec" };
```

**Live tracking** → publish the Tracking tab as CSV so the site can read it:
File ▸ Share ▸ **Publish to web** ▸ choose the **Tracking** sheet ▸ **CSV** ▸
Publish. Paste that `…output=csv` URL into `assets/js/tracking-config.js`:

```js
window.CL_TRACKING = { sheetCsvUrl: "https://docs.google.com/……/pub?gid=0&single=true&output=csv" };
```

Commit those two one‑line changes (or send them to whoever manages the repo).

---

## Access — same domain as the website

Once Step 5 is done, the dashboard is available **on your own site** at
**`/admin`** — e.g. `https://…github.io/capital-logistics/admin/` now, and
`https://clcongo.com/admin/` after you connect the real domain. That page simply
embeds the Apps Script dashboard, so the address bar stays on your domain.
(You can also open the raw `/exec` URL directly if you ever need to.)

## Custom domain — smooth transition

The setup is built to move to your real domain with **zero dashboard changes**:

- The website (and its `/admin` page) is served by GitHub Pages. To use a custom
  domain: repo **Settings ▸ Pages ▸ Custom domain**, enter `clcongo.com`, and add
  the DNS records GitHub shows (a `CNAME`/`A` records at your registrar). GitHub
  adds a `CNAME` file and provisions HTTPS automatically.
- Nothing in the site hard‑codes the `github.io` address — links are relative and
  the tracking/newsletter/admin endpoints are the Google URLs you pasted in
  Step 5. So when the domain switches, `clcongo.com/admin` just works.
- The Apps Script backend is independent of the website's domain, so it never
  needs to change.

## Using it day‑to‑day

- Open **`yourdomain.com/admin`** (or the `/exec` URL) and sign in with the password.
- **Shipments** tab: add or edit a shipment (reference, status, origin,
  destination, stage 1–5) → **Save**. It appears on the site’s tracker within a
  few minutes (Google refreshes the published CSV).
- **Newsletter** tab: see everyone who signed up, newest first.

## Security notes

- The password is stored in Script Properties (server‑side) and checked on every
  save/delete. Nothing sensitive is exposed in the website.
- The dashboard talks to the server through `google.script.run`, so there are no
  API keys or database credentials anywhere in the frontend.
- Inputs are validated and sanitised on the server before they’re written.
- To rotate the password, change the `ADMIN_PASSWORD` script property. To revoke
  access entirely, delete the deployment.

## Want testimonials & FAQs editable here too?
That’s a natural next step. It needs bilingual (EN/FR) fields so the language
switcher stays consistent — say the word and I’ll add those sections to this
same dashboard.
