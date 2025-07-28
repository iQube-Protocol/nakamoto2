
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b01be3af-b0a1-4c9d-a930-35e39397d8e5

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b01be3af-b0a1-4c9d-a930-35e39397d8e5) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b01be3af-b0a1-4c9d-a930-35e39397d8e5) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Development Lessons Learned

### User Data Reconciliation and Admin Dashboard Enhancement - 2025-07-28
**Cycles Required:** 12+ cycles
**Problem:** Dashboard showing only 118 signups when actual database contained 153 users, missing direct signups and incomplete invitation records
**Root Cause:** 
1. 32 users signed up directly without invitations, not tracked in dashboard
2. 3 users had invitation records but signup_completed flag was false despite successful signup
3. Stats calculator was using hardcoded numbers instead of real-time database queries
4. Admin interface lacked real-time persona data viewing and updates
**Solution:** 
1. **Database Reconciliation**: Created comprehensive migration to add missing invitation records for direct signups marked with 'direct_signup' batch_id
2. **Real-time Stats**: Updated StatsCalculator to query actual persona table counts instead of hardcoded values
3. **Enhanced Admin Interface**: Created UserPersonaDisplay component showing both KNYT and Qrypto persona data with real-time updates
4. **Automatic Reconciliation**: Integrated automatic reconciliation on dashboard refresh to keep data current
5. **Direct Signup Tracking**: Added new stats card and user category for users who registered outside invitation system
**Key Insights:** 
- Database reconciliation must be comprehensive and handle edge cases of users who signed up outside normal flow
- Real-time stats are critical for accurate dashboard representation
- Admin interfaces need to show complete user data including both persona types
- Automatic reconciliation on refresh ensures data stays current
- Direct signups are legitimate users that need proper tracking and representation
**Future Reference:** 
- Always use database queries for real-time stats instead of hardcoded values
- Implement comprehensive reconciliation that covers all user signup scenarios
- Build admin interfaces that update in real-time when users modify their data
- Track and properly categorize users regardless of signup method
- Regular reconciliation prevents data drift between actual users and invitation tracking

### iQube Knowledge Base Routing Issue - 2025-07-28
**Cycles Required:** 6 cycles  
**Problem:** Agent was not using iQube Knowledge Base for "contentQubes" and related terms despite being configured
**Root Cause:** Knowledge router was missing key terms like "contentqube", "dataqube", "toolqube", etc. from the iQubeTerms array
**Solution:** Added missing terms to mondai-knowledge-router.ts iQubeTerms array to ensure proper knowledge hierarchy (iQube > COYN > metaKnyts > LLM/Internet)
**Key Insights:** 
- Knowledge routing is term-dependent and requires comprehensive term mapping
- Missing terms can break the intended knowledge hierarchy
- Knowledge base priority must be explicitly defined through routing logic
**Future Reference:** 
- Maintain comprehensive term lists for knowledge routing
- Test knowledge routing with various related terms to ensure proper hierarchy
- Document knowledge priority clearly: iQube > COYN > metaKnyts > LLM/Internet

### Message Content Rendering & Lifecycle Management - July 26, 2025
**Cycles Required:** 12+ cycles
**Problem:** Complex text rendering issues with chat interface where markdown content would revert to raw markup format when users navigated away from and returned to the chat interface.

**Root Cause:** Multiple interconnected issues:
1. **Inconsistent Rendering Logic**: The MessageContent component was using `dangerouslySetInnerHTML` with DOMPurify for security but this approach wasn't stable across component lifecycle changes
2. **Memoization Instability**: React memoization wasn't properly handling component unmount/remount scenarios during navigation
3. **Key Stability**: Component keys weren't stable enough to maintain proper React reconciliation across navigation events
4. **Security vs UX Trade-off**: Security-focused HTML sanitization was causing user experience issues in single-page application context

**Solution Approach:**
1. **Replaced dangerouslySetInnerHTML with React-based rendering**: Completely rewrote the inline formatting processor to use React elements instead of HTML strings
2. **Enhanced key stability**: Implemented consistent key generation using text hashing to ensure stable component identity across renders
3. **Improved memoization strategy**: Added proper dependency arrays and stable key generation for React.useMemo and React.useCallback
4. **Lifecycle-aware processing**: Ensured all text processing functions maintain state correctly across component mount/unmount cycles

