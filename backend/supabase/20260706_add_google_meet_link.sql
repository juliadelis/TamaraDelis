alter table public.patient_sessions
add column if not exists google_meet_link text;
