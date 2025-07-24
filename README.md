
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

### Infinite Loop and Performance Issues Fix - 2025-01-24
**Cycles Required:** 8+ cycles
**Problem:** The app was experiencing infinite loops with continuous API calls, slow inference times, incorrect badge display, and poor user experience due to repeated auth checks and database queries.

**Root Cause:** Multiple components were triggering unnecessary re-renders and API calls:
- Profile page using non-optimized hooks causing continuous interaction fetches
- Connection state manager with aggressive state recovery
- Auth hook making too many user session checks
- Missing circuit breakers for failing API calls (406 errors)
- Lack of request debouncing and error boundaries

**Solution:** Comprehensive optimization approach:
1. **Fixed Infinite Loops:**
   - Created `useAuthOptimized` hook with debouncing to prevent unnecessary auth checks
   - Updated Profile page to use `useUserInteractionsOptimized` with better caching
   - Optimized connection state manager with faster cleanup (2s instead of 5s)
   - Added circuit breaker pattern for failing API calls

2. **Fixed Badge Display:**
   - Corrected MetadataBadge to show "Venice - Uncensored" instead of "Venice-Uncensored"
   - Ensured provider-based display (OpenAI vs Venice) from message metadata

3. **Improved Performance:**
   - Added request caching with 5-minute staleTime and 10-minute gcTime
   - Implemented circuit breakers to prevent retry storms on 406 errors
   - Added error boundaries to prevent cascading failures
   - Optimized query client to not retry auth/406 errors

4. **Enhanced Stability:**
   - Added loading states with `LoadingSpinner` component
   - Wrapped app with `ErrorBoundary` for graceful error handling
   - Added console cleanup to reduce development noise
   - Implemented proper request timeouts and retry logic

**Key Insights:**
- React Query optimization is critical for preventing infinite loops
- Circuit breakers are essential for handling expected API failures (406 errors)
- Debouncing auth checks prevents unnecessary re-renders
- Error boundaries provide graceful degradation
- Connection state management needs aggressive cleanup for browser navigation

**Future Reference:**
- Use `useAuthOptimized` instead of `useAuth` for components that might cause loops
- Always wrap API calls with circuit breakers using `withCircuitBreaker`
- Set up proper staleTime/gcTime for React Query to prevent excessive requests
- Add error boundaries around critical components
- Use proper loading states to prevent UI freezing

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
