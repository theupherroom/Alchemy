-- Alchemy helper functions
-- Run after 0002_views_and_rls.sql.

-- ---------- Auto-suspend at 3 flags ----------

create or replace function public.handle_new_flag()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_count int;
begin
  update public.profiles
     set flag_count = flag_count + 1
   where id = new.reported_id
   returning flag_count into v_count;

  if v_count >= 3 then
    update public.profiles set status = 'suspended' where id = new.reported_id;
    insert into public.notifications (user_id, kind)
      values (new.reported_id, 'flag_final_warning');
  elsif v_count = 2 then
    insert into public.notifications (user_id, kind)
      values (new.reported_id, 'flag_final_warning');
  elsif v_count = 1 then
    insert into public.notifications (user_id, kind)
      values (new.reported_id, 'flag_warning');
  end if;

  return new;
end $$;

drop trigger if exists flags_on_insert on public.flags;
create trigger flags_on_insert
  after insert on public.flags
  for each row execute function public.handle_new_flag();

-- ---------- Notification on match request / response ----------

create or replace function public.handle_match_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, kind, match_id)
      values (new.recipient_id, 'match_request', new.id);
  elsif tg_op = 'UPDATE' and new.status <> old.status then
    if new.status = 'accepted' then
      insert into public.notifications (user_id, kind, match_id)
        values (new.requester_id, 'match_accepted', new.id);
    elsif new.status = 'declined' then
      insert into public.notifications (user_id, kind, match_id)
        values (new.requester_id, 'match_declined', new.id);
    end if;
  end if;
  return new;
end $$;

drop trigger if exists matches_notify on public.matches;
create trigger matches_notify
  after insert or update on public.matches
  for each row execute function public.handle_match_change();

-- ---------- Notification on meeting scheduled ----------

create or replace function public.handle_meeting_created()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_match record;
begin
  select requester_id, recipient_id into v_match
    from public.matches where id = new.match_id;

  insert into public.notifications (user_id, kind, match_id)
    values (v_match.requester_id, 'meeting_scheduled', new.match_id),
           (v_match.recipient_id, 'meeting_scheduled', new.match_id);
  return new;
end $$;

drop trigger if exists meetings_notify on public.meetings;
create trigger meetings_notify
  after insert on public.meetings
  for each row execute function public.handle_meeting_created();

-- ---------- Helper: am I onboarded? ----------

create or replace function public.is_onboarded(p_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.profiles
    where id = p_user_id and onboarded_at is not null and status = 'active'
  );
$$;