**Implementation Details:**
- **Stable Key Generation**: Used `text.length + text.charCodeAt(0)` for simple but effective key hashing
- **React Element Processing**: Converted all markup processing to return React.ReactElement arrays instead of HTML strings
- **Persistent Memoization**: Added stable keys to useCallback dependencies to prevent unnecessary re-computation
- **Navigation Resilience**: Tested thorough navigation scenarios to ensure rendering consistency

**Key Insights:**
- **Security vs Stability Trade-off**: While `dangerouslySetInnerHTML` provided strong XSS protection with DOMPurify, it created lifecycle instability in single-page applications
- **React Reconciliation Importance**: Stable keys are critical for proper React reconciliation, especially in dynamic content scenarios
- **Component Lifecycle Awareness**: Chat interfaces require special consideration for component lifecycle as users frequently navigate away and return
- **Memoization Dependencies**: React memoization requires careful consideration of dependencies, especially with complex text processing

**Critical Dependencies:**
- React's built-in memoization (useMemo, useCallback) for performance
- Stable key generation for component identity
- Proper TypeScript typing for React element arrays
- Navigation state management in single-page applications

**Future Reference:**
- **Always use React-based rendering** for dynamic text content instead of dangerouslySetInnerHTML in SPA contexts
- **Implement stable key generation** using content hashing for dynamic lists and text processing
- **Test navigation scenarios** thoroughly - reproduce mount/unmount cycles during development
- **Leverage React Developer Tools** to inspect component re-renders and key stability
- **Consider component lifecycle** when implementing complex text processing in chat interfaces

**Testing Approach:**
1. Navigate to chat interface and send messages with various formatting (bold, key terms, code blocks)
2. Navigate away to different routes (Dashboard, Settings, Profile, etc.)
3. Return to chat interface and verify text rendering remains in proper markdown format
4. Repeat multiple times to ensure consistency across navigation events
5. Check React DevTools for unnecessary re-renders and component key stability
6. Test with different message types: text, code blocks, images, diagrams

**Related Files Modified:**
- `src/components/shared/agent/message/MessageContent.tsx` - Core text rendering logic with lifecycle-aware processing
- `src/pages/Profile.tsx` - Summary page display consistency and layout improvements
- `src/components/profile/ResponseDialog.tsx` - Dialog text rendering consistency

---

### Invited User Signup Race Conditions and Data Integrity - 2025-07-21
**Cycles Required:** 12 cycles
**Problem:** Invited users were signing up successfully but missing their persona data, causing incomplete registrations and broken user experiences.
**Root Cause:** Multiple critical issues in the database layer:
- Race condition between `handle_new_user_personas()` and `handle_invited_user_signup()` triggers
- Faulty logic in persona existence checks using CASE statements in NOT EXISTS clauses
- Missing error handling and logging in trigger functions
- No monitoring or recovery mechanisms for failed signup completions

**Solution:** 
1. **Fixed Race Condition:** Modified `handle_new_user_personas()` to check for ANY invitation record existence (regardless of status) before creating default personas
2. **Simplified Logic:** Replaced complex CASE statements with straightforward OR conditions in `recover_incomplete_invited_signups()`
3. **Added Error Handling:** Implemented try-catch blocks with detailed error logging in all triggers
4. **Created Recovery Function:** Built `recover_incomplete_invited_signups()` to identify and fix broken signups from the last 7 days
5. **Added Monitoring:** Created `invitation_signup_stats` view for ongoing monitoring of signup success rates

**Key Insights:**
- Database triggers executing simultaneously can cause race conditions - always check for ANY related records, not just specific states
- Complex SQL logic (CASE in NOT EXISTS) is error-prone and should be simplified to OR/AND conditions
- Every database operation that affects user signup flow MUST have error handling and logging
- Recovery functions are essential for data integrity issues that affect user experience
- Monitoring views help catch problems before they affect too many users

**Future Reference:**
- When modifying user signup flows, test with concurrent signups to catch race conditions
- Always implement both prevention (proper trigger logic) AND recovery (cleanup functions) for critical user flows
- Use `SELECT EXISTS()` with simple conditions rather than complex CASE statements in triggers
- Monitor invitation completion rates regularly using the `invitation_signup_stats` view
- Run `SELECT * FROM public.recover_incomplete_invited_signups();` after any signup flow changes to catch broken records

**Files Modified:**
- `supabase/migrations/20250721123323-682bd7d0-f99e-4303-8490-ba67f6eebf51.sql` - Main fixes
- `supabase/migrations/20250721123535-649eeb8c-3b92-4150-9dbb-bf62e4d06a06.sql` - Simplified recovery function
- `src/services/data-reconciliation/persona-reconciler.ts` - Application-level reconciliation

