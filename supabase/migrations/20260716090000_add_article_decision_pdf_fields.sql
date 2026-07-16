alter table public.articles
  add column if not exists decision_pdf_url text,
  add column if not exists decision_pdf_title text,
  add column if not exists decision_court text,
  add column if not exists decision_case_no text,
  add column if not exists decision_number text,
  add column if not exists decision_date date;
