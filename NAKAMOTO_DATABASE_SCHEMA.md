# Nakamoto Database Schema Documentation

## Overview
This document describes the Nakamoto platform database schema for migration to QubeBase Core Hub. The Nakamoto instance manages two main persona types (KNYT and Qrypto) with their associated user data, interactions, and knowledge bases.

## Core Tables

### 1. User Management

#### `profiles`
User profile information linked to auth.users
```sql
- id: uuid (PK)
- user_id: uuid (FK to auth.users, UNIQUE)
- first_name: text (nullable)
- last_name: text (nullable)
- avatar_url: text (nullable)
- email: text (nullable)
- total_points: integer (default: 0)
- level: integer (default: 1)
- civic_status: text (default: 'not_verified')
- preferences: jsonb (default: {})
- created_at: timestamptz
- updated_at: timestamptz
```

#### `invited_users`
Invitation tracking for new users
```sql
- id: uuid (PK)
- email: text (UNIQUE, NOT NULL)
- invitation_token: text (UNIQUE, NOT NULL, auto-generated)
- persona_type: text (NOT NULL) -- 'knyt' or 'qripto'
- persona_data: jsonb (NOT NULL) -- pre-filled persona information
- invited_at: timestamptz (default: now())
- invited_by: text (nullable) -- email of inviter
- batch_id: text (nullable) -- batch tracking
- signup_completed: boolean (default: false)
- completed_at: timestamptz (nullable)
- expires_at: timestamptz (default: now() + 30 days)
- email_sent: boolean (default: false)
- email_sent_at: timestamptz (nullable)
- send_attempts: integer (default: 0)
```

### 2. Persona Tables

#### `knyt_personas`
KNYT Comics persona data
```sql
- id: uuid (PK)
- user_id: uuid (FK to auth.users, UNIQUE, NOT NULL)
- created_at: timestamptz
- updated_at: timestamptz
- "First-Name": text (default: '')
- "Last-Name": text (default: '')
- "KNYT-ID": text (default: '')
- "Profession": text (default: '')
- "Local-City": text (default: '')
- "Email": text (default: '')
- "Phone-Number": text (default: '')
- "Age": text (default: '')
- "Address": text (default: '')
- "EVM-Public-Key": text (default: '')
- "BTC-Public-Key": text (default: '')
- "ThirdWeb-Public-Key": text (default: '')
- "MetaKeep-Public-Key": text (default: '')
- "Chain-IDs": text[] (default: {})
- "Web3-Interests": text[] (default: {})
- "Tokens-of-Interest": text[] (default: {})
- "Wallets-of-Interest": text[] (default: {})
- "LinkedIn-ID": text (default: '')
- "LinkedIn-Profile-URL": text (default: '')
- "Twitter-Handle": text (default: '')
- "Telegram-Handle": text (default: '')
- "Discord-Handle": text (default: '')
- "Instagram-Handle": text (default: '')
- "YouTube-ID": text (default: '')
- "Facebook-ID": text (default: '')
- "TikTok-Handle": text (default: '')
- "OM-Member-Since": text (default: '')
- "OM-Tier-Status": text (default: '')
- "Metaiye-Shares-Owned": text (default: '')
- "Total-Invested": text (default: '')
- "KNYT-COYN-Owned": text (default: '')
- "Motion-Comics-Owned": text (default: '')
- "Paper-Comics-Owned": text (default: '')
- "Digital-Comics-Owned": text (default: '')
- "KNYT-Posters-Owned": text (default: '')
- "KNYT-Cards-Owned": text (default: '')
- "Characters-Owned": text (default: '')
- profile_image_url: text (default: '')
```

#### `qripto_personas`
Qrypto/BlakQube persona data
```sql
- id: uuid (PK)
- user_id: uuid (FK to auth.users, UNIQUE, NOT NULL)
- created_at: timestamptz
- updated_at: timestamptz
- "First-Name": text (default: '')
- "Last-Name": text (default: '')
- "Qripto-ID": text (default: '')
- "Profession": text (default: '')
- "Local-City": text (default: '')
- "Email": text (default: '')
- "EVM-Public-Key": text (default: '')
- "BTC-Public-Key": text (default: '')
- "Chain-IDs": text[] (default: {})
- "Wallets-of-Interest": text[] (default: {})
- "Web3-Interests": text[] (default: {})
- "Tokens-of-Interest": text[] (default: {})
- "LinkedIn-ID": text (default: '')
- "LinkedIn-Profile-URL": text (default: '')
- "Twitter-Handle": text (default: '')
- "Telegram-Handle": text (default: '')
- "Discord-Handle": text (default: '')
- "Instagram-Handle": text (default: '')
- "GitHub-Handle": text (default: '')
- "YouTube-ID": text (default: '')
- "Facebook-ID": text (default: '')
- "TikTok-Handle": text (default: '')
```