**Testing Commands:**
```sql
-- Check for incomplete signups
SELECT * FROM public.recover_incomplete_invited_signups();

-- Monitor signup statistics  
SELECT * FROM public.invitation_signup_stats WHERE invitation_date >= current_date - interval '7 days';

-- Check for users without personas
SELECT au.email, iu.persona_type, iu.signup_completed 
FROM auth.users au 
JOIN public.invited_users iu ON au.email = iu.email 
WHERE iu.signup_completed = false;
```

---

### Password Reset Flow Configuration Issue - 2025-01-08
**Cycles Required:** 12+ cycles
**Problem:** Users accessing password reset URLs were being redirected to the sign-in page instead of the password reset form, causing a broken authentication flow.

**Root Cause:** 
1. **Supabase URL Configuration**: The Site URL and Redirect URLs were not properly configured in Supabase Dashboard
2. **Missing Authentication Tokens**: Password reset emails were not including the required `access_token`, `refresh_token`, and `type=recovery` parameters in the URL
3. **Overly Strict Guard Logic**: The `PasswordResetGuard` component was blocking access when tokens weren't present in the URL
4. **Auth State Management**: Complex authentication state management was causing redirect conflicts during password reset flow

**Solution:** 
1. **Updated Supabase Configuration**:
   - Set Site URL to `https://nakamoto.aigentz.me` in Supabase Dashboard
   - Added `https://nakamoto.aigentz.me/reset-password` to Redirect URLs
   - Ensured proper email template configuration for token delivery

2. **Relaxed Guard Logic**: Modified `PasswordResetGuard` to be more permissive while still providing security
3. **Enhanced Error Handling**: Added comprehensive debugging and error messages in `PasswordReset` component
4. **Fixed Auth State Conflicts**: Prevented authentication redirects during password reset flow with explicit password reset detection

**Key Insights:** 
- Supabase password reset requires proper URL configuration in the dashboard - this is not optional
- Password reset tokens should be included in email URLs automatically when configured correctly
- Guard components should be permissive for critical flows like password reset
- Authentication state management can conflict with password reset flows if not handled carefully

**Future Reference:** 
- Always verify Supabase Site URL and Redirect URLs match your deployment domain
- Test password reset emails in production environment, not just locally
- Use comprehensive logging for authentication flows to debug issues
- Consider password reset flow as a special case that may bypass normal authentication guards

### MetaMask KNYT Token Value Integration - 2025-01-08
**Cycles Required:** 8+ cycles
**Problem:** Unable to retrieve accurate KNYT token balance from MetaMask-connected wallets, resulting in incorrect or missing token values in user profiles.

**Root Cause:** 
1. **Token Contract Configuration**: Incorrect or missing KNYT token contract address and ABI configuration
2. **Network Mismatch**: KNYT token deployed on specific network (Ethereum Mainnet) but application was querying wrong network
3. **Decimals Handling**: Token balance returned in wei format without proper decimal conversion
4. **Caching Issues**: Previous incorrect values were being cached, preventing fresh token balance queries

**Solution:** 
1. **Correct Contract Configuration**:
   - Updated KNYT token contract address to the verified mainnet address
   - Implemented proper ERC-20 ABI for balance queries
   - Added network validation to ensure queries target Ethereum Mainnet

2. **Enhanced Token Service**: 
   - Created dedicated `knyt-token-service.ts` with comprehensive error handling
   - Implemented proper decimal conversion (18 decimals for KNYT)
   - Added balance caching with cache invalidation mechanisms
   - Integrated with wallet connection service for seamless updates

3. **Wallet Integration**: 
   - Enhanced `wallet-connection-service.ts` to fetch and store KNYT balances
   - Added automatic balance refresh on wallet connection
   - Implemented balance update events for real-time UI updates

**Key Insights:** 
- ERC-20 token integration requires precise contract address and ABI configuration
- Token balances must be converted from wei using the correct decimal places
- Network validation is crucial - tokens exist on specific networks only
- Caching mechanisms improve performance but require proper invalidation
- Real-time balance updates enhance user experience significantly

**Future Reference:** 
- Always verify token contract addresses on the correct network (use Etherscan)
- Implement decimal conversion: `balance / (10 ** decimals)`
- Use event-driven updates for real-time balance synchronization
- Cache token data but provide manual refresh capabilities
- Test with multiple wallet addresses to ensure consistent behavior

