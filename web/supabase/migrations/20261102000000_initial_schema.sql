create schema if not exists private;
grant usage on schema private to authenticated;

-- Tables
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  phone_number text not null default '',
  role text not null default 'user' check (role in ('user', 'admin', 'scanner')),
  avatar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  date timestamptz not null,
  location text not null,
  price numeric(10, 2) not null check (price >= 0),
  capacity integer not null check (capacity >= 0),
  available_tickets integer not null check (available_tickets >= 0),
  cover_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Event details are copied onto the ticket so tickets survive event deletion, as in the original app.
create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  qr_id text not null unique default gen_random_uuid()::text,
  event_id uuid references public.events (id) on delete set null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_title text not null,
  event_location text not null,
  event_date timestamptz not null,
  status text not null default 'unused' check (status in ('unused', 'used')),
  used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) between 3 and 320),
  phone_number text not null check (char_length(phone_number) between 1 and 50),
  subject text not null check (char_length(subject) between 1 and 300),
  message text not null check (char_length(message) between 1 and 5000),
  created_at timestamptz not null default now()
);

create index events_date_idx on public.events (date);
create index events_created_at_idx on public.events (created_at desc);
create index events_available_tickets_idx on public.events (available_tickets);
create index tickets_user_id_idx on public.tickets (user_id, status);
create index tickets_event_id_idx on public.tickets (event_id);

-- Helpers
create function private.get_role()
returns text language sql stable security definer set search_path = ''
as $$ select role from public.profiles where id = auth.uid() $$;

create function private.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select coalesce(private.get_role() = 'admin', false) $$;

revoke all on function private.get_role() from public;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

create function private.set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$ begin new.updated_at = now(); return new; end $$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();
create trigger events_updated_at before update on public.events
  for each row execute function private.set_updated_at();
create trigger tickets_updated_at before update on public.tickets
  for each row execute function private.set_updated_at();

-- New accounts are always plain users: the role in sign-up metadata is deliberately ignored.
create function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, phone_number)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone_number', '')
  );
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

create function private.sync_user_email()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end $$;

create trigger on_auth_user_email_updated after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function private.sync_user_email();

-- Access rules
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.tickets enable row level security;
alter table public.contact_messages enable row level security;

revoke all on public.profiles, public.events, public.tickets, public.contact_messages from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (name, phone_number, avatar) on public.profiles to authenticated;
grant select on public.events to anon, authenticated;
grant insert, update, delete on public.events to authenticated;
grant select on public.tickets to authenticated;
grant insert (name, email, phone_number, subject, message) on public.contact_messages to anon, authenticated;
grant select on public.contact_messages to authenticated;

create policy "Users read own profile, admins read all" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or (select private.is_admin()));
create policy "Users edit own profile, admins edit all" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()))
  with check (id = (select auth.uid()) or (select private.is_admin()));

create policy "Anyone reads events" on public.events
  for select to anon, authenticated using (true);
create policy "Admins create events" on public.events
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update events" on public.events
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete events" on public.events
  for delete to authenticated using ((select private.is_admin()));

create policy "Users read own tickets, admins read all" on public.tickets
  for select to authenticated using (user_id = (select auth.uid()) or (select private.is_admin()));

create policy "Anyone sends contact messages" on public.contact_messages
  for insert to anon, authenticated with check (char_length(message) > 0);
create policy "Admins read contact messages" on public.contact_messages
  for select to authenticated using ((select private.is_admin()));

-- Ticket registration: the conditional update makes overselling impossible.
create function public.register_for_event(p_event_id uuid, p_quantity integer default 1)
returns setof public.tickets
language plpgsql security definer set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_event public.events;
begin
  if v_user_id is null or coalesce(private.get_role(), '') not in ('user', 'admin') then
    raise exception 'You do not have the necessary permissions.' using errcode = '42501';
  end if;
  if p_quantity is null or p_quantity < 1 or p_quantity > 10 then
    raise exception 'Invalid number of tickets' using errcode = '22023';
  end if;

  update public.events
    set available_tickets = available_tickets - p_quantity
    where id = p_event_id and available_tickets >= p_quantity
    returning * into v_event;

  if not found then
    if exists (select 1 from public.events where id = p_event_id) then
      raise exception 'Not enough tickets available' using errcode = 'P0001';
    end if;
    raise exception 'Event not found' using errcode = 'P0002';
  end if;

  return query
    insert into public.tickets (event_id, user_id, event_title, event_location, event_date)
    select v_event.id, v_user_id, v_event.title, v_event.location, v_event.date
    from generate_series(1, p_quantity)
    returning *;
end $$;

-- Ticket scanning: same messages as the original, now atomic and checked against the event on the server.
create function public.scan_ticket(p_qr_id text, p_event_id uuid)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_ticket public.tickets;
begin
  if coalesce(private.get_role(), '') not in ('scanner', 'admin') then
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

revoke all on function public.register_for_event(uuid, integer) from public, anon;
revoke all on function public.scan_ticket(text, uuid) from public, anon;
grant execute on function public.register_for_event(uuid, integer) to authenticated;
grant execute on function public.scan_ticket(text, uuid) to authenticated;

-- Event cover images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('event-images', 'event-images', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']);

create policy "Admins list event images" on storage.objects
  for select to authenticated using (bucket_id = 'event-images' and (select private.is_admin()));
create policy "Admins upload event images" on storage.objects
  for insert to authenticated with check (bucket_id = 'event-images' and (select private.is_admin()));
create policy "Admins update event images" on storage.objects
  for update to authenticated using (bucket_id = 'event-images' and (select private.is_admin()));
create policy "Admins delete event images" on storage.objects
  for delete to authenticated using (bucket_id = 'event-images' and (select private.is_admin()));
