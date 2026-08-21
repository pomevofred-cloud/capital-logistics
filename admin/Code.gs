/**
 * Capital Logistics — admin backend (Google Apps Script).
 * ---------------------------------------------------------------------------
 * ONE free web app that:
 *   • serves the password-protected admin dashboard (Dashboard.html)
 *   • lets an admin create / edit / delete shipment tracking rows
 *   • collects newsletter emails from the website pop-up
 *   • lets an admin view collected newsletter emails
 *
 * SECURITY
 *   • The admin password is stored in Script Properties (ADMIN_PASSWORD),
 *     never in this code and never in the website. It is checked on every
 *     write. Requests run over HTTPS on Google's servers.
 *   • The dashboard talks to these functions through google.script.run
 *     (HtmlService), so there are no exposed API keys or CORS holes.
 *
 * The website keeps reading shipment data from the published CSV of the
 * "Tracking" tab, so edits made here appear on the site automatically.
 * ---------------------------------------------------------------------------
 */

var TRACK_SHEET = 'Tracking';    // headers: reference | status | origin | destination | step
var NEWS_SHEET = 'Newsletter';   // headers: email | date

/* ------------------------------- Web entry points ------------------------ */

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Dashboard')
    .setTitle('Capital Logistics — Admin')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    // allow the dashboard to be embedded at your own domain (e.g. clcongo.com/admin)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Public POST: only the newsletter sign-up from the website pop-up.
function doPost(e) {
  var p = (e && e.parameter) || {};
  if ((p.action || '') === 'newsletter') {
    var email = sanitizeEmail_(p.email);
    if (email) appendRow_(NEWS_SHEET, [email, new Date()]);
    return ContentService.createTextOutput('ok');
  }
  return ContentService.createTextOutput('ignored');
}

/* ----------------------- Server API (called via google.script.run) -------- */

function apiLogin(password) {
  return { ok: checkAuth_(password) };
}

function apiListShipments(password) {
  if (!checkAuth_(password)) return { ok: false, error: 'unauthorized' };
  return { ok: true, rows: readTracking_() };
}

function apiSaveShipment(password, row) {
  if (!checkAuth_(password)) return { ok: false, error: 'unauthorized' };
  var ref = sanitizeText_(row.reference).toUpperCase();
  if (!ref) return { ok: false, error: 'Reference is required.' };
  var clean = [
    ref,
    sanitizeText_(row.status),
    sanitizeText_(row.origin),
    sanitizeText_(row.destination),
    clampStep_(row.step)
  ];
  var sh = sheet_(TRACK_SHEET);
  var data = sh.getDataRange().getValues();
  var found = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase() === ref) { found = i + 1; break; }
  }
  if (found > 0) sh.getRange(found, 1, 1, 5).setValues([clean]);
  else sh.appendRow(clean);
  return { ok: true, rows: readTracking_() };
}

function apiDeleteShipment(password, reference) {
  if (!checkAuth_(password)) return { ok: false, error: 'unauthorized' };
  var ref = sanitizeText_(reference).toUpperCase();
  var sh = sheet_(TRACK_SHEET);
  var data = sh.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]).toUpperCase() === ref) sh.deleteRow(i + 1);
  }
  return { ok: true, rows: readTracking_() };
}

function apiListNewsletter(password) {
  if (!checkAuth_(password)) return { ok: false, error: 'unauthorized' };
  var sh = sheet_(NEWS_SHEET);
  var data = sh.getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    rows.push({ email: String(data[i][0]), date: data[i][1] ? String(data[i][1]) : '' });
  }
  return { ok: true, rows: rows.reverse() };
}

/* --------------------------------- Helpers -------------------------------- */

function checkAuth_(pw) {
  var real = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
  return !!(real && pw && String(pw) === String(real));
}

function sheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (name === TRACK_SHEET) sh.appendRow(['reference', 'status', 'origin', 'destination', 'step']);
    if (name === NEWS_SHEET) sh.appendRow(['email', 'date']);
  }
  return sh;
}

function appendRow_(name, values) { sheet_(name).appendRow(values); }

function readTracking_() {
  var sh = sheet_(TRACK_SHEET);
  var data = sh.getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    rows.push({
      reference: String(data[i][0]),
      status: String(data[i][1] || ''),
      origin: String(data[i][2] || ''),
      destination: String(data[i][3] || ''),
      step: clampStep_(data[i][4])
    });
  }
  return rows;
}

function sanitizeText_(v) { return String(v == null ? '' : v).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 140); }
function sanitizeEmail_(v) { var s = String(v == null ? '' : v).trim().slice(0, 160); return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) ? s : ''; }
function clampStep_(v) { var n = parseInt(v, 10); if (isNaN(n)) n = 1; return Math.max(1, Math.min(5, n)); }
