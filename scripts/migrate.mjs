#!/usr/bin/env node
/**
 * Minimal SQL migration runner for Look Through.
 *
 *   npm run db:migrate              apply pending migrations in migrations/*.sql (lexical order)
 *   npm run db:migrate:plan         list migrations without touching a database
 *   npm run db:seed:dev             apply migrations/seed/development.sql (non-production only)
 *
 * Reads DATABASE_URL (or the same fallbacks as the app) from the environment or a local .env file.
 * Applied files are recorded in the schema_migrations table; each file runs in its own transaction.
 * The shipped migrations use "if not exists", so running them against an already-provisioned
 * database is safe and simply records them.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
export const migrationsDir = join(root, 'migrations')

export function listMigrations(dir = migrationsDir) {
  return readdirSync(dir).filter((name) => /^\d{4}_.+\.sql$/.test(name)).sort()
}

function loadDotEnv() {
  const file = join(root, '.env')
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!match || line.trim().startsWith('#')) continue
    const value = match[2].replace(/^(['"])(.*)\1$/, '$2')
    if (process.env[match[1]] === undefined) process.env[match[1]] = value
  }
}

const databaseUrl = () =>
  process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING || process.env.NEON_DATABASE_URL

async function main() {
  const args = new Set(process.argv.slice(2))
  const files = listMigrations()

  if (args.has('--plan')) {
    console.log(`Migrations in ${migrationsDir}:`)
    files.forEach((file, index) => console.log(`  ${String(index + 1).padStart(2)}. ${file}`))
    return
  }

  loadDotEnv()
  const url = databaseUrl()
  if (!url) {
    console.error('DATABASE_URL is not set. Copy .env.example to .env and add your Neon connection string.')
    process.exit(1)
  }
  if (args.has('--seed-dev') && process.env.NODE_ENV === 'production') {
    console.error('Refusing to apply the development seed with NODE_ENV=production.')
    process.exit(1)
  }

  const { default: pg } = await import('pg')
  const isLocal = url.includes('localhost') || url.includes('127.0.0.1')
  const client = new pg.Client({ connectionString: url, ssl: isLocal ? undefined : { rejectUnauthorized: false } })
  try {
    await client.connect()
  } catch (error) {
    console.error(`Could not connect to the database: ${error.message}`)
    process.exit(1)
  }

  try {
    if (args.has('--seed-dev')) {
      const seed = readFileSync(join(migrationsDir, 'seed', 'development.sql'), 'utf8')
      await client.query('begin')
      await client.query(seed)
      await client.query('commit')
      console.log('Applied development seed (sample data only: do not use in production).')
      return
    }

    await client.query('create table if not exists schema_migrations (filename text primary key, applied_at timestamptz not null default now())')
    const applied = new Set((await client.query('select filename from schema_migrations')).rows.map((row) => row.filename))
    const pending = files.filter((file) => !applied.has(file))
    if (!pending.length) return console.log('Database is up to date. No pending migrations.')

    for (const file of pending) {
      const sql = readFileSync(join(migrationsDir, file), 'utf8')
      process.stdout.write(`Applying ${file} ... `)
      try {
        await client.query('begin')
        await client.query(sql)
        await client.query('insert into schema_migrations (filename) values ($1)', [file])
        await client.query('commit')
        console.log('ok')
      } catch (error) {
        await client.query('rollback').catch(() => {})
        console.log('FAILED')
        console.error(`  ${error.message}`)
        process.exit(1)
      }
    }
    console.log(`Applied ${pending.length} migration(s).`)
  } finally {
    await client.end().catch(() => {})
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main()
