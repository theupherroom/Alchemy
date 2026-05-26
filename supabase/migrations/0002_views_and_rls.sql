-- Alchemy RLS + safe views
-- Run after 0001_schema.sql.
--
-- Design notes for anonymity (CLAUDE.md §2.3):
--   - Browse / match / suggestion endpoints read `profiles_public` ONLY.
--     This view exposes visible columns of active profiles. Hidden columns
--     (full_name, org_name, profile_photo_url, website, social_links,
--     personal_email, years_in_operation, credentials) are absent.
--   - A user reads their OWN full row via `profiles_self`, a security_definer
--     view filtered to `auth.uid() = id`. Other users' hidden columns are
--     unreachable through this view because the WHERE clause runs first.
--   - Direct SELECT on the base table `public.profiles` is not granted to
--     anon/authenticated. RLS plus revoked grants give two layers of defense.
--   - Server-side code uses the service role key (bypasses RLS) for matching
--     logic, calendar scheduling, and email — and routes responses through
--     the appropriate view shape before returning to the client.

-- ---------- Lock the base table down ----------

revoke all on public.profiles from anon, authenticated, public;

-- Authenticated users still need INSERT and UPDATE on their own row.
grant insert, update on public.profiles to authenticated;

-- ---------- profiles_public: anonymity-safe projection ----------

create or replace view public.profiles_public
with (security_invoker = false, security_barrier = true)
as
  select
    id,
    alias,
    alias_color,
    alias_number,
    mission_statement,
    sector,
    org_type,
    stage,
    partnership_types,
    what_we_offer,
    what_we_need,
    geographic_reach,
    region,
    impact_statement,
    created_at
  from public.profiles
  where status = 'active';

comment on view public.profiles_public is
  'Anonymity-safe projection of profiles. Hidden columns (full_name, org_name, personal_email, website, photo, social_links, credentials, years_in_operation) are intentionally absent. All browse/match/suggestion queries MUST read from this view, never from public.profiles.';

grant select on public.profiles_public to authenticated;

-- ---------- profiles_self: full row, self only ----------

create or replace view public.profiles_self
with (security_invoker = false, security_barrier = true)
as
  select *
  from public.profiles
  where id = auth.uid();

comment on view public.profiles_self is
  'Full profile row for the currently-authenticated user. security_definer view filtered on auth.uid() — other users hidden columns are unreachable.';

grant select on public.profiles_self to authenticated;

-- ---------- Enable RLS on every table ----------

alter table public.profiles            enable row level security;
alter table public.matches             enable row level security;
alter table public.meetings            enable row level security;
alter table public.flags               enable row level security;
alter table public.google_oauth_tokens enable row level security;
alter table public.suggestions         enable row level security;
alter table public.match_score_cache   enable row level security;
alter table public.ai_call_log         enable row level security;
alter table public.notifications       enable row level security;

-- ---------- profiles policies ----------
-- INSERT: a user can only create their own profile row.
-- UPDATE: a user can only update their own profile row.
-- SELECT: no client policy — clients read via profiles_public / profiles_self.

drop policy if exists profiles_self_insert on public.profiles;
create policy profiles_self_insert on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------- matches policies ----------

drop policy if exists matches_party_select on public.matches;
create policy matches_party_select on public.matches
  for select to authenticated
  using (auth.uid() = requester_id or auth.uid() = recipient_id);

drop policy if exists matches_requester_insert on public.matches;
create policy matches_requester_insert on public.matches
  for insert to authenticated
  with check (auth.uid() = requester_id);

drop policy if exists matches_recipient_update on public.matches;
create policy matches_recipient_update on public.matches
  for update to authenticated
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

grant select, insert, update on public.matches to authenticated;

-- ---------- meetings policies ----------

drop policy if exists meetings_party_select on public.meetings;
create policy meetings_party_select on public.meetings
  for select to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_id
        and (auth.uid() = m.requester_id or auth.uid() = m.recipient_id)
    )
  );

grant select on public.meetings to authenticated;
-- INSERT / UPDATE happen server-side with the service role.

-- ---------- flags policies ----------

drop policy if exists flags_reporter_insert on public.flags;
create policy flags_reporter_insert on public.flags
  for insert to authenticated
  with check (auth.uid() = reporter_id);

drop policy if exists flags_reporter_select on public.flags;
create policy flags_reporter_select on public.flags
  for select to authenticated
  using (auth.uid() = reporter_id);

grant select, insert on public.flags to authenticated;

-- ---------- google_oauth_tokens policies ----------

drop policy if exists oauth_self_all on public.google_oauth_tokens;
create policy oauth_self_all on public.google_oauth_tokens
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.google_oauth_tokens to authenticated;

-- ---------- suggestions policies ----------

drop policy if exists suggestions_self_select on public.suggestions;
create policy suggestions_self_select on public.suggestions
  for select to authenticated
  using (auth.uid() = for_user);

drop policy if exists suggestions_self_update on public.suggestions;
create policy suggestions_self_update on public.suggestions
  for update to authenticated
  using (auth.uid() = for_user)
  with check (auth.uid() = for_user);

grant select, update on public.suggestions to authenticated;
-- INSERTs happen via server-side cron with service role.

-- ---------- match_score_cache: server-side only ----------
-- No client policies. Service role bypasses RLS.

-- ---------- ai_call_log: server-side only ----------
-- No client policies. Service role bypasses RLS.

-- ---------- notifications policies ----------

drop policy if exists notifications_self_select on public.notifications;
create policy notifications_self_select on public.notifications
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists notifications_self_update on public.notifications;
create policy notifications_self_update on public.notifications
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, update on public.notifications to authenticated;
