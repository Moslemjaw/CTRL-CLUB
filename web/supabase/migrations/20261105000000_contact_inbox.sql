alter table public.contact_messages
  add column read_at timestamptz,
  add column replied_at timestamptz;

create index contact_messages_created_at_idx on public.contact_messages (created_at desc);

-- Replies are written only by the contact-reply function, after the email has been sent.
create table public.contact_replies (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.contact_messages (id) on delete cascade,
  admin_id uuid references public.profiles (id) on delete set null,
  admin_name text not null,
  body text not null check (char_length(body) between 1 and 10000),
  created_at timestamptz not null default now()
);

create index contact_replies_message_id_idx on public.contact_replies (message_id, created_at);

alter table public.contact_replies enable row level security;
revoke all on public.contact_replies from anon, authenticated;
grant select on public.contact_replies to authenticated;

create policy "Admins read contact replies" on public.contact_replies
  for select to authenticated using ((select private.is_admin()));

grant update (read_at), delete on public.contact_messages to authenticated;

create policy "Admins update contact messages" on public.contact_messages
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete contact messages" on public.contact_messages
  for delete to authenticated using ((select private.is_admin()));
