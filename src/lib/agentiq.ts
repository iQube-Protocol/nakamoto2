// QubeBase SDK integration - temporarily commented until SDK is fully configured
// import { initAgentiqClient } from '@qriptoagentiq/core-client';

// let _core: ReturnType<typeof initAgentiqClient> | null = null;

// Placeholder until SDK is configured
let _core: any = null;

export async function getCore() {
  // TODO: Uncomment once SDK is available
  // if (!_core) _core = initAgentiqClient();
  // await _core.ensureIamUser();
  throw new Error('QubeBase SDK not yet configured');
}

export function getCtx() {
  // wire these from your app's state/store
  const tenantId = window.localStorage.getItem('tenantId') || '';
  const siteId   = window.localStorage.getItem('siteId')   || '';
  return { tenantId, siteId };
}
