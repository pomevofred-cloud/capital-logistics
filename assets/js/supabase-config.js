/* ═══════════════════════════════════════════════════════════════════════
   Capital Logistics — backend connection (Supabase)
   ───────────────────────────────────────────────────────────────────────
   These two values are SAFE to be public. `anonKey` holds the Supabase
   "publishable" key, which can only do what the database's Row-Level-Security
   rules allow: the public website READS live shipments and ADDS a newsletter
   email — nothing else. Admin writes require a signed-in session (login).
   The secret ("service_role" / sb_secret_…) key is NEVER placed in this file.
   ═══════════════════════════════════════════════════════════════════════ */
window.CL_SUPABASE = {
  url: "https://coemnizqhtgtlbobyrdu.supabase.co",
  anonKey: "sb_publishable_ssHZzPxG-rhqMwjtmnvEEA_aJ_920Tk"
};
