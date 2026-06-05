-- Caps reschedules at 2 per meeting (lifetime). After hitting the cap,
-- both parties either accept the current time or the match goes cold.
-- Adds reschedule_count to meetings. Existing rows start at 0.

alter table public.meetings
  add column if not exists reschedule_count int not null default 0
    check (reschedule_count >= 0 and reschedule_count <= 10);

comment on column public.meetings.reschedule_count is
  'How many times this meeting has been rescheduled. App caps at 2; DB ceiling at 10 prevents runaway loops via raw SQL.';
