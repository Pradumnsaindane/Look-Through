# Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `npm ci` fails on engines or Vite errors at start | Use Node 22 (`nvm use`); Vite 8 needs ≥ 20.19 |
| `DATABASE_URL is not set` from `db:migrate` | Create `.env` from `.env.example` and fill it in |
| `Could not connect to the database` | Check the Neon string, `?sslmode=require`, and that the Neon project is not suspended |
| API returns `500 AUTH_NOT_CONFIGURED` | Set `NEON_AUTH_BASE_URL` (server) and `VITE_NEON_AUTH_URL` (browser), restart `npm run dev` |
| Signed in but `403 NO_ORGANIZATION_ACCESS` | The user has no `memberships` row; see `docs/DATABASE_SETUP.md` |
| Everyone is a guest, no sign-in | `VITE_NEON_AUTH_URL` is empty |
| `/api/*` 404 on `npm run preview` | Preview serves only the static build; use `npm run dev` or Vercel |
| Planet missing, CSS glow instead | Expected fallback when WebGL, unpkg.com or the asset host is blocked; open the console for the `[LookThrough] WebGL planet unavailable (…)` reason, or self-host three r0.143 and the assets |
| Deep link `/dashboard` is 404 on a host | Add an SPA rewrite to `index.html` (Vercel already has one) |
| Tests fail with a native binding error | Delete `node_modules` and run `npm ci` on your own OS (do not copy `node_modules` between machines) |
