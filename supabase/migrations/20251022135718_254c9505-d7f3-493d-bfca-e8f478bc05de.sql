-- =====================================================================
-- QubeBase Core Hub Migration Schema for Aigent Nakamoto
-- Phase 1: Database Schema Foundation (Fixed)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Create schemas
-- ---------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS app_nakamoto;
CREATE SCHEMA IF NOT EXISTS kb;
CREATE SCHEMA IF NOT EXISTS prompts;

-- ---------------------------------------------------------------------
-- 2. User Migration Map Table
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_nakamoto.user_migration_map (
  source_user_id text PRIMARY KEY,
  source_email   text NOT NULL,
  tenant_id      uuid NOT NULL,
  auth_user_id   uuid,
  iam_user_id    uuid,
  status         text,
  meta           jsonb DEFAULT '{}',
  migrated_at    timestamptz,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_app_naka_email_tenant
ON app_nakamoto.user_migration_map (lower(source_email), tenant_id);

ALTER TABLE app_nakamoto.user_migration_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access user migration map"
ON app_nakamoto.user_migration_map
FOR ALL
USING (is_admin_user());

-- ---------------------------------------------------------------------
-- 3. Knowledge Base Schema
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kb.corpora (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app text NOT NULL CHECK (app IN ('nakamoto')),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (app, name)
);

CREATE TABLE IF NOT EXISTS kb.docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  corpus_id uuid NOT NULL REFERENCES kb.corpora(id) ON DELETE CASCADE,
  scope text NOT NULL CHECK (scope IN ('root','tenant')),
  tenant_id uuid,
  title text NOT NULL,
  source_uri text,
  content_text text,
  lang text DEFAULT 'en',
  tags text[] DEFAULT '{}',
  version int DEFAULT 1,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_kb_docs_corpus ON kb.docs(corpus_id);
CREATE INDEX IF NOT EXISTS idx_kb_docs_scope_tenant ON kb.docs(scope, tenant_id);
CREATE INDEX IF NOT EXISTS idx_kb_docs_active ON kb.docs(is_active) WHERE is_active = true;

CREATE OR REPLACE VIEW kb.v_effective_docs AS
SELECT d.*
FROM kb.docs d
WHERE d.is_active = true;

CREATE TABLE IF NOT EXISTS kb.reindex_queue (
  id bigserial PRIMARY KEY,
  doc_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('upsert','delete')),
  queued_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE kb.corpora ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb.docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb.reindex_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Root KB docs readable by all"
ON kb.docs
FOR SELECT
USING (scope = 'root' AND is_active = true);

CREATE POLICY "Admins can manage all KB docs"
ON kb.docs
FOR ALL
USING (is_admin_user());

CREATE POLICY "Tenant KB docs readable by tenant"
ON kb.docs
FOR SELECT
USING (
  scope = 'tenant' 
  AND is_active = true 
  AND (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    OR is_admin_user()
  )
);

CREATE POLICY "Corpora readable by all"
ON kb.corpora
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage corpora"
ON kb.corpora
FOR ALL
USING (is_admin_user());

CREATE POLICY "Admins can access reindex queue"
ON kb.reindex_queue
FOR ALL
USING (is_admin_user());

-- ---------------------------------------------------------------------
-- 4. System Prompts Schema
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prompts.prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app text NOT NULL CHECK (app IN ('nakamoto')),
  scope text NOT NULL CHECK (scope IN ('root','tenant')),
  tenant_id uuid,
  version int NOT NULL,
  prompt_text text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  created_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

-- Create unique index with COALESCE expression
CREATE UNIQUE INDEX IF NOT EXISTS uq_prompts_app_scope_tenant_version
ON prompts.prompts(app, scope, COALESCE(tenant_id, '00000000-0000-0000-0000-000000000000'::uuid), version);

CREATE INDEX IF NOT EXISTS idx_prompts_app_scope ON prompts.prompts(app, scope);
CREATE INDEX IF NOT EXISTS idx_prompts_status ON prompts.prompts(status) WHERE status = 'active';

CREATE OR REPLACE VIEW prompts.v_effective_prompt AS
WITH root AS (
  SELECT app, MAX(version) AS v
  FROM prompts.prompts
  WHERE scope='root' AND status='active'
  GROUP BY app
),
tenant AS (
  SELECT app, tenant_id, MAX(version) AS v
  FROM prompts.prompts
  WHERE scope='tenant' AND status='active'
  GROUP BY app, tenant_id
)
SELECT
  r.app,
  t.tenant_id,
  (SELECT prompt_text FROM prompts.prompts p
     WHERE p.app=r.app AND p.scope='root' AND p.version=r.v AND p.status='active') ||
  COALESCE( E'\n\n' || (SELECT prompt_text FROM prompts.prompts p2
     WHERE p2.app=r.app AND p2.scope='tenant' AND p2.tenant_id=t.tenant_id AND p2.version=t.v AND p2.status='active'), '' )
  AS effective_prompt
FROM root r
LEFT JOIN tenant t ON t.app=r.app;

ALTER TABLE prompts.prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Root prompts readable by all"
ON prompts.prompts
FOR SELECT
USING (scope = 'root' AND status = 'active');

CREATE POLICY "Admins can manage all prompts"
ON prompts.prompts
FOR ALL
USING (is_admin_user());

CREATE POLICY "Tenant prompts readable by tenant"
ON prompts.prompts
FOR SELECT
USING (
  scope = 'tenant' 
  AND status = 'active'
  AND (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    OR is_admin_user()
  )
);

-- ---------------------------------------------------------------------
-- 5. Update triggers
-- ---------------------------------------------------------------------
DROP TRIGGER IF EXISTS update_user_migration_map_updated_at ON app_nakamoto.user_migration_map;
CREATE TRIGGER update_user_migration_map_updated_at
BEFORE UPDATE ON app_nakamoto.user_migration_map
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_kb_corpora_updated_at ON kb.corpora;
CREATE TRIGGER update_kb_corpora_updated_at
BEFORE UPDATE ON kb.corpora
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_kb_docs_updated_at ON kb.docs;
CREATE TRIGGER update_kb_docs_updated_at
BEFORE UPDATE ON kb.docs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prompts_updated_at ON prompts.prompts;
CREATE TRIGGER update_prompts_updated_at
BEFORE UPDATE ON prompts.prompts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------
-- 6. Create initial root corpus
-- ---------------------------------------------------------------------
INSERT INTO kb.corpora (app, name, description)
VALUES ('nakamoto', 'Root', 'Root knowledge base for Aigent Nakamoto - shared across all tenants')
ON CONFLICT (app, name) DO NOTHING;

-- ---------------------------------------------------------------------
-- 7. Storage bucket for KB assets
-- ---------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'nakamoto-kb',
  'nakamoto-kb',
  false,
  1073741824,
  ARRAY['text/plain', 'text/markdown', 'application/pdf', 'text/html', 'application/json']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can read KB assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'nakamoto-kb' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can upload KB assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'nakamoto-kb' AND is_admin_user());

CREATE POLICY "Admins can update KB assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'nakamoto-kb' AND is_admin_user());

CREATE POLICY "Admins can delete KB assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'nakamoto-kb' AND is_admin_user());