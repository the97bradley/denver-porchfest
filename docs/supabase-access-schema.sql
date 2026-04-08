-- Run in Supabase SQL editor

create table if not exists public.attendees (
  id uuid primary key default gen_random_uuid(),

  "firstName" text not null,
  "lastName" text not null,
  email text not null,

  "tokenUrl" text not null unique,
  "accessCode" text not null unique,

  "eventbriteAttendeeId" text unique,
  "eventbriteOrderId" text,
  "ticketType" text,

  status text not null default 'active',

  "lastAccessedAt" timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists attendees_email_idx on public.attendees (email);
create index if not exists attendees_order_idx on public.attendees ("eventbriteOrderId");
create index if not exists attendees_status_idx on public.attendees (status);

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
