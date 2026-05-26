-- Alchemy initial schema
-- Run in Supabase SQL Editor in order: 0001 → 0002 → 0003.
-- Idempotent: safe to re-run.

create extension if not exists "pgcrypto";

-- ---------- Enums ----------

do $$ begin
  create type profile_status as enum ('active', 'suspended', 'deleted');
exception when duplicate_object then null; end $$;

do $$ begin
  create type profile_sector as enum (
    'health', 'education', 'tech', 'nonprofit', 'retail',
    'social_impact', 'finance', 'arts', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type profile_org_type as enum (
    'for_profit', 'nonprofit', 'social_enterprise', 'cooperative', 'llc', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type profile_stage as enum (
    'solo', 'early_1_5', 'growth_6_20', 'established_20_plus'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type profile_partnership_type as enum (
    'vendor', 'co_program', 'referral', 'sponsorship', 'advisory', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type profile_geo_reach as enum (
    'local', 'regional', 'national', 'international'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type match_status as enum ('pending', 'accepted', 'declined', 'expired');
exception when duplicate_object then null; end $$;

-- ---------- profiles ----------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  alias text not null unique,
  alias_color text not null,
  alias_number int not null,

  -- VISIBLE (returned by browse / match views)
  mission_statement text not null,
  sector profile_sector not null,
  org_type profile_org_type not null,
  stage profile_stage not null,
  partnership_types profile_partnership_type[] not null default '{}',
  what_we_offer text not null,
  what_we_need text not null,
  geographic_reach profile_geo_reach not null,
  impact_statement text,
  region text,                                   -- city / state / country for geo filtering
  timezone text not null default 'UTC',          -- IANA tz, used for scheduling

  -- HIDDEN (never returned by browse / match endpoints; only post-meeting reveal)
  full_name text not null,
  org_name text not null,
  profile_photo_url text,
  website text,
  social_links jsonb,
  personal_email text not null,
  years_in_operation int,
  credentials text,

  -- system
  flag_count int not null default 0,
  status profile_status not null default 'active',
  calendar_connected boolean not null default false,
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_status_idx on public.profiles(status);
create index if not exists profiles_sector_idx on public.profiles(sector);
create index if not exists profiles_stage_idx on public.profiles(stage);
create index if not exists profiles_geo_idx on public.profiles(geographic_reach);

-- ---------- matches ----------

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  status match_status not null default 'pending',
  score int check (score between 0 and 100),
  rationale text,
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (requester_id, recipient_id),
  check (requester_id <> recipient_id)
);

create index if not exists matches_requester_idx on public.matches(requester_id);
create index if not exists matches_recipient_idx on public.matches(recipient_id);
create index if not exists matches_status_idx on public.matches(status);

-- ---------- meetings ----------

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.matches(id) on delete cascade,
  google_event_id_requester text,
  google_event_id_recipient text,
  meet_link text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists meetings_starts_at_idx on public.meetings(starts_at);

-- ---------- flags ----------

create table if not exists public.flags (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_id uuid not null references public.profiles(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  check (reporter_id <> reported_id)
);

create index if not exists flags_reported_idx on public.flags(reported_id);

-- ---------- google_oauth_tokens ----------

create table if not exists public.google_oauth_tokens (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  scope text not null,
  updated_at timestamptz not null default now()
);

-- ---------- suggestions ----------

create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  for_user uuid not null references public.profiles(id) on delete cascade,
  candidate uuid not null references public.profiles(id) on delete cascade,
  score int not null check (score between 0 and 100),
  rationale text not null,
  shown boolean not null default false,
  dismissed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (for_user, candidate),
  check (for_user <> candidate)
);

create index if not exists suggestions_for_user_idx on public.suggestions(for_user, score desc);

-- ---------- match score cache (24h cache per pair, AI feature 1) ----------

create table if not exists public.match_score_cache (
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  score int not null check (score between 0 and 100),
  rationale text not null,
  computed_at timestamptz not null default now(),
  primary key (user_a, user_b),
  check (user_a < user_b)            -- canonical ordering: smaller uuid first
);

create index if not exists match_score_cache_computed_idx on public.match_score_cache(computed_at);

-- ---------- AI call log (monitoring) ----------

create table if not exists public.ai_call_log (
  id uuid primary key default gen_random_uuid(),
  feature text not null,                                 -- 'score' | 'suggest' | 'intro_email'
  user_id uuid references public.profiles(id) on delete set null,
  model text not null,
  input_tokens int,
  output_tokens int,
  cost_usd numeric(10, 6),
  latency_ms int,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists ai_call_log_feature_idx on public.ai_call_log(feature, created_at desc);

-- ---------- notifications (in-app) ----------

do $$ begin
  create type notification_kind as enum (
    'match_request', 'match_accepted', 'match_declined',
    'meeting_scheduled', 'flag_warning', 'flag_final_warning', 'calendar_disconnected'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind notification_kind not null,
  match_id uuid references public.matches(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_unread_idx
  on public.notifications(user_id, created_at desc)
  where read_at is null;

-- ---------- updated_at trigger ----------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists google_oauth_set_updated_at on public.google_oauth_tokens;
create trigger google_oauth_set_updated_at
  before update on public.google_oauth_tokens
  for each row execute function public.set_updated_at();
