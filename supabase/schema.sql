create table if not exists public.verse_feedback_reports (
  id uuid primary key default gen_random_uuid(),
  client_report_id uuid not null unique,
  status text not null default 'new'
    check (status in ('uploading', 'new', 'audio_failed', 'reviewed', 'resolved')),
  language text not null check (language in ('ru', 'en')),
  kind text not null check (kind in ('missed', 'wrong', 'other')),
  expected_text text not null default '',
  caught_text text not null default '',
  note text not null default '',
  requested_audio_seconds numeric(5,2) not null default 0
    check (requested_audio_seconds between 0 and 60),
  actual_audio_seconds numeric(5,2) not null default 0
    check (actual_audio_seconds between 0 and 60),
  context jsonb not null default '{}'::jsonb,
  latest_reference jsonb,
  transcripts jsonb not null default '[]'::jsonb
    check (jsonb_typeof(transcripts) = 'array'),
  app_version text not null default '',
  browser text not null default '',
  source_origin text not null default '',
  submitter_hash text not null,
  audio_path text unique,
  audio_content_type text,
  audio_size_bytes bigint
    check (audio_size_bytes is null or audio_size_bytes between 0 and 8388608),
  audio_access_token uuid not null default gen_random_uuid() unique,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  resolved_at timestamptz
);

alter table public.verse_feedback_reports enable row level security;
revoke all on table public.verse_feedback_reports from anon, authenticated;
grant select, insert, update, delete on table public.verse_feedback_reports to service_role;

create index if not exists verse_feedback_reports_created_at_idx
  on public.verse_feedback_reports (created_at desc);
create index if not exists verse_feedback_reports_status_created_at_idx
  on public.verse_feedback_reports (status, created_at desc);
create index if not exists verse_feedback_reports_submitter_created_at_idx
  on public.verse_feedback_reports (submitter_hash, created_at desc);
