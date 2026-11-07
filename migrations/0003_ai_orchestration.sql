create table if not exists ai_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  actor_id uuid,
  requested_mode text not null default 'READ',
  prompt text not null,
  grounded_sources jsonb not null default '[]'::jsonb,
  status text not null default 'completed',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists ai_runs_org_created_idx on ai_runs (organization_id, created_at desc);

create table if not exists ai_actions (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references ai_runs(id),
  organization_id uuid not null references organizations(id),
  actor_id uuid,
  tool_name text not null,
  permission_level text not null,
  status text not null default 'prepared',
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  approval_required boolean not null default true,
  approved_at timestamptz,
  executed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists ai_actions_org_created_idx on ai_actions (organization_id, created_at desc);
create index if not exists ai_actions_run_idx on ai_actions (run_id);
