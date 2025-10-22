# QubeBase Core Hub Migration Guide for Aigent Nakamoto

## Overview

This guide covers the complete migration of Aigent Nakamoto (~3,500 users, knowledge base, and system prompts) into the QubeBase Core Hub with tenant augmentation support.

## Migration Status

- ✅ **Phase 1 Complete:** Database schema created (app_nakamoto, kb, prompts)
- ✅ **Phase 2 Complete:** 5 Edge Functions deployed for migration utilities
- ✅ **Phase 3 Complete:** Frontend migration & upload services created
- ⏳ **Phase 4 Pending:** Actual data migration execution
- ⏳ **Phase 5 Pending:** Application refactoring to use new schema

## Architecture

### Database Schema

The migration creates 3 new schemas:

1. **app_nakamoto**: User migration tracking
   - `user_migration_map`: Maps source users → Core Hub (idempotent)

2. **kb**: Knowledge Base with tenant augmentation
   - `corpora`: Root corpus for Nakamoto
   - `docs`: Documents with scope (root/tenant)
   - `v_effective_docs`: View combining root + tenant docs
   - `reindex_queue`: For vector search updates

3. **prompts**: System Prompts with tenant augmentation
   - `prompts`: Root and tenant-specific prompts
   - `v_effective_prompt`: View combining root + tenant prompts

### Edge Functions

5 functions deployed for migration and tenant management:

1. `naka-user-migrate`: Batch user migration (supports dry-run)
2. `naka-kb-import`: Import root KB documents
3. `naka-prompt-set-root`: Set/update root system prompt
4. `naka-kb-upsert-tenant-doc`: Add/update tenant-specific KB docs
5. `naka-prompt-set-tenant`: Set tenant prompt augmentation

### Storage

- **Bucket**: `nakamoto-kb` (private)
- **Soft limit**: 500 MB (warning shown)
- **Hard limit**: 1 GiB (upload blocked)

## Pre-Migration Checklist

### 1. Data Export from Current Nakamoto

Export the following from your current database:

#### Users Export
```sql
-- Export all users with metadata
SELECT 
  id as source_user_id,
  email,
  -- Determine tenant_id based on your tenant mapping
  created_at,
  raw_user_meta_data as meta
FROM auth.users
ORDER BY created_at;
```

Save as: `nakamoto_users.json`

Format:
```json
[
  {
    "source_user_id": "uuid",
    "email": "user@example.com",
    "tenant_id": "00000000-0000-0000-0000-000000000000",
    "status": "active",
    "meta": {}
  }
]
```

#### Knowledge Base Export

Export your current knowledge base documents. Identify:
- Document titles
- Content (text or file URIs)
- Metadata (tags, language, etc.)

Save as: `nakamoto_kb.json`

Format:
```json
[
  {
    "title": "Document Title",
    "content_text": "Full text content (for small docs)",
    "source_uri": "storage-path-or-url (for large docs)",
    "lang": "en",
    "tags": ["tag1", "tag2"],
    "metadata": {}
  }
]
```

#### System Prompt Export

Extract your current root system prompt.

Save as: `nakamoto_system_prompt.txt`

### 2. Tenant Mapping

Create a CSV mapping of existing instances → tenant_id:

`tenant_mapping.csv`:
```csv
instance_name,tenant_id,description
root,00000000-0000-0000-0000-000000000000,Root Nakamoto instance
```

### 3. Password Migration Strategy

**IMPORTANT**: Passwords from auth.users are encrypted and cannot be directly exported.

Options:
1. **Magic Link (Recommended)**: Create users without passwords; send magic links
2. **Password Reset Flow**: Create users; trigger password reset emails
3. **Direct Hash Migration** (Complex): Requires Supabase Admin API with service role

The edge functions currently use Option 1 (magic links).

## Migration Execution

### Stage 1: Staging Dry-Run

Test the migration without actually changing data:

