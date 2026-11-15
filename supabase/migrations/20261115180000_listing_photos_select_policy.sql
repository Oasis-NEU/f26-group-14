-- DATA-17: let sellers see their own files in the listing-photos bucket.
--
-- Storage's remove() only deletes files the user is allowed to SELECT. listing-photos had insert,
-- update, and delete policies but no select policy, so remove() found nothing, deleted nothing, and
-- still answered "no error". Deleted or replaced listings left their photos behind.
--
-- This doesn't change who can view photos: the bucket is public, so photo links still work for
-- everyone, guests included. It only lets an owner find (and so delete) the files in their own folder
-- through the API. Same shape as "Users can view their own avatar files" on the avatars bucket.
create policy "Users can view their own photo files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'listing-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
