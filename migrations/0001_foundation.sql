-- Production foundation migration.
-- Apply through the selected PostgreSQL migration runner.
-- This file intentionally contains schema only; no seed or fake production data.

create table if not exists organizations (
  id uuid primary key,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key,
  email text not null unique,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists memberships (
  organization_id uuid not null references organizations(id),
  user_id uuid not null references users(id),
  role text not null,
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists audit_events (
  id uuid primary key,
  organization_id uuid not null references organizations(id),
  actor_id uuid references users(id),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before_data jsonb,
  after_data jsonb,
  request_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_org_created_idx on audit_events (organization_id, created_at desc);