---

## Email Service Configuration and Troubleshooting

### Issue Resolution: Large Email Batch Database Queries

#### Problem Description
We encountered a critical issue with the `send-invitations` Supabase Edge Function where sending emails to large lists (1000+ emails) would fail with "Bad Request" database errors. The function was attempting to query the `invited_users` table with very large email arrays, which exceeded database query limits.

#### Root Cause Analysis
1. **Large Query Size**: Passing 1000+ emails in a single `IN` clause exceeded PostgreSQL query size limits
2. **Memory Constraints**: Processing large arrays in a single operation caused memory issues
3. **Timeout Issues**: Large queries took too long and timed out

#### Solution Implementation
We implemented a **batch processing approach** with the following key components:

##### 1. Batch Processing Logic
```typescript
const BATCH_SIZE = 100; // Process emails in batches of 100
const allInvitations: any[] = [];

for (let i = 0; i < validEmails.length; i += BATCH_SIZE) {
  const emailBatch = validEmails.slice(i, i + BATCH_SIZE);
  
  // Process each batch separately
  let query = supabase
    .from('invited_users')
    .select('email, invitation_token, persona_type')
    .eq('signup_completed', false)
    .gte('expires_at', new Date().toISOString());

  // Handle single vs multiple emails
  if (emailBatch.length === 1) {
    query = query.eq('email', emailBatch[0]);
  } else {
    query = query.in('email', emailBatch);
  }
}
```

##### 2. Enhanced Error Handling
- Individual batch error handling to prevent complete failure
- Detailed logging for each batch operation
- Graceful degradation when some batches fail

##### 3. Comprehensive Logging
- Added extensive logging at each step of the process
- Configuration validation logging
- Batch processing progress tracking
- Email sending success/failure tracking

#### Quick Fix for Future Developers

If you encounter similar "Bad Request" errors with large database queries:

1. **Identify the Query Size Issue**:
   ```typescript
   // Check if you're passing large arrays to database queries
   console.log('Query array size:', emailArray.length);
   ```

2. **Implement Batch Processing**:
   ```typescript
   const BATCH_SIZE = 100; // Adjust based on your needs
   
   for (let i = 0; i < largeArray.length; i += BATCH_SIZE) {
     const batch = largeArray.slice(i, i + BATCH_SIZE);
     
     // Process batch with appropriate query method
     const { data, error } = await supabase
       .from('table')
       .select('*')
       .in('column', batch); // Use .eq() for single items
   }
   ```

3. **Add Error Resilience**:
   ```typescript
   try {
     // Process batch
   } catch (batchError) {
     console.error(`Batch ${batchIndex} failed:`, batchError);
     continue; // Don't fail the entire operation
   }
   ```

#### Performance Considerations
- **Batch Size**: 100 emails per batch proved optimal for our use case
- **Concurrent Processing**: Consider using `Promise.all()` for parallel batch processing if needed
- **Rate Limiting**: Be mindful of external API rate limits (Mailjet, etc.)

#### Testing Approach
1. **Test Mode**: Implemented a `testMode` parameter to send single test emails
2. **Gradual Scaling**: Test with 10, 100, 500, then 1000+ emails
3. **Monitor Logs**: Use Supabase Edge Function logs for real-time debugging

#### Files Modified
- `supabase/functions/send-invitations/index.ts` - Main batch processing logic
- `supabase/functions/send-invitations/retry-service.ts` - Retry mechanism for failed operations

#### Key Takeaways for Future Development
1. **Always consider scale**: Design database queries to handle large datasets from the start
2. **Implement batch processing**: For any operation involving large arrays or datasets
3. **Add comprehensive logging**: Essential for debugging production issues
4. **Test at scale**: Don't just test with small datasets
5. **Design for failure**: Implement retry logic and graceful error handling
6. **Monitor edge function logs**: Use Supabase's logging for real-time debugging

This solution ensures the email invitation system can handle large-scale operations while maintaining reliability and providing detailed feedback for debugging.

---

### COYN Protocol System Enhancement and iQube Agent Framework - 2025-07-24
**Cycles Required:** 3 cycles
**Problem:** System needed enhanced understanding of COYN protocol framework and better integration of metaKnyts knowledge base while maintaining existing iQube/COYN functionality.

**Root Cause:** System prompt lacked comprehensive understanding of:
- COYN protocol as framework for data-as-asset backed cryptocurrencies
- Knowledge base hierarchy and when to use each KB
- Natural integration between real-world implementations (iQube/COYN) and mythology (metaKnyts)
- Proper utilization of existing knowledge bases vs system prompt fabrication

