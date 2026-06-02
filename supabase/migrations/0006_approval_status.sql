-- Approval gating for beta. New signups land as 'pending' and are invisible
-- to other members until an admin approves them. Run after 0005.
--
-- Pending users CAN finish onboarding, edit their profile, view the dashboard,
-- and browse other members (so they preview the value). They CANNOT appear in
-- anyone else's browse/suggestions, and they CANNOT send match requests.
--
-- All existing onboarded profiles are migrated to 'approved' so the change is
-- non-disruptive for current testers. Tighten manually with:
--   update public.profiles set approval_status='pending' where ...;

do $$ begin
  create type approval_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

alter table public.profiles
  add column if not exists approval_status approval_status not null default 'pending',
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references public.profiles(id) on delete set null;

create index if not exists profiles_approval_status_idx
  on public.profiles(approval_status)
  where approval_status <> 'approved';

-- Existing onboarded users get auto-approved so the beta doesn't go dark.
update public.profiles
set approval_status = 'approved',
    approved_at = now()
where onboarded_at is not null
  and approval_status = 'pending';

-- Recreate profiles_public to filter on approval. Browse, suggestions,
-- /api/score, and intro emails all read through this view — so the change
-- propagates everywhere with no app-side query changes needed.
drop view if exists public.profiles_public;
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
  where status = 'active'
    and approval_status = 'approved';

comment on view public.profiles_public is
  'Anonymity-safe projection of profiles. Hidden columns are absent; pending and rejected users are absent. All browse/match/suggestion queries MUST read from this view.';

grant select on public.profiles_public to authenticated;
