create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(), email text not null unique, display_name text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(), name text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists roles (
  id uuid primary key default gen_random_uuid(), organization_id uuid references organizations(id) on delete cascade, name text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (organization_id, name)
);
create table if not exists permissions (
  id uuid primary key default gen_random_uuid(), key text not null unique, description text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists memberships (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, user_id uuid not null references users(id) on delete cascade, role_id uuid references roles(id) on delete restrict, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (organization_id, user_id)
);
create table if not exists role_permissions (
  role_id uuid not null references roles(id) on delete cascade, permission_id uuid not null references permissions(id) on delete cascade, created_at timestamptz not null default now(), primary key (role_id, permission_id)
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, name text not null, email text, phone text, status text not null default 'active' check (status in ('active','inactive','prospect')), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (organization_id, email)
);
create table if not exists customer_contacts (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, customer_id uuid not null references customers(id) on delete cascade, name text not null, email text, phone text, is_primary boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists leads (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, customer_id uuid references customers(id) on delete set null, name text not null, source text, status text not null default 'new' check (status in ('new','qualified','converted','lost')), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists deals (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, customer_id uuid references customers(id) on delete set null, lead_id uuid references leads(id) on delete set null, name text not null, amount_minor bigint not null default 0 check (amount_minor >= 0), currency char(3) not null default 'USD', stage text not null default 'lead' check (stage in ('lead','qualified','proposal','won','lost')), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists deal_activities (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, deal_id uuid not null references deals(id) on delete cascade, actor_id uuid references users(id) on delete set null, type text not null, note text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, name text not null, type text not null check (type in ('asset','liability','equity','revenue','expense')), currency char(3) not null default 'USD', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (organization_id, name)
);
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, account_id uuid not null references accounts(id) on delete restrict, amount_minor bigint not null check (amount_minor <> 0), occurred_at timestamptz not null default now(), description text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, customer_id uuid references customers(id) on delete set null, number text not null, status text not null default 'draft' check (status in ('draft','sent','paid','void','overdue')), currency char(3) not null default 'USD', total_minor bigint not null default 0 check (total_minor >= 0), due_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (organization_id, number)
);
create table if not exists invoice_items (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, invoice_id uuid not null references invoices(id) on delete cascade, description text not null, quantity numeric(12,2) not null check (quantity > 0), unit_amount_minor bigint not null check (unit_amount_minor >= 0), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, account_id uuid references accounts(id) on delete set null, vendor text not null, amount_minor bigint not null check (amount_minor > 0), currency char(3) not null default 'USD', status text not null default 'pending' check (status in ('pending','approved','rejected','paid')), occurred_at timestamptz not null default now(), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, name text not null, status text not null default 'active' check (status in ('planned','active','completed','archived')), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, project_id uuid references projects(id) on delete set null, assignee_id uuid references users(id) on delete set null, title text not null, status text not null default 'todo' check (status in ('todo','in_progress','done','cancelled')), priority text not null default 'medium' check (priority in ('low','medium','high','urgent')), due_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, actor_id uuid references users(id) on delete set null, entity_type text not null, entity_id uuid, action text not null, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, user_id uuid not null references users(id) on delete cascade, title text not null, body text not null default '', read_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists alerts (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, severity text not null check (severity in ('info','warning','critical')), title text not null, status text not null default 'open' check (status in ('open','acknowledged','resolved')), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists ai_conversations (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, user_id uuid not null references users(id) on delete cascade, title text not null default 'New conversation', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists ai_runs (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, conversation_id uuid references ai_conversations(id) on delete cascade, status text not null default 'queued' check (status in ('queued','running','completed','failed')), model text not null, input jsonb not null default '{}'::jsonb, output jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists ai_insights (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, title text not null, summary text not null, severity text not null default 'info' check (severity in ('info','warning','critical')), dismissed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists ai_actions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, created_by uuid references users(id) on delete set null, action_type text not null, status text not null default 'proposed' check (status in ('proposed','approved','rejected','executed','failed')), payload jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists integrations (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, provider text not null, status text not null default 'disconnected' check (status in ('connected','disconnected','error')), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (organization_id, provider)
);
create table if not exists integration_accounts (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, integration_id uuid not null references integrations(id) on delete cascade, external_account_id text not null, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (integration_id, external_account_id)
);
create table if not exists dashboard_layouts (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, user_id uuid references users(id) on delete cascade, layout jsonb not null default '[]'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (organization_id, user_id)
);
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, actor_id uuid references users(id) on delete set null, action text not null, entity_type text not null, entity_id uuid, before_data jsonb, after_data jsonb, request_id text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists files (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, uploaded_by uuid references users(id) on delete set null, storage_key text not null, file_name text not null, content_type text not null, size_bytes bigint not null check (size_bytes >= 0), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (organization_id, storage_key)
);

create index if not exists customers_org_idx on customers(organization_id);
create index if not exists deals_org_stage_idx on deals(organization_id, stage);
create index if not exists invoices_org_status_idx on invoices(organization_id, status);
create index if not exists tasks_org_status_idx on tasks(organization_id, status);
create index if not exists notifications_user_unread_idx on notifications(organization_id, user_id) where read_at is null;
create index if not exists audit_logs_org_created_idx on audit_logs(organization_id, created_at desc);
