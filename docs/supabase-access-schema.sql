-- Run in Supabase SQL editor

create table if not exists public.attendees (
  id uuid primary key default gen_random_uuid(),
  eventbrite_attendee_id text unique not null,
  eventbrite_order_id text not null,
  full_name text not null,
  email text not null,
  access_code text unique not null,
  access_link_token text unique not null,
  access_link text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists attendees_email_idx on public.attendees (email);
create index if not exists attendees_order_idx on public.attendees (eventbrite_order_id);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  eventbrite_webhook_id text unique not null,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Optional updated_at trigger
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_attendees_updated_at on public.attendees;
create trigger trg_attendees_updated_at
before update on public.attendees
for each row execute function public.touch_updated_at();
