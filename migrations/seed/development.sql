-- Development-only seed. Run explicitly against a non-production database.
insert into organizations (id, name) values ('00000000-0000-0000-0000-000000000001', 'Look-Through Development') on conflict (id) do nothing;
insert into users (id, email, display_name) values ('00000000-0000-0000-0000-000000000001', 'dev@example.test', 'Development User') on conflict (id) do nothing;
insert into memberships (organization_id, user_id) values ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001') on conflict (organization_id, user_id) do nothing;
insert into customers (organization_id, name, email, status) values ('00000000-0000-0000-0000-000000000001', 'Example Customer', 'customer@example.test', 'active') on conflict (organization_id, email) do nothing;
