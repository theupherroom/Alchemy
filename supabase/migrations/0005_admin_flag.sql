-- Adds an is_admin flag so admin access can be granted from the database
-- without redeploying. Run in Supabase SQL Editor after 0004.
--
-- Two ways to grant admin going forward:
--   1. `update public.profiles set is_admin = true where personal_email = 'foo@bar.com'`
--   2. Click "Make admin" on /admin/users/[id] from another admin's session.
--
-- The ADMIN_EMAILS env var still grants admin as a bootstrap fallback so you
-- can always recover access if the DB row gets misset.

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

comment on column public.profiles.is_admin is
  'When true, this user has admin dashboard access. ADMIN_EMAILS env var also grants access as a bootstrap fallback.';

create index if not exists profiles_is_admin_idx
  on public.profiles(is_admin)
  where is_admin = true;

-- Lock down what authenticated users can update on themselves. Without this,
-- the profiles_self_update RLS policy would let a malicious user flip their
-- own is_admin to true. We replace the broad UPDATE grant with a column list
-- that excludes is_admin, status, flag_count, calendar_connected, onboarded_at.
-- Server-side code uses the service role and bypasses these grants.

revoke update on public.profiles from authenticated;
grant update (
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
  timezone,
  full_name,
  org_name,
  profile_photo_url,
  website,
  social_links,
  personal_email,
  years_in_operation,
  credentials,
  notify_match_request,
  notify_match_accepted,
  notify_meeting_scheduled,
  notify_weekly_digest
) on public.profiles to authenticated;
