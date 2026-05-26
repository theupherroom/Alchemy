-- Notification preferences per user.
-- Defaults to fully opted-in so existing users aren't silenced. Each column is
-- a single boolean rather than a JSONB blob so PostgREST and policies stay simple.
-- Run after 0003_helpers.sql.

alter table public.profiles
  add column if not exists notify_match_request boolean not null default true,
  add column if not exists notify_match_accepted boolean not null default true,
  add column if not exists notify_meeting_scheduled boolean not null default true,
  add column if not exists notify_weekly_digest boolean not null default true;

-- Grant SELECT on these columns to authenticated users so they show up in
-- profiles_self. (Updates go through the existing profiles_self_update policy.)
grant select (
  notify_match_request,
  notify_match_accepted,
  notify_meeting_scheduled,
  notify_weekly_digest
) on public.profiles to authenticated;

grant update (
  notify_match_request,
  notify_match_accepted,
  notify_meeting_scheduled,
  notify_weekly_digest
) on public.profiles to authenticated;
