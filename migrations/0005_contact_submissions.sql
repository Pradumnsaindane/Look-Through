-- Public landing-page contact inbox.
-- Submissions are unauthenticated and organization-less: they are the raw
-- material for a follow-up conversation, not workspace business data.

create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  topic text not null check (topic in ('sales', 'learning', 'support', 'partnership', 'other')),
  message text not null,
  source text not null default 'landing-contact',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_submissions_created_idx on contact_submissions (created_at desc);
