import { initAgentiqClient } from '@qriptoagentiq/core-client';

let _core: ReturnType<typeof initAgentiqClient> | null = null;

export async function getCore() {
  if (!_core) _core = initAgentiqClient();
  await _core.ensureIamUser();   // mirrors auth.user -> iam.users
  return _core;
}

export function getCtx() {
  // wire these from your app's state/store
  const tenantId = window.localStorage.getItem('tenantId') || '';
  const siteId   = window.localStorage.getItem('siteId')   || '';
  return { tenantId, siteId };
}
