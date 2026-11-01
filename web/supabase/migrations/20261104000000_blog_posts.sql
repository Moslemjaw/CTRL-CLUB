-- Blog posts: anyone can read them, only admins can write them.
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  description text not null check (char_length(description) between 1 and 20000),
  images text[] not null default '{}' check (cardinality(images) <= 8),
  -- Only web links and paths inside the site, so a saved link can never run a script.
  link_url text check (char_length(link_url) <= 2000 and link_url ~ '^(https?://\S+|/([^/\\\s]\S*)?)$'),
  link_label text check (char_length(link_label) between 1 and 60),
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blog_posts_created_at_idx on public.blog_posts (created_at desc);
create index blog_posts_created_by_idx on public.blog_posts (created_by);

create trigger blog_posts_updated_at before update on public.blog_posts
  for each row execute function private.set_updated_at();

-- Access rules: created_by has no insert or update grant, so it always stays the real author.
alter table public.blog_posts enable row level security;

revoke all on public.blog_posts from anon, authenticated;

grant select on public.blog_posts to anon, authenticated;
grant delete on public.blog_posts to authenticated;
grant insert (title, description, images, link_url, link_label),
  update (title, description, images, link_url, link_label) on public.blog_posts to authenticated;

create policy "Anyone reads blog posts" on public.blog_posts
  for select to anon, authenticated using (true);
create policy "Admins create blog posts" on public.blog_posts
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update blog posts" on public.blog_posts
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete blog posts" on public.blog_posts
  for delete to authenticated using ((select private.is_admin()));

-- Blog pictures
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog-images', 'blog-images', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']);

create policy "Admins list blog images" on storage.objects
  for select to authenticated using (bucket_id = 'blog-images' and (select private.is_admin()));
create policy "Admins upload blog images" on storage.objects
  for insert to authenticated with check (bucket_id = 'blog-images' and (select private.is_admin()));
create policy "Admins update blog images" on storage.objects
  for update to authenticated using (bucket_id = 'blog-images' and (select private.is_admin()));
create policy "Admins delete blog images" on storage.objects
  for delete to authenticated using (bucket_id = 'blog-images' and (select private.is_admin()));
