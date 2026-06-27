-- ============================================================================
-- Digital Museum — Supabase setup (guest book + supporters + admin)
-- ============================================================================
-- Run this whole script in your Supabase project:  SQL Editor → New query →
-- paste → Run. It is idempotent, so it's safe to run again.
--
-- BEFORE RUNNING: change the admin passphrase on the ONE line marked below.
-- That passphrase is something YOU invent (like a password). You then type
-- the SAME value into the in-app Admin panel (open it by typing "admin" in
-- the search bar). It is NOT the Supabase anon key.
-- ============================================================================

-- 1) Admin check — the secret lives here, in ONE place. ----------------------
--    Replace 'CHANGE-ME-to-a-strong-secret' with your own passphrase.
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select current_setting('request.headers', true)::json->>'x-admin-key'
       = 'CHANGE-ME-to-a-strong-secret';
$$;

-- 2) Guest-book comments -----------------------------------------------------
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text,
  message     text not null
);
alter table public.comments enable row level security;

drop policy if exists "comments read"   on public.comments;
drop policy if exists "comments insert" on public.comments;
drop policy if exists "comments delete" on public.comments;

create policy "comments read"   on public.comments for select using (true);
create policy "comments insert" on public.comments for insert
  with check (char_length(message) between 1 and 1000);
create policy "comments delete" on public.comments for delete
  using (public.is_admin());

-- 3) Top supporters ----------------------------------------------------------
create table if not exists public.supporters (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  note        text
);
alter table public.supporters enable row level security;

drop policy if exists "supporters read"   on public.supporters;
drop policy if exists "supporters insert" on public.supporters;
drop policy if exists "supporters delete" on public.supporters;

create policy "supporters read"   on public.supporters for select using (true);
create policy "supporters insert" on public.supporters for insert
  with check (public.is_admin());
create policy "supporters delete" on public.supporters for delete
  using (public.is_admin());

-- Done. Anyone can read comments/supporters and post a comment; only a
-- request carrying the matching x-admin-key header (i.e. the Admin panel
-- with the right passphrase) can delete comments or edit supporters.
