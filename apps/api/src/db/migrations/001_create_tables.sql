CREATE TABLE IF NOT EXISTS workspaces (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_address VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES workspaces(id),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  agent_id VARCHAR(255),
  current_phase VARCHAR(255),
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS datasets (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES workspaces(id),
  category VARCHAR(255),
  domain VARCHAR(255),
  sample_size INTEGER DEFAULT 0,
  privacy_score FLOAT DEFAULT 0,
  walrus_blob_id VARCHAR(255),
  sui_object_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_keys (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES workspaces(id),
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  key_prefix VARCHAR(10) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_sessions_workspace ON sessions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_datasets_workspace ON datasets(workspace_id);
