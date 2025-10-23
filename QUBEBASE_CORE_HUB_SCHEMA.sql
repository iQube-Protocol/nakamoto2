-- ============================================================================
-- QubeBase Core Hub Schema Migration
-- ============================================================================
-- This script sets up the complete QubeBase multi-tenant architecture
-- Run this on your Core Hub Supabase project ONCE before migration
-- ============================================================================

-- ============================================================================
-- 1. CREATE SCHEMAS
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS app_nakamoto;
CREATE SCHEMA IF NOT EXISTS kb;
CREATE SCHEMA IF NOT EXISTS prompts;

-- ============================================================================
-- 2. APP_NAKAMOTO SCHEMA - User Migration Mapping
-- ============================================================================

-- User migration map: tracks original user IDs from Nakamoto
CREATE TABLE IF NOT EXISTS app_nakamoto.user_migration_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_user_id UUID NOT NULL,
  original_email TEXT NOT NULL,
  migrated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  tenant_id UUID NOT NULL,
  site_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(original_user_id),
  UNIQUE(original_email)
);

CREATE INDEX idx_user_migration_tenant ON app_nakamoto.user_migration_map(tenant_id);
CREATE INDEX idx_user_migration_site ON app_nakamoto.user_migration_map(site_id);

-- ============================================================================
-- 3. KB SCHEMA - Tenant-Augmented Knowledge Base
-- ============================================================================

-- Corpora: Root + Tenant-specific knowledge bases
CREATE TABLE IF NOT EXISTS kb.corpora (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  site_id TEXT NOT NULL DEFAULT 'root',
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(tenant_id, site_id)
);

CREATE INDEX idx_corpora_tenant ON kb.corpora(tenant_id);
CREATE INDEX idx_corpora_site ON kb.corpora(site_id);

-- Documents: KB documents with root/tenant scoping
CREATE TABLE IF NOT EXISTS kb.docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corpus_id UUID NOT NULL REFERENCES kb.corpora(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text/markdown',
  tags TEXT[] DEFAULT '{}',
  storage_path TEXT,
  file_size BIGINT,
  checksum TEXT,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_docs_corpus ON kb.docs(corpus_id);
CREATE INDEX idx_docs_tenant ON kb.docs(tenant_id);
CREATE INDEX idx_docs_tags ON kb.docs USING gin(tags);
CREATE INDEX idx_docs_active ON kb.docs(is_active) WHERE is_active = true;

-- Effective Docs View: Combines root + tenant-specific docs
CREATE OR REPLACE VIEW kb.v_effective_docs AS
SELECT DISTINCT ON (d.id)
  d.id,
  d.corpus_id,
  d.tenant_id,
  d.title,
  d.content,
  d.content_type,
  d.tags,
  d.storage_path,
  d.file_size,
  d.checksum,
  d.version,
  d.is_active,
  d.created_at,
  d.updated_at,
  d.metadata,
  CASE 
    WHEN d.tenant_id = '00000000-0000-0000-0000-000000000000' THEN 'root'
    ELSE 'tenant'
  END as source_type
FROM kb.docs d
WHERE d.is_active = true
ORDER BY d.id, 
  CASE 
    WHEN d.tenant_id = '00000000-0000-0000-0000-000000000000' THEN 2
    ELSE 1
  END;

-- ============================================================================
-- 4. PROMPTS SCHEMA - Tenant-Augmented System Prompts
-- ============================================================================

-- Prompts: Root + Tenant-specific system prompts
CREATE TABLE IF NOT EXISTS prompts.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  site_id TEXT NOT NULL DEFAULT 'root',
  prompt_key TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(tenant_id, site_id, prompt_key)
);

CREATE INDEX idx_prompts_tenant ON prompts.prompts(tenant_id);
CREATE INDEX idx_prompts_site ON prompts.prompts(site_id);
CREATE INDEX idx_prompts_key ON prompts.prompts(prompt_key);
CREATE INDEX idx_prompts_active ON prompts.prompts(is_active) WHERE is_active = true;

