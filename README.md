
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