**Solution:**
1. **Enhanced COYN Protocol Definition**: Added comprehensive explanation of COYN as framework enabling data to be priced as quantifiable assets using iQube's Proof-of-Risk and Proof-of-Price consensus systems
2. **Established KB Hierarchy**: Implemented clear priority system (iQube > COYN > metaKnyts) with specific use cases for each
3. **Improved KB Utilization**: Added explicit instructions to always consult relevant KBs rather than relying solely on system prompt
4. **Natural Language Guidelines**: Enabled contextual use of plurals (iQubes/COYNs) while maintaining singular identity
5. **Logos/Mythos Integration**: Established philosophy where iQube/COYN are real-world "logos" and metaKnyts provides the "mythos"

**Key Insights:**
- System prompts should guide KB usage rather than replace KB content
- Knowledge base hierarchy prevents context confusion and ensures appropriate responses
- The COYN acronym (Currency of Your Network) should be emphasized when contextually appropriate
- metaKnyts responses should be grounded in actual KB content, not fabricated
- Natural integration between technical implementations and mythological frameworks enhances user experience

**Future Reference:**
- Always emphasize that COYN stands for "Currency of Your Network" when introducing the concept
- Use metaKnyts KB as PRIMARY resource for mythology/lore queries - never fabricate characters or themes
- Draw from comprehensive knowledge bases rather than making assumptions
- Maintain the hierarchy: technical queries → iQube KB, protocol queries → COYN KB, mythology → metaKnyts KB
- Enable natural language flow while preserving core identity and technical accuracy

**Files Modified:**
- `supabase/functions/mondai-ai/index.ts` - Enhanced system prompt with COYN protocol understanding and KB hierarchy

---

## Adding New iQube Agents: Complete Implementation Guide

### Overview
This section provides a comprehensive guide for adding new iQube agents that follow the established activation model used by Venice, Qrypto Persona, and KNYT Persona agents.

### Core Architecture Components

#### 1. Agent Hook Pattern
Each iQube agent requires a dedicated hook following this naming convention: `use-[agent-name]-agent.ts`

**Required Hook Structure:**
```typescript
// src/hooks/use-[agent-name]-agent.ts
import { useState, useEffect, useCallback } from 'react';

interface [AgentName]State {
  [agentName]Activated: boolean;
  [agentName]Visible: boolean;
  activate[AgentName]: () => void;
  deactivate[AgentName]: () => void;
  hide[AgentName]: () => void;
}

export function use[AgentName]Agent(): [AgentName]State {
  const STORAGE_KEY = '[agentName]Active';
  const [agentActivated, setAgentActivated] = useState(false);
  const [agentVisible, setAgentVisible] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') {
      setAgentActivated(true);
      setAgentVisible(true);
    }
  }, []);

  // Save to localStorage and dispatch events
  const activateAgent = useCallback(() => {
    setAgentActivated(true);
    setAgentVisible(true);
    localStorage.setItem(STORAGE_KEY, 'true');
    
    const event = new Event('[agentName]Activated');
    window.dispatchEvent(event);
  }, []);

  const deactivateAgent = useCallback(() => {
    setAgentActivated(false);
    setAgentVisible(false);
    localStorage.setItem(STORAGE_KEY, 'false');
    
    const event = new Event('[agentName]Deactivated');
    window.dispatchEvent(event);
  }, []);

  const hideAgent = useCallback(() => {
    setAgentVisible(false);
    setAgentActivated(false);
    localStorage.setItem(STORAGE_KEY, 'false');
    
    const event = new Event('[agentName]StateChanged');
    window.dispatchEvent(event);
  }, []);

  return {
    [agentName]Activated: agentActivated,
    [agentName]Visible: agentVisible,
    activate[AgentName]: activateAgent,
    deactivate[AgentName]: deactivateAgent,
    hide[AgentName]: hideAgent
  };
}
```

#### 2. Integration with IQubeActivationManager
Update `src/components/settings/IQubeActivationManager.tsx`:

