# Capital Logistics — Tracking CMS setup

The website tracking is powered by a real database + login (Supabase). This is
a **one-time, ~15-minute setup**. After it's done, the client just logs in at
`yourdomain/admin`, adds or edits a shipment, clicks **Save & publish**, and it
appears instantly on the public tracking page. No code, no spreadsheets.

---

## What you're setting up

| Piece | Where it lives |
|---|---|
| Database (shipments + newsletter) | Supabase (free) |
| Admin login (email + password) | Supabase Auth — password hashed on their server |
| Admin dashboard (the CMS) | `yourdomain/admin` (already in this site) |
| Public tracking page | `yourdomain/track.html` (already in this site) |

**Nothing secret is stored in the website code.** The only key the site holds is
the Supabase *anon/public* key, which by design can only do what the database's
Row-Level-Security rules allow: read live shipments, and add a newsletter email.

---

## Steps

### 1. Create a free Supabase project
1. Go to **https://supabase.com** → sign up (free) → **New project**.
2. Name it `capital-logistics`, set a **database password** (save it somewhere;
   you won't need it day-to-day), pick the closest **region**, and create it.
3. Wait ~2 minutes for it to finish provisioning.

### 2. Create the database
1. In the project: left sidebar → **SQL Editor** → **New query**.
2. Open **`admin/supabase-schema.sql`** from this repo, copy all of it, paste,
   and click **Run**. This creates the tables, the security rules, and three
   sample shipments.

### 3. Create the admin login
1. Left sidebar → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Email: the client's address (e.g. `admin@clcongo.com`).
   Password: `CL-Congo022` (temporary — change it later from this same screen).
3. Turn **Auto Confirm User** ON, then **Create user**.

### 4. Get the two connection values
1. Left sidebar → **Project Settings** (gear) → **API**.
2. Copy the **Project URL** (e.g. `https://abcdefgh.supabase.co`).
3. Copy the **`anon` `public`** API key.

### 5. Connect the website
Paste those two values into **`assets/js/supabase-config.js`**:

```js
window.CL_SUPABASE = {
  url: "https://abcdefgh.supabase.co",
  anonKey: "eyJhbGciOi...the anon public key..."
};
```

Commit + deploy. Done — open **`yourdomain/admin`**, sign in with the email and
`CL-Congo022`, and manage tracking.

---

## Day-to-day use

- **Add a shipment:** `/admin` → **+ New shipment** → fill in the tracking number,
  status, stage, route → **Save & publish**.
- **Update progress:** click ✎ on a row → change status/stage/location → save.
- **Hide a finished/cancelled one:** use **Archive** (reversible). **Delete** is
  permanent.
- **Search:** type any part of a reference, origin, or destination.
- **Newsletter:** the *Newsletter* tab lists everyone who subscribed on the site.

## Security notes

- The admin password is hashed by Supabase (bcrypt) and is **never** in the code.
- Change the password anytime: **Authentication → Users →** the user → reset.
- The **`service_role`** key in Supabase settings is a master key — never put it
  in the website or share it. The site only ever uses the *anon* key.
- Custom domain: nothing changes. The site talks to `*.supabase.co` regardless of
  the domain it's served from, so it keeps working after you point your own domain
  at the site.
