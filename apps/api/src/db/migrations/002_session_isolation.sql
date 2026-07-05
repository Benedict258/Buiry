ALTER TABLE sessions ADD COLUMN IF NOT EXISTS api_key_id UUID REFERENCES api_keys(id);
CREATE INDEX IF NOT EXISTS idx_sessions_api_key ON sessions(api_key_id);
