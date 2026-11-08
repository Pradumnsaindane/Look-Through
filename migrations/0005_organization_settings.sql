-- Persist organization governance settings without changing existing records.
create table if not exists organization_settings (
  organization_id uuid primary key references organizations(id) on delete cascade,
  gst_number text not null default '',
  ai_autonomy_level text not null default 'Level 4 (Ask Approval Before Execution)',
  reminder_threshold_minor bigint not null default 5000000 check (reminder_threshold_minor >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