```typescript
// Add import for new hook
import { use[AgentName]Agent } from '@/hooks/use-[agent-name]-agent';

// Add hook usage in component
const { 
  [agentName]Activated, 
  activate[AgentName], 
  deactivate[AgentName] 
} = use[AgentName]Agent();

// Add to state synchronization effect
useEffect(() => {
  setActiveQubes(prev => ({
    ...prev,
    "[Agent Display Name]": [agentName]Activated,
    // ... other agents
  }));
}, [[agentName]Activated, /* other dependencies */]);

// Add to toggle handler
const handleIQubeToggle = (event: any) => {
  // ... existing logic
  
  if (targetQubeId === "[Agent Display Name]") {
    if (isActivating) {
      activate[AgentName]();
      toast.success("[Agent Display Name] activated successfully!");
    } else {
      deactivate[AgentName]();
      toast.success("[Agent Display Name] deactivated successfully!");
    }
  }
  
  // ... rest of handler
};
```

#### 3. Integration with AgentRecommendationHandler
Update `src/components/settings/AgentRecommendationHandler.tsx`:

```typescript
// Add event handler
const handle[AgentName]Activation = () => {
  setActiveQubes(prev => ({ ...prev, "[Agent Display Name]": true }));
};

// Add event listener in useEffect
useEffect(() => {
  // ... existing listeners
  window.addEventListener('[agentName]Activated', handle[AgentName]Activation);
  
  return () => {
    // ... existing cleanup
    window.removeEventListener('[agentName]Activated', handle[AgentName]Activation);
  };
}, [setActiveQubes]);
```

#### 4. Agent Activation Modal Integration
Update `src/components/shared/agent/AgentActivationModal.tsx`:

```typescript
// Add to getAgentTitle function
const getAgentTitle = (agentName: string) => {
  switch (agentName) {
    // ... existing cases
    case '[agent-name]':
      return '[Agent Display Name]';
    default:
      return agentName;
  }
};

// Add to handleConfirmPayment function for event dispatch
if (agentName === '[agent-name]') {
  const activationEvent = new Event('[agentName]StateChanged');
  window.dispatchEvent(activationEvent);
}
```

#### 5. Agent Knowledge Base Integration
If the agent requires a dedicated knowledge base:

**Create Knowledge Base Service:**
```typescript
// src/services/[agent-name]-knowledge-base/[AgentName]KnowledgeBase.ts
// src/services/[agent-name]-knowledge-base/knowledge-data.ts
// src/services/[agent-name]-knowledge-base/types.ts
// src/services/[agent-name]-knowledge-base/index.ts
```

**Update MonDAI Knowledge Router:**
```typescript
// src/services/mondai-knowledge-router.ts
import { [AgentName]KnowledgeBase } from '@/services/[agent-name]-knowledge-base';

// Add to router logic
if (query.toLowerCase().includes('[agent-trigger-word]')) {
  return [AgentName]KnowledgeBase.searchKnowledge(query);
}
```

**Update System Prompt:**
```typescript
// supabase/functions/mondai-ai/index.ts
// Add to knowledge base hierarchy and usage instructions
```

### Implementation Checklist

When adding a new iQube agent, ensure you complete:

- [ ] Create agent-specific hook (`use-[agent-name]-agent.ts`)
- [ ] Update `IQubeActivationManager.tsx` with new hook integration
- [ ] Update `AgentRecommendationHandler.tsx` with event listeners
- [ ] Update `AgentActivationModal.tsx` with agent-specific logic
- [ ] Create knowledge base service (if needed)
- [ ] Update `mondai-knowledge-router.ts` (if knowledge base added)
- [ ] Update system prompt in `mondai-ai/index.ts` (if knowledge base added)
- [ ] Test activation/deactivation flow
- [ ] Test localStorage persistence
- [ ] Test event propagation between components
- [ ] Verify widget appears in settings interface
- [ ] Test knowledge base integration (if applicable)

### Testing Strategy

1. **Activation Flow**: Test agent activation through settings interface
2. **Persistence**: Verify state persists across browser sessions
3. **Event Handling**: Confirm all components respond to activation events
4. **Knowledge Integration**: Test knowledge base queries (if applicable)
5. **Cross-Browser**: Verify localStorage compatibility
6. **Error Handling**: Test edge cases and error scenarios

### Common Patterns to Follow

1. **Event Names**: Use camelCase for consistency (`agentNameActivated`, `agentNameDeactivated`)
2. **Storage Keys**: Use descriptive keys (`agentNameActive`)
3. **State Management**: Always sync localStorage with component state
4. **Error Boundaries**: Implement graceful fallbacks for activation failures
5. **User Feedback**: Provide toast notifications for activation state changes

This framework ensures new iQube agents integrate seamlessly with the existing ecosystem while maintaining consistency and reliability.