#### `user_name_preferences`
User name display preferences
```sql
- id: uuid (PK)
- user_id: uuid (FK to auth.users, NOT NULL)
- persona_type: text (NOT NULL) -- 'knyt' or 'qripto'
- name_source: text (NOT NULL) -- 'invitation', 'linkedin', 'custom'
- custom_first_name: text (nullable)
- custom_last_name: text (nullable)
- linkedin_first_name: text (nullable)
- linkedin_last_name: text (nullable)
- invitation_first_name: text (nullable)
- invitation_last_name: text (nullable)
- created_at: timestamptz
- updated_at: timestamptz
```

### 3. Social Connections

#### `user_connections`
OAuth and social service connections
```sql
- id: uuid (PK)
- user_id: uuid (FK to auth.users, NOT NULL)
- service: text (NOT NULL) -- 'linkedin', 'metamask', 'thirdweb', etc.
- connected_at: timestamptz (default: now())
- connection_data: jsonb (nullable) -- service-specific data
- created_at: timestamptz
```

### 4. Interaction History

#### `user_interactions`
AI conversation and interaction logs
```sql
- id: uuid (PK)
- user_id: uuid (FK to auth.users, NOT NULL)
- query: text (NOT NULL)
- response: text (NOT NULL)
- interaction_type: text (NOT NULL) -- 'aigent', 'connect', 'earn', 'learn'
- metadata: jsonb (nullable)
- summarized: boolean (default: false)
- created_at: timestamptz
```

## Migration Data Structures

### UserMigrationRecord
Complete user export format for QubeBase migration:
```typescript
{
  source_user_id: string;           // Original Nakamoto user_id
  email: string;
  tenant_id: string;                // Target tenant in QubeBase
  status: 'completed' | 'invited' | 'expired';
  persona_type: 'knyt' | 'qripto';
  
  invitation_status: {
    invited_at: string;
    invited_by: string | null;
    batch_id: string | null;
    email_sent: boolean;
    email_sent_at: string | null;
    send_attempts: number;
    expires_at: string;
    signup_completed: boolean;
    completed_at: string | null;
    invitation_token: string;
  };
  
  persona_data: Record<string, any>;  // All persona fields
  
  connection_data: Array<{
    service: string;
    connected_at: string;
    connection_data: any;
  }>;
  
  name_preferences: {
    persona_type: string;
    name_source: string;
    invitation_first_name: string | null;
    invitation_last_name: string | null;
    linkedin_first_name?: string | null;
    linkedin_last_name?: string | null;
    custom_first_name?: string | null;
    custom_last_name?: string | null;
  } | null;
  
  profile: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    total_points: number;
    level: number;
  } | null;
  
  auth_user_id: string | null;      // New QubeBase auth.users.id
  auth_created_at: string | null;
  meta: Record<string, any>;        // Additional metadata
}
```

### InteractionHistory
User conversation export format:
```typescript
{
  source_user_id: string;
  query: string;
  response: string;
  interaction_type: string;         // 'aigent', 'connect', 'earn', 'learn'
  metadata: any;
  summarized: boolean;
  created_at: string;
  persona_type?: 'knyt' | 'qripto';
}
```

### KBDocument
Knowledge base document export format:
```typescript
{
  title: string;
  content_text?: string;
  source_uri?: string;
  lang?: string;                    // Default: 'en'
  tags?: string[];
  metadata?: any;
}
```

## QubeBase Core Hub Target Schema

### Migration Mapping Tables

#### `app_nakamoto.user_migration_map`
Tracks user ID mapping between Nakamoto and QubeBase
```sql
- id: uuid (PK)
- source_user_id: uuid (NOT NULL) -- Original Nakamoto user_id
- new_user_id: uuid (NOT NULL)    -- New QubeBase auth.users.id
- email: text (NOT NULL)
- tenant_id: uuid (NOT NULL)
- site_id: uuid (nullable)
- migrated_at: timestamptz (default: now())
- migration_metadata: jsonb (default: {})
```

