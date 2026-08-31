alter table public.verse_feedback_reports
  add column if not exists timing text not null default '';

alter table public.verse_feedback_reports
  drop constraint if exists verse_feedback_reports_kind_check;

alter table public.verse_feedback_reports
  add constraint verse_feedback_reports_kind_check
  check (kind in ('missed', 'late', 'misinterpreted', 'wrong', 'other'));

alter table public.verse_feedback_reports
  drop constraint if exists verse_feedback_reports_timing_check;

alter table public.verse_feedback_reports
  add constraint verse_feedback_reports_timing_check
  check (timing in ('', '1-2', '3-5', '5-plus'));
