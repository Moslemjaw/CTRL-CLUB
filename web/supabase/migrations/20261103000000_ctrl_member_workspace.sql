-- New role
alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('user', 'admin', 'scanner', 'ctrl_member'));

-- Tables: everything here is shared by the whole team.
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  description text not null default '' check (char_length(description) <= 5000),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  due_date date,
  assigned_to uuid references public.profiles (id) on delete set null,
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.calendar_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  description text not null default '' check (char_length(description) <= 5000),
  location text not null default '' check (char_length(location) <= 200),
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  body text not null default '' check (char_length(body) <= 20000),
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_status_idx on public.tasks (status, due_date);
create index tasks_assigned_to_idx on public.tasks (assigned_to);
create index tasks_created_by_idx on public.tasks (created_by);
create index calendar_entries_starts_at_idx on public.calendar_entries (starts_at);
create index calendar_entries_created_by_idx on public.calendar_entries (created_by);
create index notes_updated_at_idx on public.notes (updated_at desc);
create index notes_created_by_idx on public.notes (created_by);

create trigger tasks_updated_at before update on public.tasks
  for each row execute function private.set_updated_at();
create trigger calendar_entries_updated_at before update on public.calendar_entries
  for each row execute function private.set_updated_at();
create trigger notes_updated_at before update on public.notes
  for each row execute function private.set_updated_at();

-- Helpers
create function private.is_team()
returns boolean language sql stable security definer set search_path = ''
as $$ select coalesce(private.get_role() in ('admin', 'ctrl_member'), false) $$;

revoke all on function private.is_team() from public;
grant execute on function private.is_team() to authenticated;

-- Access rules: created_by has no insert or update grant, so it always stays the real author.
alter table public.tasks enable row level security;
alter table public.calendar_entries enable row level security;
alter table public.notes enable row level security;

revoke all on public.tasks, public.calendar_entries, public.notes from anon, authenticated;

grant select, delete on public.tasks, public.calendar_entries, public.notes to authenticated;
grant insert (title, description, status, due_date, assigned_to),
  update (title, description, status, due_date, assigned_to) on public.tasks to authenticated;
grant insert (title, description, location, starts_at, ends_at),
  update (title, description, location, starts_at, ends_at) on public.calendar_entries to authenticated;
grant insert (title, body), update (title, body) on public.notes to authenticated;

create policy "Team reads tasks" on public.tasks
  for select to authenticated using ((select private.is_team()));
create policy "Team creates tasks" on public.tasks
  for insert to authenticated with check ((select private.is_team()));
create policy "Team updates tasks" on public.tasks
  for update to authenticated using ((select private.is_team())) with check ((select private.is_team()));
create policy "Authors and admins delete tasks" on public.tasks
  for delete to authenticated
  using ((select private.is_team()) and (created_by = (select auth.uid()) or (select private.is_admin())));

create policy "Team reads calendar entries" on public.calendar_entries
  for select to authenticated using ((select private.is_team()));
create policy "Team creates calendar entries" on public.calendar_entries
  for insert to authenticated with check ((select private.is_team()));
create policy "Team updates calendar entries" on public.calendar_entries
  for update to authenticated using ((select private.is_team())) with check ((select private.is_team()));
create policy "Authors and admins delete calendar entries" on public.calendar_entries
  for delete to authenticated
  using ((select private.is_team()) and (created_by = (select auth.uid()) or (select private.is_admin())));

create policy "Team reads notes" on public.notes
  for select to authenticated using ((select private.is_team()));
create policy "Team creates notes" on public.notes
  for insert to authenticated with check ((select private.is_team()));
create policy "Team updates notes" on public.notes
  for update to authenticated using ((select private.is_team())) with check ((select private.is_team()));
create policy "Authors and admins delete notes" on public.notes
  for delete to authenticated
  using ((select private.is_team()) and (created_by = (select auth.uid()) or (select private.is_admin())));

-- Names for assignees and authors: members cannot read each other's profiles, which hold emails and phone numbers.
create function public.list_team_members()
returns table (id uuid, name text)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not private.is_team() then
    raise exception 'You do not have the necessary permissions.' using errcode = '42501';
  end if;
  return query
    select p.id, p.name from public.profiles p
    where p.role in ('admin', 'ctrl_member')
    order by p.name;
end $$;

revoke all on function public.list_team_members() from public, anon;
grant execute on function public.list_team_members() to authenticated;

-- Ticket scanning: unchanged apart from also allowing CTRL members.
create or replace function public.scan_ticket(p_qr_id text, p_event_id uuid)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_ticket public.tickets;
begin
  if coalesce(private.get_role(), '') not in ('scanner', 'admin', 'ctrl_member') then
    raise exception 'You do not have the necessary permissions.' using errcode = '42501';
  end if;

  update public.tickets
    set status = 'used', used_at = now()
    where qr_id = p_qr_id and event_id = p_event_id and status = 'unused'
    returning * into v_ticket;
  if found then
    return 'Ticket used successfully';
  end if;

  select * into v_ticket from public.tickets where qr_id = p_qr_id;
  if not found then
    return 'Ticket not found';
  end if;
  if v_ticket.event_id is distinct from p_event_id then
    return 'This ticket is not available for this event.';
  end if;
  return 'Ticket already used';
end $$;
