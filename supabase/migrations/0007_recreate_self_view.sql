-- Recreates profiles_self so it picks up columns added since 0002:
--   notify_match_request / notify_match_accepted / notify_meeting_scheduled
--   notify_weekly_digest (from 0004)
--   is_admin (from 0005)
--   approval_status / approved_at / approved_by (from 0006)
--
-- Postgres views freeze their `SELECT *` column list at creation time —
-- new table columns are NOT auto-included until the view is recreated.
-- Run this whenever you add a column to profiles that the app needs to read
-- via profiles_self.

drop view if exists public.profiles_self;

create or replace view public.profiles_self
with (security_invoker = false, security_barrier = true)
as
  select *
  from public.profiles
  where id = auth.uid();

comment on view public.profiles_self is
  'Full profile row for the currently-authenticated user. security_definer view filtered on auth.uid() — other users hidden columns are unreachable.';

grant select on public.profiles_self to authenticated;
