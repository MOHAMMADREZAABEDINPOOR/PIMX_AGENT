CREATE TABLE IF NOT EXISTS app_workspaces (id TEXT PRIMARY KEY, token_hash TEXT UNIQUE NOT NULL, workspace_key TEXT NOT NULL, created_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS app_workspace_credentials (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES app_workspaces(id) ON DELETE CASCADE, provider_id TEXT NOT NULL, label TEXT NOT NULL, secret TEXT NOT NULL, base_url TEXT, api_format TEXT NOT NULL, created_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS app_workspace_shares (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES app_workspaces(id) ON DELETE CASCADE, payload TEXT NOT NULL, expires_at BIGINT NOT NULL, created_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS app_workspace_share_index (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES app_workspaces(id) ON DELETE CASCADE);
CREATE INDEX IF NOT EXISTS app_workspace_credentials_owner ON app_workspace_credentials(user_id);
CREATE INDEX IF NOT EXISTS app_workspace_shares_owner ON app_workspace_shares(user_id);
