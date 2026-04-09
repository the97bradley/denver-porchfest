-- Run in Supabase SQL editor

create table if not exists public.attendees (
  id uuid primary key default gen_random_uuid(),

  "firstName" text not null,
  "lastName" text not null,
  email text not null,

  "tokenUrl" text unique,
  "accessCode" text unique,

  "eventbriteAttendeeId" text unique,
  "eventbriteOrderId" text,
  "ticketType" text,

  status text not null default 'active',

  "lastAccessedAt" timestamptz,
  "accessEmailSentAt" timestamptz,
  "accessEmailError" text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.attendees add column if not exists "accessEmailSentAt" timestamptz;
alter table public.attendees add column if not exists "accessEmailError" text;
alter table public.attendees add column if not exists "deviceId" text;
alter table public.attendees add column if not exists "deviceBoundAt" timestamptz;
alter table public.attendees add column if not exists "lastSeenAt" timestamptz;
alter table public.attendees alter column "tokenUrl" drop not null;
alter table public.attendees alter column "accessCode" drop not null;

create index if not exists attendees_email_idx on public.attendees (email);
create index if not exists attendees_order_idx on public.attendees ("eventbriteOrderId");
create index if not exists attendees_status_idx on public.attendees (status);

create table if not exists public.pipeline_errors (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  reference_id text,
  reason text not null,
  payload jsonb,
  error jsonb,
  created_at timestamptz not null default now()
);

create index if not exists pipeline_errors_source_idx on public.pipeline_errors (source);
create index if not exists pipeline_errors_reference_idx on public.pipeline_errors (reference_id);

create table if not exists public.retry_jobs (
  id uuid primary key default gen_random_uuid(),
  job_key text unique not null,
  kind text not null,
  payload jsonb not null,
  run_at timestamptz not null,
  status text not null default 'pending',
  error jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists retry_jobs_status_runat_idx on public.retry_jobs (status, run_at);

create table if not exists public.cron_status (
  id uuid primary key default gen_random_uuid(),
  job_name text unique not null,
  last_status text,
  last_error text,
  last_started_at timestamptz,
  last_finished_at timestamptz,
  attendees_found integer default 0,
  attendees_processed integer default 0,
  attendees_ignored integer default 0,
  emails_sent integer default 0,
  db_sweep_found integer default 0,
  db_sweep_emailed integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_locks (
  job_name text primary key,
  locked_until timestamptz not null,
  updated_at timestamptz not null default now()
);

create or replace function public.acquire_job_lock(p_job text, p_seconds integer default 600)
returns boolean
language plpgsql
as $$
declare
  v_rows integer;
begin
  insert into public.job_locks (job_name, locked_until)
  values (p_job, now() + make_interval(secs => p_seconds))
  on conflict (job_name)
  do update
    set locked_until = now() + make_interval(secs => p_seconds),
        updated_at = now()
  where public.job_locks.locked_until < now();

  get diagnostics v_rows = row_count;
  return v_rows > 0;
end;
$$;

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

drop trigger if exists trg_cron_status_updated_at on public.cron_status;
create trigger trg_cron_status_updated_at
before update on public.cron_status
for each row execute function public.touch_updated_at();

-- Hardening: keep exposed tables closed to anon/authenticated clients.
alter table public.attendees enable row level security;
alter table public.pipeline_errors enable row level security;
alter table public.retry_jobs enable row level security;
alter table public.cron_status enable row level security;
alter table public.job_locks enable row level security;
