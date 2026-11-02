-- Sharing: 'team' is everyone on the team, 'selected' is the author plus chosen members, 'private' is the author only.
alter table public.notes
  add column visibility text not null default 'team' check (visibility in ('team', 'selected', 'private'));

create table public.note_shares (
  note_id uuid not null references public.notes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  primary key (note_id, user_id)
);
create index note_shares_user_id_idx on public.note_shares (user_id);

create table public.note_attachments (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 255),
  path text not null unique,
  size_bytes bigint not null check (size_bytes >= 0),
  mime_type text not null default '',
  uploaded_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index note_attachments_note_id_idx on public.note_attachments (note_id);
create index note_attachments_uploaded_by_idx on public.note_attachments (uploaded_by);

-- These read the tables directly so the access rules below don't call each other in a loop.
create function private.is_note_shared_with_me(p_note_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.note_shares s where s.note_id = p_note_id and s.user_id = auth.uid()) $$;

create function private.can_read_note(p_note_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select coalesce(private.is_team(), false) and exists (
    select 1 from public.notes n
    where n.id = p_note_id
      and (n.created_by = auth.uid() or n.visibility = 'team' or (n.visibility = 'selected' and private.is_note_shared_with_me(n.id)))
  )
$$;

create function private.can_remove_attachment(p_note_id uuid, p_uploaded_by uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select private.can_read_note(p_note_id) and (
    p_uploaded_by = auth.uid()
    or private.is_admin()
    or exists (select 1 from public.notes n where n.id = p_note_id and n.created_by = auth.uid())
  )
$$;

-- Attachment files are stored as <note id>/<file name>.
create function private.note_id_from_path(p_path text)
returns uuid language sql immutable set search_path = ''
as $$
  select case when split_part(p_path, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then split_part(p_path, '/', 1)::uuid end
$$;

create function private.can_remove_note_file(p_path text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select case
    when exists (select 1 from public.note_attachments a where a.path = p_path)
      then exists (select 1 from public.note_attachments a where a.path = p_path and private.can_remove_attachment(a.note_id, a.uploaded_by))
    else private.can_read_note(private.note_id_from_path(p_path))
  end
$$;

revoke all on function private.is_note_shared_with_me(uuid) from public;
revoke all on function private.can_read_note(uuid) from public;
revoke all on function private.can_remove_attachment(uuid, uuid) from public;
revoke all on function private.note_id_from_path(text) from public;
revoke all on function private.can_remove_note_file(text) from public;
grant execute on function private.is_note_shared_with_me(uuid) to authenticated;
grant execute on function private.can_read_note(uuid) to authenticated;
grant execute on function private.can_remove_attachment(uuid, uuid) to authenticated;
grant execute on function private.note_id_from_path(text) to authenticated;
grant execute on function private.can_remove_note_file(text) to authenticated;

-- Only a note's author can change who sees it. Leaving 'selected' clears the old list.
create function private.guard_note_visibility()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.visibility is distinct from old.visibility then
    if auth.uid() is not null and old.created_by is distinct from auth.uid() then
      raise exception 'Only the author can change who can see this note.' using errcode = '42501';
    end if;
    if new.visibility <> 'selected' then
      delete from public.note_shares where note_id = new.id;
    end if;
  end if;
  return new;
end $$;

create trigger notes_guard_visibility before update on public.notes
  for each row execute function private.guard_note_visibility();

-- Access rules: a private note is hidden from everyone but its author, including admins.
drop policy "Team reads notes" on public.notes;
drop policy "Team updates notes" on public.notes;
drop policy "Authors and admins delete notes" on public.notes;

create policy "Allowed readers read notes" on public.notes
  for select to authenticated using (
    (select private.is_team()) and (
      created_by = (select auth.uid()) or visibility = 'team'
      or (visibility = 'selected' and private.is_note_shared_with_me(id))
    )
  );
create policy "Allowed readers update notes" on public.notes
  for update to authenticated
  using (
    (select private.is_team()) and (
      created_by = (select auth.uid()) or visibility = 'team'
      or (visibility = 'selected' and private.is_note_shared_with_me(id))
    )
  )
  with check ((select private.is_team()));
create policy "Authors and admins delete readable notes" on public.notes
  for delete to authenticated using (
    (select private.is_team()) and (
      created_by = (select auth.uid())
      or ((select private.is_admin()) and (visibility = 'team' or (visibility = 'selected' and private.is_note_shared_with_me(id))))
    )
  );

grant insert (visibility), update (visibility) on public.notes to authenticated;

alter table public.note_shares enable row level security;
alter table public.note_attachments enable row level security;
revoke all on public.note_shares, public.note_attachments from anon, authenticated;

grant select on public.note_shares to authenticated;
grant select, delete on public.note_attachments to authenticated;
grant insert (note_id, name, path, size_bytes, mime_type) on public.note_attachments to authenticated;

create policy "Note readers see who it is shared with" on public.note_shares
  for select to authenticated using (private.can_read_note(note_id));

create policy "Note readers see attachments" on public.note_attachments
  for select to authenticated using (private.can_read_note(note_id));
create policy "Note readers add attachments" on public.note_attachments
  for insert to authenticated with check (
    private.can_read_note(note_id) and private.note_id_from_path(path) = note_id
  );
create policy "Uploaders, authors and admins remove attachments" on public.note_attachments
  for delete to authenticated using (private.can_remove_attachment(note_id, uploaded_by));

-- Sets the exact list of members a note is shared with. Only the author can call it for their note.
create function public.set_note_shares(p_note_id uuid, p_user_ids uuid[])
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not private.is_team() or not exists (
    select 1 from public.notes n where n.id = p_note_id and n.created_by = auth.uid()
  ) then
    raise exception 'Only the author can change who can see this note.' using errcode = '42501';
  end if;

  delete from public.note_shares s
    where s.note_id = p_note_id and not (s.user_id = any (coalesce(p_user_ids, '{}')));

  insert into public.note_shares (note_id, user_id)
    select p_note_id, p.id from public.profiles p
    where p.id = any (coalesce(p_user_ids, '{}'))
      and p.role in ('admin', 'ctrl_member')
      and p.id <> auth.uid()
    on conflict do nothing;
end $$;

revoke all on function public.set_note_shares(uuid, uuid[]) from public, anon;
grant execute on function public.set_note_shares(uuid, uuid[]) to authenticated;

-- Private file storage: downloads use short-lived signed links.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('note-attachments', 'note-attachments', false, 10485760, array[
  'image/png', 'image/jpeg', 'image/webp', 'image/gif',
  'application/pdf', 'text/plain', 'text/csv', 'application/zip', 'application/x-zip-compressed',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
]);

create policy "Note readers download attachments" on storage.objects
  for select to authenticated using (bucket_id = 'note-attachments' and private.can_read_note(private.note_id_from_path(name)));
create policy "Note readers upload attachments" on storage.objects
  for insert to authenticated with check (bucket_id = 'note-attachments' and private.can_read_note(private.note_id_from_path(name)));
create policy "Allowed members remove attachment files" on storage.objects
  for delete to authenticated using (bucket_id = 'note-attachments' and private.can_remove_note_file(name));
