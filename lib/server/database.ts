import 'server-only';
import type { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { dataDirectory } from './encryption';
import { localDeployment } from './config';
import { cloudflareBindings } from './cloudflare';

export type DbRow = Record<string, string | number | null>;
type Param = string | number | null;
const globals = globalThis as unknown as { pimxDatabase?: DatabaseSync };
const schema = `
CREATE TABLE IF NOT EXISTS app_users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, username TEXT UNIQUE, display_name TEXT NOT NULL, profile TEXT, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'USER', workspace_key TEXT NOT NULL, created_at BIGINT NOT NULL, last_login BIGINT);
CREATE TABLE IF NOT EXISTS app_sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE, expires_at BIGINT NOT NULL, last_seen BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS app_credentials (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE, provider_id TEXT NOT NULL, label TEXT NOT NULL, secret TEXT NOT NULL, base_url TEXT, api_format TEXT NOT NULL, created_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS app_shares (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE, payload TEXT NOT NULL, expires_at BIGINT NOT NULL, created_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS app_share_index (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS app_limits (bucket TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS app_contacts (id TEXT PRIMARY KEY, payload TEXT NOT NULL, created_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS app_pageviews (day TEXT NOT NULL, path TEXT NOT NULL, count BIGINT NOT NULL DEFAULT 0, PRIMARY KEY(day,path));
CREATE TABLE IF NOT EXISTS app_visits (id TEXT PRIMARY KEY, visitor_hash TEXT NOT NULL, user_id TEXT REFERENCES app_users(id) ON DELETE SET NULL, path TEXT NOT NULL, device TEXT NOT NULL, browser TEXT NOT NULL, country TEXT, city TEXT, region TEXT, created_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS app_auth_events (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE, kind TEXT NOT NULL, metadata TEXT NOT NULL, created_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS app_password_resets (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE, expires_at BIGINT NOT NULL, created_at BIGINT NOT NULL);
CREATE INDEX IF NOT EXISTS app_sessions_user ON app_sessions(user_id);
CREATE INDEX IF NOT EXISTS app_credentials_owner ON app_credentials(user_id);
CREATE INDEX IF NOT EXISTS app_shares_owner ON app_shares(user_id);
CREATE INDEX IF NOT EXISTS app_visits_time ON app_visits(created_at);
CREATE INDEX IF NOT EXISTS app_events_owner ON app_auth_events(user_id);`;

async function sqlite() {
  if (!localDeployment()) throw new Error('A Cloudflare D1 binding is required in production.');
  if (!globals.pimxDatabase) {
    // This local-only module must not enter the Cloudflare worker module graph.
    const localModule = 'node:sqlite';
    const { DatabaseSync: Database } = await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ localModule);
    mkdirSync(dataDirectory(), { recursive: true });
    const db: DatabaseSync = new Database(resolve(dataDirectory(), 'pimx.sqlite'));
    db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;'); db.exec(schema);
    const columns = new Set(db.prepare('PRAGMA table_info(app_users)').all().map(row => row.name));
    for (const [column, type] of [['username','TEXT'],['profile','TEXT'],['last_login','BIGINT']]) if (!columns.has(column)) db.exec(`ALTER TABLE app_users ADD COLUMN ${column} ${type}`);
    db.exec('CREATE UNIQUE INDEX IF NOT EXISTS app_users_username ON app_users(username)');
    globals.pimxDatabase = db;
  }
  return globals.pimxDatabase;
}
export async function query(sql: string, parameters: Param[] = []): Promise<DbRow[]> {
  const bindings = await cloudflareBindings();
  if (bindings?.DB) return (await bindings.DB.prepare(sql).bind(...parameters).all<DbRow>()).results;
  return (await sqlite()).prepare(sql).all(...parameters) as DbRow[];
}
export async function scopedQuery(userId: string, sql: string, parameters: Param[] = []) {
  // D1 has no native RLS. Every private query explicitly binds its server-session
  // owner; callers cannot supply a browser-selected owner or a database key.
  if (!userId || !parameters.includes(userId) || !/\buser_id\b/.test(sql)) throw new Error('An explicit bound record owner is required.');
  return query(sql, parameters);
}
