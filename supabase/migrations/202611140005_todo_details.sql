begin;
alter table public.todos add column due_date date check(due_date is null or isfinite(due_date));
create function public.save_todo_details(p_id uuid,p_revision integer,p_title text,p_due_date date default null)
returns public.todos language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid(); t public.todos;
begin
 if u is null then raise exception 'unauthorized'; end if;
 if p_id is null or p_revision is null or p_revision<0 then raise exception 'invalid input'; end if;
 if p_revision=0 then
  insert into public.todos(id,user_id,title,due_date) values(p_id,u,trim(p_title),p_due_date) on conflict(id) do nothing;
  select * into t from public.todos where id=p_id and user_id=u;
  if not found then raise exception 'not found'; end if;
  return t;
 end if;
 select * into t from public.todos where id=p_id and user_id=u for update;
 if not found then raise exception 'not found'; end if;
 if t.revision<>p_revision then raise exception 'revision conflict'; end if;
 update public.todos set title=trim(p_title),due_date=p_due_date,revision=revision+1 where id=p_id returning * into t;
 return t;
end $$;
revoke all on function public.save_todo_details(uuid,integer,text,date) from public;
grant execute on function public.save_todo_details(uuid,integer,text,date) to authenticated;
commit;
