// QubeBase SDK integration - will be activated once package is fully installed
// import { initAgentiqClient } from '@qriptoagentiq/core-client';

// let _core: ReturnType<typeof initAgentiqClient> | null = null;

// Temporary placeholder until SDK package is available
let _core: any = null;

export async function getCore() {
  // TODO: Uncomment once @qriptoagentiq/core-client package is installed
  /*
  if (!_core) {
    // Initialize with Core Hub credentials
    _core = initAgentiqClient({
      supabaseUrl: 'https://bsjhfvctmduxhohtllly.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzamhmdmN0bWR1eGhvaHRsbGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDgyNTgsImV4cCI6MjA3MzEyNDI1OH0.vN9Y_xHQqXqWLQQfnUfhqJI-EjOx5ov-F8G0qKdQjOo'
    });
  }
  await _core.ensureIamUser(); // mirrors auth.user -> iam.users in Core Hub
  return _core;
  */
  throw new Error('QubeBase SDK package installation pending. Use qubebase-core-client.ts for now.');
}

export function getCtx() {
  // wire these from your app's state/store
  const tenantId = window.localStorage.getItem('tenantId') || '';
  const siteId   = window.localStorage.getItem('siteId')   || '';
  return { tenantId, siteId };
}
