# Capital Logistics — website

Static marketing website for **Capital Logistics SARL** (DR Congo) — cargo delivery
across the DRC. Plain HTML / CSS / JS with local fonts and images — no build step.

## Pages
`index.html` · `services.html` · `about.html` · `coverage.html` · `track.html` · `contact.html`

## Local preview
```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Live deployment (GitHub Pages)
This repo is served with GitHub Pages from the `main` branch (root).
Any push to `main` redeploys the live site automatically.

## Tracking data (Google Sheet)
Shipment tracking can be managed from a Google Sheet — no code changes.
See **[TRACKING-SETUP.md](TRACKING-SETUP.md)** and edit `assets/js/tracking-config.js`.