```typescript
import { migrateUsers, importKBDocuments, setRootPrompt } from '@/services/qubebase-migration-service';

// 1. Test user migration with 10 sample users
const testUsers = nakamotoUsers.slice(0, 10);
const userResult = await migrateUsers(testUsers, true); // dry_run = true
console.log('User dry-run:', userResult);

// 2. Test KB import with 5 sample docs
const testDocs = nakamotoKB.slice(0, 5);
const kbResult = await importKBDocuments(testDocs, true); // dry_run = true
console.log('KB dry-run:', kbResult);

// 3. Verify schema
const stats = await getMigrationStats();
console.log('Migration stats:', stats);
```

**Expected dry-run output:**
- Users: `{ inserted: 10, matched: 0, errors: [] }`
- KB: `{ imported: 5, skipped: 0, errors: [] }`
- Stats: All zeros (nothing actually inserted)

### Stage 2: Small Batch Test (100 users)

Migrate a small batch with actual data:

```typescript
// Migrate 100 users
const batchUsers = nakamotoUsers.slice(0, 100);
const result = await migrateUsers(batchUsers, false); // dry_run = false
console.log('Batch result:', result);

// Verify in database
const stats = await getMigrationStats();
console.log('After batch:', stats);
// Expected: { users: { total: 100, migrated: 100, errors: 0 } }
```

**Verification:**
1. Check `app_nakamoto.user_migration_map` table (should have 100 rows)
2. Check `auth.users` table (100 new users created)
3. Verify RLS policies (users can only see their own data)

### Stage 3: Full Migration

#### 3A. User Migration (Batches of 500)

```typescript
// Migrate in batches to avoid timeouts
const BATCH_SIZE = 500;
for (let i = 0; i < nakamotoUsers.length; i += BATCH_SIZE) {
  const batch = nakamotoUsers.slice(i, i + BATCH_SIZE);
  console.log(`Migrating batch ${i / BATCH_SIZE + 1}...`);
  
  const result = await migrateUsers(batch, false);
  console.log(`Batch ${i / BATCH_SIZE + 1}:`, result);
  
  // Wait between batches to avoid rate limits
  await new Promise(r => setTimeout(r, 2000));
}

// Final verification
const stats = await getMigrationStats();
console.log('Final user stats:', stats.users);
// Expected: { total: 3500, migrated: 3500, errors: 0 }
```

#### 3B. Knowledge Base Migration

```typescript
// Import all KB documents
const kbResult = await importKBDocuments(nakamotoKB, false);
console.log('KB import:', kbResult);

// Verify
const docs = await getEffectiveKBDocs();
console.log(`Total KB docs: ${docs.data?.length}`);
```

#### 3C. System Prompt Migration

```typescript
// Set the root prompt
const promptResult = await setRootPrompt(nakamotoSystemPrompt);
console.log('Prompt set:', promptResult);

// Verify
const effectivePrompt = await getEffectivePrompt();
console.log('Effective prompt length:', effectivePrompt.data?.length);
```

### Stage 4: Post-Migration

#### Send Magic Links to Users

```typescript
// Batch send magic links (requires edge function or Mailjet integration)
// This will use your existing email infrastructure
```

#### Verify Data Integrity

1. **User Count Match**:
```sql
-- Should match original count
SELECT COUNT(*) FROM app_nakamoto.user_migration_map;
SELECT COUNT(*) FROM auth.users WHERE email IN (SELECT source_email FROM app_nakamoto.user_migration_map);
```

2. **KB Docs Match**:
```sql
-- Should match original KB count
SELECT COUNT(*) FROM kb.docs WHERE scope = 'root' AND is_active = true;
```

3. **Prompt Exists**:
```sql
-- Should return 1 row
SELECT * FROM prompts.prompts WHERE app = 'nakamoto' AND scope = 'root' AND status = 'active';
```

## Tenant Augmentation Usage

### Adding Tenant-Specific KB Documents

```typescript
import { upsertTenantKBDoc } from '@/services/qubebase-migration-service';

await upsertTenantKBDoc({
  tenant_id: 'tenant-uuid',
  title: 'Tenant-Specific Guide',
  content_text: 'This is only visible to this tenant...',
  tags: ['tenant', 'custom'],
  metadata: { created_by: 'admin' }
});
```

### Setting Tenant Prompt Augmentation

```typescript
import { setTenantPrompt } from '@/services/qubebase-migration-service';

await setTenantPrompt(
  'tenant-uuid',
  'Additional instructions for this tenant: ...'
);
```

