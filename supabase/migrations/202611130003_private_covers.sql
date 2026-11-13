begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('winter-covers','winter-covers',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
create policy winter_cover_read on storage.objects for select to authenticated
using (bucket_id='winter-covers' and name=(select auth.uid())::text || '/cover');
create policy winter_cover_insert on storage.objects for insert to authenticated
with check (bucket_id='winter-covers' and name=(select auth.uid())::text || '/cover');
create policy winter_cover_update on storage.objects for update to authenticated
using (bucket_id='winter-covers' and name=(select auth.uid())::text || '/cover')
with check (bucket_id='winter-covers' and name=(select auth.uid())::text || '/cover');
create policy winter_cover_delete on storage.objects for delete to authenticated
using (bucket_id='winter-covers' and name=(select auth.uid())::text || '/cover');
commit;
