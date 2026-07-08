alter table public.patients
add column if not exists session_price numeric(10, 2);

create table if not exists public.patient_session_prices (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  price numeric(10, 2) not null check (price >= 0),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);

create index if not exists patient_session_prices_patient_id_starts_at_idx
on public.patient_session_prices(patient_id, starts_at desc);

create unique index if not exists patient_session_prices_one_current_per_patient_idx
on public.patient_session_prices(patient_id)
where ends_at is null;

alter table public.patient_sessions
add column if not exists session_price numeric(10, 2),
add column if not exists payment_status text not null default 'pending',
add column if not exists paid_at timestamptz,
add column if not exists paid_amount numeric(10, 2);

alter table public.patient_sessions
drop constraint if exists patient_sessions_payment_status_check;

alter table public.patient_sessions
add constraint patient_sessions_payment_status_check
check (payment_status in ('pending', 'paid', 'cancelled'));

insert into public.patient_session_prices (patient_id, price, starts_at)
select id, session_price, coalesce(created_at, now())
from public.patients
where session_price is not null
  and not exists (
    select 1
    from public.patient_session_prices
    where patient_session_prices.patient_id = patients.id
      and patient_session_prices.ends_at is null
  );

update public.patient_sessions
set session_price = patients.session_price
from public.patients
where patient_sessions.patient_id = patients.id
  and patient_sessions.session_price is null
  and patients.session_price is not null;

update public.patient_sessions
set
  payment_status = 'paid',
  paid_at = coalesce(patient_sessions.paid_at, patient_sessions.updated_at, patient_sessions.starts_at, now()),
  paid_amount = coalesce(patient_sessions.paid_amount, patient_sessions.session_price)
where status = 'completed'
  and payment_status <> 'paid';
