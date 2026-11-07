-- Only the authenticated site backend may preview drafts via the service role.
alter policy "Public read posts" on public.posts using (draft is false);