#### `app_nakamoto.interaction_history`
Migrated interaction histories
```sql
- id: uuid (PK)
- app: text (default: 'nakamoto')
- tenant_id: uuid (NOT NULL)
- user_id: uuid (NOT NULL)         -- QubeBase user_id
- query_text: text (NOT NULL)
- response_text: text (NOT NULL)
- interaction_type: text (NOT NULL)
- persona_type: text (nullable)    -- 'knyt' or 'qripto'
- summarized: boolean (default: false)
- source_metadata: jsonb (default: {})
- occurred_at: timestamptz (NOT NULL)
- created_at: timestamptz (default: now())
```

### Knowledge Base Schema

#### `kb.corpora`
Knowledge base collections
```sql
- id: uuid (PK)
- tenant_id: uuid (NOT NULL)
- app: text (NOT NULL)             -- 'nakamoto'
- name: text (NOT NULL)            -- 'Root', tenant-specific names
- scope: text (NOT NULL)           -- 'root' or 'tenant'
- description: text (nullable)
- is_active: boolean (default: true)
- created_at: timestamptz
- updated_at: timestamptz
```

#### `kb.docs`
Knowledge base documents
```sql
- id: uuid (PK)
- corpus_id: uuid (FK to kb.corpora, NOT NULL)
- tenant_id: uuid (NOT NULL)
- title: text (NOT NULL, UNIQUE per corpus)
- content_text: text (default: '')
- content_type: text (default: 'text/markdown')
- tags: text[] (default: {})
- storage_path: text (nullable)    -- Optional file storage reference
- metadata: jsonb (default: {})
- is_active: boolean (default: true)
- version: integer (default: 1)
- created_at: timestamptz
- updated_at: timestamptz
```

#### `kb.v_effective_docs` (View)
Combines root and tenant-specific active documents

### Prompts Schema

#### `prompts.prompts`
System prompts for AI agents
```sql
- id: uuid (PK)
- app: text (NOT NULL)             -- 'nakamoto'
- tenant_id: uuid (nullable)       -- NULL for root prompts
- scope: text (NOT NULL)           -- 'root' or 'tenant'
- prompt_key: text (NOT NULL)      -- Prompt identifier
- prompt_text: text (NOT NULL)
- version: integer (default: 1)
- status: text (default: 'active') -- 'active', 'deprecated', 'draft'
- metadata: jsonb (default: {})
- created_at: timestamptz
- updated_at: timestamptz
```

#### `prompts.v_effective_prompt` (View)
Resolves tenant-specific overrides over root prompts

## Migration Flow

### 1. User Migration
```
Nakamoto → QubeBase
- Create new auth.users entry (if needed)
- Map source_user_id → new_user_id in user_migration_map
- Store all persona data in migration_metadata
- Preserve invitation status and connection data
- Track tenant assignment
```

### 2. Knowledge Base Import
```
Nakamoto KB → QubeBase kb.docs
- Create/resolve Root corpus for 'nakamoto' app
- Upsert documents (title-based deduplication)
- Set scope='root' for platform-wide KB
- Tag by domain: 'knyt', 'qryptocoyn', 'iqubes'
```

### 3. Interaction History Migration
```
user_interactions → app_nakamoto.interaction_history
- Lookup new_user_id from user_migration_map
- Preserve original timestamps (occurred_at)
- Include persona_type context
- Store original metadata in source_metadata
```

### 4. Root Prompt Setup
```
NAKAMOTO_SYSTEM_PROMPT → prompts.prompts
- app='nakamoto'
- scope='root'
- tenant_id=NULL
- Single root prompt for all tenants
```

## Data Export Sources

### Knowledge Bases
- **COYN (Qrypto)**: `src/services/coyn-knowledge-base/knowledge-data.ts`
- **KNYT**: `src/services/knyt-knowledge-base/knowledge-data.ts`
- **iQubes**: `src/services/iqubes-knowledge-base/knowledge-data.ts`

### System Prompt
- **Root Prompt**: `src/services/mondai-service.ts` → `NAKAMOTO_SYSTEM_PROMPT`

## Important Notes

1. **Tenant ID**: Root tenant = `00000000-0000-0000-0000-000000000000`
2. **User Mapping**: Essential for interaction history migration
3. **Deduplication**: KB docs deduplicated by `corpus_id` + `title`
4. **Timestamps**: All timestamps preserved from source system
5. **Array Fields**: Persona arrays (Chain-IDs, Web3-Interests, etc.) stored as PostgreSQL text[]
6. **Case-Sensitive Fields**: Persona field names use mixed case (e.g., "First-Name")
7. **Dry Run Support**: All migration functions support `dry_run=true` for validation
