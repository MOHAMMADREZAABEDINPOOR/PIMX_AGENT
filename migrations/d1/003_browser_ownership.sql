CREATE TABLE IF NOT EXISTS app_browser_workspaces (id TEXT PRIMARY KEY, token_hash TEXT UNIQUE NOT NULL, workspace_key TEXT NOT NULL, created_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS app_browser_credentials (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES app_browser_workspaces(id) ON DELETE CASCADE, provider_id TEXT NOT NULL, label TEXT NOT NULL, secret TEXT NOT NULL, base_url TEXT, api_format TEXT NOT NULL, created_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS app_browser_shares (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES app_browser_workspaces(id) ON DELETE CASCADE, payload TEXT NOT NULL, expires_at BIGINT NOT NULL, created_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS app_browser_share_index (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES app_browser_workspaces(id) ON DELETE CASCADE);
CREATE INDEX IF NOT EXISTS app_browser_credentials_owner ON app_browser_credentials(user_id);
CREATE INDEX IF NOT EXISTS app_browser_shares_owner ON app_browser_shares(user_id);

-- Preserve any workspaces created before browser ownership was separated.
INSERT OR IGNORE INTO app_browser_workspaces SELECT * FROM app_workspaces;
INSERT OR IGNORE INTO app_browser_credentials SELECT * FROM app_workspace_credentials;
INSERT OR IGNORE INTO app_browser_shares SELECT * FROM app_workspace_shares;
INSERT OR IGNORE INTO app_browser_share_index SELECT * FROM app_workspace_share_index;
