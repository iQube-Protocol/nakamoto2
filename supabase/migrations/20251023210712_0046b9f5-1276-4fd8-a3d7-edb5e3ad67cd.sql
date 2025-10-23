-- Create RPCs in public schema to safely access kb schema from edge functions
-- 1) Ensure/Get corpus id
CREATE OR REPLACE FUNCTION public.ensure_corpus(
  _tenant uuid,
  _app text,
  _name text,
  _scope text,
  _description text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, kb
AS $$
DECLARE
  _id uuid;
BEGIN
  SELECT id INTO _id
  FROM kb.corpora
  WHERE tenant_id = _tenant
    AND app = _app
    AND name = _name
    AND scope = _scope
  LIMIT 1;

  IF NOT FOUND THEN
    INSERT INTO kb.corpora(tenant_id, app, name, scope, description)
    VALUES (_tenant, _app, _name, _scope, _description)
    RETURNING id INTO _id;
  END IF;

  RETURN _id;
END;
$$;

-- 2) Find doc id by unique key (corpus_id + tenant_id + title)
CREATE OR REPLACE FUNCTION public.find_kb_doc_id(
  _corpus_id uuid,
  _tenant uuid,
  _title text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, kb
AS $$
DECLARE _id uuid;
BEGIN
  SELECT id INTO _id
  FROM kb.docs
  WHERE corpus_id = _corpus_id
    AND tenant_id = _tenant
    AND title = _title
  LIMIT 1;

  RETURN _id; -- may be null
END;
$$;

-- 3) Upsert a kb doc and return id/version/updated flag
CREATE OR REPLACE FUNCTION public.upsert_kb_doc(
  _corpus_id uuid,
  _tenant uuid,
  _title text,
  _content_text text,
  _tags text[] DEFAULT NULL,
  _storage_path text DEFAULT NULL,
  _metadata jsonb DEFAULT NULL
)
RETURNS TABLE(id uuid, version integer, updated boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, kb
AS $$
DECLARE
  _existing_id uuid;
  _existing_version integer;
BEGIN
  SELECT id, version
  INTO _existing_id, _existing_version
  FROM kb.docs
  WHERE corpus_id = _corpus_id
    AND tenant_id = _tenant
    AND title = _title
  LIMIT 1;

  IF _existing_id IS NOT NULL THEN
    UPDATE kb.docs
    SET content_text = COALESCE(_content_text, content_text),
        content_type = 'text/markdown',
        tags = COALESCE(_tags, tags),
        storage_path = COALESCE(_storage_path, storage_path),
        metadata = COALESCE(_metadata, metadata),
        is_active = true,
        version = COALESCE(_existing_version, 1) + 1
    WHERE id = _existing_id
    RETURNING id, version, true INTO id, version, updated;
    RETURN;
  ELSE
    INSERT INTO kb.docs(
      corpus_id, tenant_id, title, content_text, content_type,
      tags, storage_path, metadata, is_active, version
    )
    VALUES (
      _corpus_id, _tenant, _title, COALESCE(_content_text, ''), 'text/markdown',
      COALESCE(_tags, '{}'::text[]), _storage_path, COALESCE(_metadata, '{}'::jsonb), true, 1
    )
    RETURNING id, version, false INTO id, version, updated;
    RETURN;
  END IF;
END;
$$;