begin;
create table public.todos (
 id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade,
 title text not null check(length(trim(title)) between 1 and 200),
 completed boolean not null default false, archived boolean not null default false,
 revision integer not null default 1, created_at timestamptz not null default now()
);
create table public.xp_events (
 user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in ('checkin','todo')), source text not null,
 points integer not null check(points in (10,20)), created_at timestamptz not null default now(),
 primary key(user_id,kind,source)
);
alter table public.todos enable row level security;
alter table public.xp_events enable row level security;
create policy todos_owner on public.todos for select to authenticated using(user_id=auth.uid());
create policy xp_owner on public.xp_events for select to authenticated using(user_id=auth.uid());
revoke all on public.todos,public.xp_events from anon,authenticated;
grant select on public.todos,public.xp_events to authenticated;
create function public.reward_checkin() returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.xp_events(user_id,kind,source,points) values(new.user_id,'checkin',new.day::text,10) on conflict do nothing;
 return new;
end $$;
revoke all on function public.reward_checkin() from public;
create trigger checkin_xp after insert on public.daily_checkins for each row execute function public.reward_checkin();
insert into public.xp_events(user_id,kind,source,points)
 select user_id,'checkin',day::text,10 from public.daily_checkins on conflict do nothing;
create function public.save_todo(p_id uuid,p_revision integer,p_action text,p_title text default '')
returns public.todos language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid(); t public.todos;
begin
 if u is null then raise exception 'unauthorized'; end if;
 if p_id is null then raise exception 'missing id'; end if;
 if p_action='create' then
  insert into public.todos(id,user_id,title) values(p_id,u,trim(p_title)) on conflict(id) do nothing;
  select * into t from public.todos where id=p_id and user_id=u;
  if not found then raise exception 'not found'; end if;
  return t;
 end if;
 select * into t from public.todos where id=p_id and user_id=u for update;
 if not found then raise exception 'not found'; end if;
 if t.revision is distinct from p_revision then raise exception 'revision conflict'; end if;
 if p_action not in ('complete','reopen','archive','restore') or p_action is null then raise exception 'invalid action'; end if;
 update public.todos set
 completed=case when p_action='complete' then true when p_action='reopen' then false else completed end,
 archived=case when p_action='archive' then true when p_action='restore' then false else archived end,
 revision=revision+1 where id=p_id returning * into t;
 if p_action='complete' then
  insert into public.xp_events(user_id,kind,source,points) values(u,'todo',p_id::text,20) on conflict do nothing;
 end if;
 return t;
end $$;
revoke all on function public.save_todo(uuid,integer,text,text) from public;
grant execute on function public.save_todo(uuid,integer,text,text) to authenticated;
commit;
