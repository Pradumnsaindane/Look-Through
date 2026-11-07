import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import { listMigrations, migrationsDir } from '../scripts/migrate.mjs'

test('migrations are discovered in a stable, ordered, complete sequence', () => {
  const files = listMigrations()
  assert.ok(files.length >= 6)
  assert.deepEqual(files, [...files].sort())
  assert.equal(files[0], '0001_foundation.sql')
  assert.ok(files.includes('0005_contact_submissions.sql'))
})

test('permission seed runs after the migration that creates the permissions table', () => {
  const files = listMigrations()
  const creator = files.find((file) => /create table if not exists permissions/i.test(readFileSync(join(migrationsDir, file), 'utf8')))
  assert.ok(creator)
  assert.ok(files.indexOf('0003_seed_authorization_permissions.sql') > files.indexOf(creator))
})

test('migrations are idempotent (no bare CREATE TABLE) so re-running is safe', () => {
  for (const file of listMigrations()) {
    const sql = readFileSync(join(migrationsDir, file), 'utf8')
    assert.doesNotMatch(sql, /create table (?!if not exists)/i, `${file} has a non-idempotent CREATE TABLE`)
  }
})
