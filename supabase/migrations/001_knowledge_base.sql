-- Knowledge base sources
CREATE TABLE IF NOT EXISTS kb_sources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  url text NOT NULL,
  title text NOT NULL,
  source_type text NOT NULL DEFAULT 'article',
  summary text,
  raw_content text NOT NULL,
  content_hash text UNIQUE NOT NULL,
  tags text[] DEFAULT '{}',
  favicon_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE kb_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sources" ON kb_sources FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_kb_sources_user ON kb_sources(user_id);
CREATE INDEX idx_kb_sources_type ON kb_sources(source_type);
CREATE INDEX idx_kb_sources_created ON kb_sources(created_at DESC);
CREATE INDEX idx_kb_sources_hash ON kb_sources(content_hash);
