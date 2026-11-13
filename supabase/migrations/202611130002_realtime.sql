-- Safe when Realtime is not installed (e.g. isolated SQL tests).
do $$ begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime') then
    alter publication supabase_realtime add table public.daily_checkins;
  end if;
end $$;