-- Effective Prompt View: Tenant overrides root
CREATE OR REPLACE VIEW prompts.v_effective_prompt AS
SELECT DISTINCT ON (p.prompt_key, COALESCE(p.tenant_id, '00000000-0000-0000-0000-000000000000'))
  p.id,
  p.tenant_id,
  p.site_id,
  p.prompt_key,
  p.prompt_text,
  p.version,
  p.is_active,
  p.created_at,
  p.updated_at,
  p.metadata,
  CASE 
    WHEN p.tenant_id = '00000000-0000-0000-0000-000000000000' THEN 'root'
    ELSE 'tenant'
  END as source_type
FROM prompts.prompts p
WHERE p.is_active = true
ORDER BY p.prompt_key, 
  COALESCE(p.tenant_id, '00000000-0000-0000-0000-000000000000'),
  CASE 
    WHEN p.tenant_id = '00000000-0000-0000-0000-000000000000' THEN 2
    ELSE 1
  END;

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE app_nakamoto.user_migration_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb.corpora ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb.docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts.prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow service role full access (for edge functions)
CREATE POLICY "Service role full access to user_migration_map"
  ON app_nakamoto.user_migration_map
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to corpora"
  ON kb.corpora
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to docs"
  ON kb.docs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to prompts"
  ON prompts.prompts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies: Authenticated users can read (for tenant-scoped queries)
CREATE POLICY "Authenticated users can read user_migration_map"
  ON app_nakamoto.user_migration_map
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read corpora"
  ON kb.corpora
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read docs"
  ON kb.docs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read prompts"
  ON prompts.prompts
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Function: Get effective KB docs for a tenant
CREATE OR REPLACE FUNCTION kb.get_effective_docs(p_tenant_id UUID)
RETURNS TABLE (
  id UUID,
  corpus_id UUID,
  tenant_id UUID,
  title TEXT,
  content TEXT,
  content_type TEXT,
  tags TEXT[],
  source_type TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    id, corpus_id, tenant_id, title, content, content_type, tags, source_type
  FROM kb.v_effective_docs
  WHERE tenant_id = '00000000-0000-0000-0000-000000000000' 
    OR tenant_id = p_tenant_id
  ORDER BY source_type DESC; -- Tenant docs override root
$$;

-- Function: Get effective prompt for a tenant
CREATE OR REPLACE FUNCTION prompts.get_effective_prompt(p_tenant_id UUID, p_prompt_key TEXT)
RETURNS TABLE (
  id UUID,
  tenant_id UUID,
  site_id TEXT,
  prompt_key TEXT,
  prompt_text TEXT,
  source_type TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    id, tenant_id, site_id, prompt_key, prompt_text, source_type
  FROM prompts.v_effective_prompt
  WHERE prompt_key = p_prompt_key
    AND (tenant_id = p_tenant_id OR tenant_id = '00000000-0000-0000-0000-000000000000')
  ORDER BY source_type DESC -- Tenant prompt overrides root
  LIMIT 1;
$$;

-- ============================================================================
-- 7. INITIALIZE ROOT DATA
-- ============================================================================

-- Create root corpus (if not exists)
INSERT INTO kb.corpora (id, tenant_id, site_id, name, description)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'root',
  'QubeBase Root Corpus',
  'Root knowledge base shared across all tenants'
)
ON CONFLICT (tenant_id, site_id) DO NOTHING;

-- Create root system prompt (if not exists)
INSERT INTO prompts.prompts (id, tenant_id, site_id, prompt_key, prompt_text)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'root',
  'system_prompt',
  'You are QubeBase AI Assistant. This is the root system prompt that can be overridden per tenant.'
)
ON CONFLICT (tenant_id, site_id, prompt_key) DO NOTHING;

-- ============================================================================
-- 8. UPDATE TIMESTAMPS TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_corpora_updated_at BEFORE UPDATE ON kb.corpora
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_docs_updated_at BEFORE UPDATE ON kb.docs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts.prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Create storage bucket 'nakamoto-kb' in Supabase UI (Storage section)
-- 2. Update bucket policies to allow service_role access
-- 3. Run your Nakamoto migration from /admin/migration page
-- ============================================================================
