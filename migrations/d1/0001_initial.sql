
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
CREATE INDEX IF NOT EXISTS app_events_owner ON app_auth_events(user_id);