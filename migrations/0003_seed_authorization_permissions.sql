insert into permissions (key, description)
values
  ('customers.read', 'Read customers'),
  ('customers.create', 'Create customers'),
  ('customers.update', 'Update customers'),
  ('customers.delete', 'Archive customers'),
  ('analytics.read', 'Read dashboard analytics'),
  ('ai.read', 'Run read-only AI tools'),
  ('ai.execute', 'Execute approved AI write tools')
on conflict (key) do update set description = excluded.description, updated_at = now();

-- Seed global roles and the API permissions they require without altering existing memberships.
do $$
declare
  role_name text;
  permission_keys text[];
  role_id uuid;
  permission_key text;
begin
  for role_name, permission_keys in select * from (values
    ('Owner', array['customers.read','customers.create','customers.update','customers.delete','analytics.read','ai.read','ai.execute']::text[]),
    ('Admin', array['customers.read','customers.create','customers.update','customers.delete','analytics.read','ai.read','ai.execute']::text[]),
    ('Manager', array['customers.read','customers.create','customers.update','analytics.read','ai.read','ai.execute']::text[]),
    ('Employee', array['customers.read','customers.create','customers.update','analytics.read','ai.read']::text[]),
    ('Viewer', array['customers.read','analytics.read','ai.read']::text[])
  ) as seeded(name, keys) loop
    select r.id into role_id from roles r where r.organization_id is null and r.name = role_name limit 1;
    if role_id is null then
      insert into roles (organization_id, name) values (null, role_name) returning id into role_id;
    end if;
    foreach permission_key in array permission_keys loop
      insert into role_permissions (role_id, permission_id)
      select role_id, p.id from permissions p where p.key = permission_key
      on conflict do nothing;
    end loop;
  end loop;
end $$;