### Accessing Effective Data

```typescript
// Get effective KB (root + tenant)
const { data: docs } = await getEffectiveKBDocs('tenant-uuid');
// Returns all root docs + this tenant's specific docs

// Get effective prompt (root + tenant augmentation)
const { data: prompt } = await getEffectivePrompt('tenant-uuid');
// Returns: root prompt + "\n\n" + tenant augmentation
```

## Rollback Plan

If migration fails or issues arise:

### 1. Immediate Rollback (Within 1 hour)

The old system should remain read-only during migration. To rollback:

1. **Stop new user signups** pointing to Core Hub
2. **Revert DNS/config** to old system
3. **Re-enable writes** on old system
4. **Clean up partial migration**:

```sql
-- Delete migrated users (if needed)
TRUNCATE app_nakamoto.user_migration_map CASCADE;

-- Delete imported KB
TRUNCATE kb.docs CASCADE;

-- Delete prompts
TRUNCATE prompts.prompts CASCADE;
```

### 2. Data Recovery

- All original data remains in source tables
- Export data from `app_nakamoto.user_migration_map` if needed
- No data loss if source system is kept read-only

## Monitoring & Health Checks

### Post-Migration Monitoring

Monitor these metrics for 24 hours post-migration:

1. **Auth Success Rate**: `auth.users` login success vs failures
2. **KB Access**: `kb.v_effective_docs` query performance
3. **Prompt Retrieval**: `prompts.v_effective_prompt` query time
4. **Storage Usage**: `nakamoto-kb` bucket size
5. **Error Logs**: Edge function logs for migration functions

### Health Check Queries

```sql
-- 1. User distribution
SELECT tenant_id, COUNT(*) as user_count
FROM app_nakamoto.user_migration_map
GROUP BY tenant_id;

-- 2. KB distribution
SELECT scope, COUNT(*) as doc_count
FROM kb.docs
WHERE is_active = true
GROUP BY scope;

-- 3. Active prompts
SELECT app, scope, version, length(prompt_text) as prompt_length
FROM prompts.prompts
WHERE status = 'active';
```

## Troubleshooting

### Common Issues

#### 1. "Root corpus not found"

**Cause**: KB schema not properly initialized

**Fix**:
```sql
INSERT INTO kb.corpora (app, name, description)
VALUES ('nakamoto', 'Root', 'Root knowledge base for Aigent Nakamoto')
ON CONFLICT (app, name) DO NOTHING;
```

#### 2. "Permission denied for schema"

**Cause**: RLS policy not matching current user

**Fix**: Ensure `is_admin_user()` function works correctly, or temporarily disable RLS for migration:
```sql
ALTER TABLE app_nakamoto.user_migration_map DISABLE ROW LEVEL SECURITY;
-- Run migration
ALTER TABLE app_nakamoto.user_migration_map ENABLE ROW LEVEL SECURITY;
```

#### 3. "Duplicate key value violates unique constraint"

**Cause**: Running migration twice

**Fix**: Migrations are idempotent; this is expected. Check logs for actual errors.

## Support Contacts

For migration issues:
- Database Issues: Check Supabase logs
- Edge Function Errors: Review function logs in Supabase dashboard
- Auth Problems: Verify auth.users table and RLS policies

## Next Steps

After successful migration:

1. ✅ Verify all users can log in (via magic links)
2. ✅ Test KB access for authenticated users
3. ✅ Verify effective prompts contain root + tenant augmentation
4. ✅ Monitor for 24 hours
5. ⏳ Phase 4: Refactor app to use new QubeBase SDK patterns
6. ⏳ Decommission old system (after 7-day grace period)

## Migration Completion Checklist

- [ ] Staging dry-run completed successfully
- [ ] Small batch (100 users) migrated and verified
- [ ] Full user migration (3,500 users) completed
- [ ] KB documents imported and accessible
- [ ] Root system prompt set
- [ ] Magic links sent to all users
- [ ] RLS policies verified for security
- [ ] Monitoring dashboards set up
- [ ] 24-hour observation period completed
- [ ] Old system decommissioned

---

**Document Version**: 1.0
**Last Updated**: 2025
**Migration Schema Version**: v1
