-- Additive reconciliation for the deployed AI schema.
-- Legacy columns remain authoritative for existing records; new columns provide
-- run/action/audit traceability for the current orchestration service.

alter table ai_runs add column if not exists actor_id uuid;
alter table ai_runs add column if not exists requested_mode text;
alter table ai_runs add column if not exists prompt text;
alter table ai_runs add column if not exists grounded_sources jsonb;
alter table ai_runs add column if not exists completed_at timestamptz;

alter table ai_actions add column if not exists run_id uuid;
alter table ai_actions add column if not exists actor_id uuid;
alter table ai_actions add column if not exists tool_name text;
alter table ai_actions add column if not exists permission_level text;
alter table ai_actions add column if not exists input jsonb;
alter table ai_actions add column if not exists output jsonb;
alter table ai_actions add column if not exists approval_required boolean;
alter table ai_actions add column if not exists approved_at timestamptz;
alter table ai_actions add column if not exists executed_at timestamptz;
alter table ai_actions add column if not exists idempotency_key text;

alter table audit_logs add column if not exists ai_run_id uuid;
alter table audit_logs add column if not exists ai_action_id uuid;

create index if not exists ai_actions_run_idx on ai_actions (run_id);
create index if not exists audit_logs_ai_run_idx on audit_logs (ai_run_id);
alter table ai_actions add constraint ai_actions_run_id_fkey foreign key (run_id) references ai_runs(id);
alter table audit_logs add constraint audit_logs_ai_run_id_fkey foreign key (ai_run_id) references ai_runs(id);
alter table audit_logs add constraint audit_logs_ai_action_id_fkey foreign key (ai_action_id) references ai_actions(id);
create unique index if not exists ai_actions_org_idempotency_idx
  on ai_actions (organization_id, idempotency_key)
  where idempotency_key is not null;

-- Lifecycle: request -> authenticated principal -> permission check -> run
-- -> explicit domain tool -> result -> proposed/prepared action -> approval
-- -> execution -> linked audit event. Suggestions never execute mutations.
-- A nullable run_id preserves existing legacy actions while every new action
-- written by the orchestrator is traceable to its ai_runs row.

update ai_runs
set requested_mode = coalesce(requested_mode, 'READ'),
    grounded_sources = coalesce(grounded_sources, '[]'::jsonb)
where requested_mode is null or grounded_sources is null;

update ai_actions
set input = coalesce(input, payload),
    output = coalesce(output, payload),
    approval_required = coalesce(approval_required, status in ('proposed', 'approved')),
    tool_name = coalesce(tool_name, action_type),
    permission_level = coalesce(permission_level, 'PREPARE')
where input is null or output is null or approval_required is null or tool_name is null or permission_level is null;
