-- ════════════════════════════════════════════════════════════════════════
--  Capital Logistics — Tracking CMS database
--  Run ONCE in your Supabase project:  SQL Editor ▸ New query ▸ paste ▸ Run.
--  Safe to re-run (everything is guarded with IF NOT EXISTS / drop-recreate).
-- ════════════════════════════════════════════════════════════════════════

-- 1) TABLES ───────────────────────────────────────────────────────────────
create table if not exists public.shipments (
  id           uuid primary key default gen_random_uuid(),
  reference    text        not null unique,
  status       text        not null default 'IN TRANSIT',
  origin       text        default '',
  destination  text        default '',
  step         smallint    not null default 2 check (step between 1 and 5),
  location     text        default '',
  eta          date,
  note         text        default '',
  archived     boolean     not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists shipments_reference_idx on public.shipments (reference);
create index if not exists shipments_updated_idx   on public.shipments (updated_at desc);

create table if not exists public.newsletter (
  id         uuid        primary key default gen_random_uuid(),
  email      text        not null,
  created_at timestamptz not null default now()
);

-- keep updated_at fresh on every edit
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists shipments_touch on public.shipments;
create trigger shipments_touch before update on public.shipments
  for each row execute function public.touch_updated_at();

-- 2) ROW-LEVEL SECURITY ────────────────────────────────────────────────────
--    Nothing is readable or writable except exactly what these policies allow.
alter table public.shipments  enable row level security;
alter table public.newsletter enable row level security;

-- Public visitors (anon key on the website) may READ only live shipments.
drop policy if exists shipments_public_read on public.shipments;
create policy shipments_public_read on public.shipments
  for select to anon using (archived = false);

-- Signed-in admins (dashboard login) may do everything.
drop policy if exists shipments_admin_all on public.shipments;
create policy shipments_admin_all on public.shipments
  for all to authenticated using (true) with check (true);

-- Anyone may subscribe to the newsletter (insert only) …
drop policy if exists newsletter_public_insert on public.newsletter;
create policy newsletter_public_insert on public.newsletter
  for insert to anon with check (true);

-- … but only admins may read / manage the list.
drop policy if exists newsletter_admin_all on public.newsletter;
create policy newsletter_admin_all on public.newsletter
  for all to authenticated using (true) with check (true);

-- 3) OPTIONAL SAMPLE DATA (delete anytime from the dashboard) ───────────────
insert into public.shipments (reference,status,origin,destination,step,location) values
  ('CL-2024-001234','IN TRANSIT','Matadi Port Terminal','Kinshasa Warehouse 03',2,'N1 corridor'),
  ('CL-2024-001235','AT CUSTOMS','Boma Port','Kikwit Depot 01',3,'Kinshasa customs'),
  ('CL-2024-001236','DELIVERED','Kinshasa Hub','Tshikapa Terminal',5,'Signed — POD on file')
on conflict (reference) do nothing;
