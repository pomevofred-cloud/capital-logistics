/* ═══════════════════════════════════════════════════════════════════════
   Capital Logistics — backend connection (Supabase)
   ───────────────────────────────────────────────────────────────────────
   Fill in these two values ONCE, after creating your free Supabase project.
   Find them in Supabase:  Project Settings ▸ API
     • url      → "Project URL"        (e.g. https://abcdefgh.supabase.co)
     • anonKey  → "anon" / "public" API key

   Both are SAFE to expose publicly. The anon key can only do what the
   database's Row-Level-Security rules allow: the public website can READ
   live shipments and ADD a newsletter email — nothing more. The admin
   password and the secret "service_role" key are NEVER placed in this file.
   Leave the values blank to run the site on built-in demo tracking data.
   ═══════════════════════════════════════════════════════════════════════ */
window.CL_SUPABASE = {
  url: "",
  anonKey: ""
};
