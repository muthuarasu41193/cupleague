-- ============================================================
--  CupLeague Seed Data — 10 upcoming FIFA 2026-style matches
--  Dates are 7–20 days from when you run this script.
--  Re-run with updated dates if needed.
-- ============================================================

insert into public.matches (home_team, away_team, match_date, status) values
  ('Argentina',  'Brazil',   now() + interval '7 days',  'upcoming'),
  ('France',     'Spain',    now() + interval '8 days',  'upcoming'),
  ('England',    'Germany',  now() + interval '9 days',  'upcoming'),
  ('Portugal',   'Netherlands', now() + interval '10 days', 'upcoming'),
  ('Italy',      'Belgium',  now() + interval '11 days', 'upcoming'),
  ('Croatia',    'Morocco',  now() + interval '12 days', 'upcoming'),
  ('USA',        'Mexico',   now() + interval '14 days', 'upcoming'),
  ('Japan',      'South Korea', now() + interval '16 days', 'upcoming'),
  ('Uruguay',    'Colombia', now() + interval '18 days', 'upcoming'),
  ('Senegal',    'Nigeria',  now() + interval '20 days', 'upcoming')
on conflict do nothing;
