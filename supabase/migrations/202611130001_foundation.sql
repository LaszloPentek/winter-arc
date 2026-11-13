begin;
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  timezone text not null default 'Europe/Budapest' check (timezone = 'Europe/Budapest'),
  created_at timestamptz not null default now()
);
create table public.challenges (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null, name text not null, starts_on date not null, ends_on date not null,
  completed_at timestamptz, created_at timestamptz not null default now(),
  unique(user_id,slug), check(ends_on >= starts_on)
);
create table public.baselines (
  user_id uuid not null references auth.users(id) on delete cascade, day date not null,
  mood smallint not null check(mood between 1 and 10), stress smallint not null check(stress between 1 and 10),
  sleep smallint not null check(sleep between 1 and 10), focus smallint not null check(focus between 1 and 10),
  energy smallint check(energy between 1 and 10), motivation smallint check(motivation between 1 and 10),
  created_at timestamptz not null default now(), primary key(user_id,day)
);
create table public.daily_checkins (
  user_id uuid not null references auth.users(id) on delete cascade, day date not null,
  mood smallint not null check(mood between 1 and 10), stress smallint not null check(stress between 1 and 10),
  sleep smallint not null check(sleep between 1 and 10), focus smallint not null check(focus between 1 and 10),
  energy smallint check(energy between 1 and 10), motivation smallint check(motivation between 1 and 10),
  note text not null default '' check(length(note) <= 4000),
  shift text not null check(shift in ('morning','afternoon','rest','other')),
  sleep_hours numeric check(sleep_hours between 0 and 24), rest_day boolean not null default false,
  revision integer not null default 1 check(revision > 0), created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), primary key(user_id,day)
);
create table public.checkin_versions (
  user_id uuid not null references auth.users(id) on delete cascade, day date not null, revision integer not null,
  data jsonb not null, created_at timestamptz not null default now(), primary key(user_id,day,revision)
);
create table public.sync_operations (
  user_id uuid not null references auth.users(id) on delete cascade, operation_id uuid not null,
  result jsonb not null, created_at timestamptz not null default now(), primary key(user_id,operation_id)
);

-- Reads are owner-scoped; writes must use the checked transactional RPCs.
do $$ declare t text; begin
  foreach t in array array['profiles','challenges','baselines','daily_checkins','checkin_versions','sync_operations'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy owner_read on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t);
    execute format('revoke all on public.%I from anon, authenticated',t);
    execute format('grant select on public.%I to authenticated',t);
  end loop;
end $$;

create function public.initialize_winter_arc() returns void language plpgsql security definer set search_path = '' as $$
declare u uuid := auth.uid(); begin
  if u is null then raise exception 'Authentication required' using errcode='42501'; end if;
  insert into public.profiles(user_id) values(u) on conflict do nothing;
  insert into public.challenges(user_id,slug,name,starts_on,ends_on)
    values(u,'winter-arc-2026','Winter Arc — The Quiet Season','2026-11-13','2026-12-31') on conflict do nothing;
  insert into public.baselines(user_id,day,mood,stress,sleep,focus,energy,motivation)
    values(u,'2026-11-12',4,7,7,5,null,null) on conflict do nothing;
end $$;

create function public.save_checkin(p_operation uuid, p_expected integer, p_data jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  u uuid := auth.uid(); d date; previous public.daily_checkins; saved public.daily_checkins; result jsonb; field text;
begin
  if u is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_operation is null or p_expected is null or p_expected < 0 or p_data is null then raise exception 'Invalid request'; end if;
  if jsonb_typeof(p_data) <> 'object' or not (p_data ?& array['day','mood','stress','sleep','focus','energy','motivation','note','shift','sleep_hours','rest_day'])
    or (p_data - array['day','mood','stress','sleep','focus','energy','motivation','note','shift','sleep_hours','rest_day']) <> '{}'::jsonb then raise exception 'Invalid fields'; end if;
  if (p_data->>'day') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Invalid day'; end if;
  d := (p_data->>'day')::date;
  if d > (now() at time zone 'Europe/Budapest')::date then raise exception 'Future check-in not allowed'; end if;
  foreach field in array array['mood','stress','sleep','focus','energy','motivation'] loop
    if p_data->field <> 'null'::jsonb and (jsonb_typeof(p_data->field) <> 'number' or (p_data->>field) !~ '^([1-9]|10)$') then raise exception 'Invalid score'; end if;
  end loop;
  if jsonb_typeof(p_data->'note') <> 'string' or jsonb_typeof(p_data->'rest_day') <> 'boolean' then raise exception 'Invalid field type'; end if;
  -- One transaction per owner also serializes retries with the same operation ID.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(u::text,0));
  select o.result into result from public.sync_operations o where o.user_id=u and o.operation_id=p_operation;
  if found then return result; end if;
  select * into previous from public.daily_checkins where user_id=u and day=d for update;
  if coalesce(previous.revision,0) <> p_expected then
    return jsonb_build_object('status','conflict','row',to_jsonb(previous));
  end if;
  if previous.revision is not null then
    insert into public.checkin_versions(user_id,day,revision,data) values(u,d,previous.revision,to_jsonb(previous)) on conflict do nothing;
  end if;
  insert into public.daily_checkins(user_id,day,mood,stress,sleep,focus,energy,motivation,note,shift,sleep_hours,rest_day,revision)
  values(u,d,(p_data->>'mood')::smallint,(p_data->>'stress')::smallint,(p_data->>'sleep')::smallint,(p_data->>'focus')::smallint,
    (p_data->>'energy')::smallint,(p_data->>'motivation')::smallint,p_data->>'note',p_data->>'shift',
    (p_data->>'sleep_hours')::numeric,(p_data->>'rest_day')::boolean,1)
  on conflict(user_id,day) do update set
    mood=excluded.mood,stress=excluded.stress,sleep=excluded.sleep,focus=excluded.focus,energy=excluded.energy,motivation=excluded.motivation,
    note=excluded.note,shift=excluded.shift,sleep_hours=excluded.sleep_hours,rest_day=excluded.rest_day,
    revision=public.daily_checkins.revision+1,updated_at=clock_timestamp()
  returning * into saved;
  result := jsonb_build_object('status','saved','row',to_jsonb(saved));
  insert into public.sync_operations(user_id,operation_id,result) values(u,p_operation,result);
  return result;
end $$;
revoke all on function public.initialize_winter_arc() from public,anon;
revoke all on function public.save_checkin(uuid,integer,jsonb) from public,anon;
grant execute on function public.initialize_winter_arc() to authenticated;
grant execute on function public.save_checkin(uuid,integer,jsonb) to authenticated;
commit;
