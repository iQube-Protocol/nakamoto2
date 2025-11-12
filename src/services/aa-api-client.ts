import { coreHubClient } from './qubebase-core-client';

/**
 * Agentiq Agentic Accounts (AA) API Client
 * Interfaces with the AA wallet backend for asset management and payments
 */

const AA_API_BASE_URL = 'https://bsjhfvctmduxhohtllly.supabase.co/functions/v1';

export interface AssetMetadata {
  title: string;
  description: string;
  creator: string;
  contentType: string;
  tags?: string[];
  thumbnail?: string;
}

export interface AssetPolicy {
  rights: string[];
  priceAmount: number;
  priceAsset: string;
  payToDid: string;
  destChain?: string;
}

export interface Asset {
  id: string;
  sha256: string;
  metadata: AssetMetadata;
  policy?: AssetPolicy;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentQuote {
  version: string;
  requestId: string;
  assetSymbol: string;
  amount: string;
  toChain?: string;
  recipient: string;
  meta: {
    assetId: string;
    rights: string[];
  };
}

export interface Entitlement {
  id: string;
  assetId: string;
  holderDid: string;
  rights: string[];
  grantedAt: string;
  signedUrl?: string;
  playbackToken?: string;
}

/**
 * Compute SHA-256 hash of a file
 */
export async function computeSHA256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Initiate asset upload
 */
export async function initiateUpload(sha256: string, contentType: string, size: number): Promise<{ uploadUrl: string; assetId: string }> {
  const { data, error } = await coreHubClient.functions.invoke('aa-assets-upload', {
    body: { sha256, contentType, size }
  });

  if (error) throw new Error(`Failed to initiate upload: ${error.message}`);
  return data;
}

/**
 * Upload file to signed URL
 */
export async function uploadFile(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type
    }
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }
}

/**
 * Register asset with metadata
 */
export async function registerAsset(assetId: string, metadata: AssetMetadata): Promise<Asset> {
  const { data, error } = await coreHubClient.functions.invoke('aa-assets-register', {
    body: { assetId, metadata }
  });

  if (error) throw new Error(`Failed to register asset: ${error.message}`);
  return data;
}

/**
 * Set asset policy (rights, pricing, payout)
 */
export async function setAssetPolicy(assetId: string, policy: AssetPolicy): Promise<Asset> {
  const { data, error } = await coreHubClient.functions.invoke('aa-assets-policy', {
    body: { assetId, policy }
  });

  if (error) throw new Error(`Failed to set policy: ${error.message}`);
  return data;
}

/**
 * Get payment quote for asset
 */
export async function getPaymentQuote(assetId: string, buyerDid: string, destChain?: string): Promise<PaymentQuote> {
  const { data, error } = await coreHubClient.functions.invoke('aa-payments-quote', {
    body: { assetId, buyerDid, destChain }
  });

  if (error) throw new Error(`Failed to get quote: ${error.message}`);
  return data;
}

/**
 * Subscribe to payment settlement events via SSE
 */
export function subscribeToSettlement(requestId: string, onSettled: (entitlementId: string) => void, onError?: (error: Error) => void): () => void {
  const eventSource = new EventSource(`${AA_API_BASE_URL}/aa-payments-events?requestId=${requestId}`);

  eventSource.addEventListener('settlement', (event) => {
    const data = JSON.parse(event.data);
    if (data.status === 'settled') {
      onSettled(data.entitlementId);
    }
  });

  eventSource.addEventListener('error', (error) => {
    console.error('SSE error:', error);
    onError?.(new Error('Settlement stream error'));
    eventSource.close();
  });

  return () => eventSource.close();
}

/**
 * Get entitlements for an asset
 */
export async function getEntitlement(assetId: string): Promise<Entitlement> {
  const { data, error } = await coreHubClient.functions.invoke('aa-entitlements-get', {
    body: { assetId }
  });

  if (error) throw new Error(`Failed to get entitlement: ${error.message}`);
  return data;
}

/**
 * List user's assets
 */
export async function listUserAssets(): Promise<Asset[]> {
  const { data, error } = await coreHubClient.functions.invoke('aa-assets-list', {
    body: {}
  });

  if (error) throw new Error(`Failed to list assets: ${error.message}`);
  return data || [];
}

/**
 * Get asset details
 */
export async function getAsset(assetId: string): Promise<Asset> {
  const { data, error } = await coreHubClient.functions.invoke('aa-assets-get', {
    body: { assetId }
  });

  if (error) throw new Error(`Failed to get asset: ${error.message}`);
  return data;
}

/**
 * List user's purchases/entitlements
 */
export async function listUserEntitlements(): Promise<Entitlement[]> {
  const { data, error } = await coreHubClient.functions.invoke('aa-entitlements-list', {
    body: {}
  });

  if (error) throw new Error(`Failed to list entitlements: ${error.message}`);
  return data || [];
}

/**
 * DID login/authentication
 */
export async function loginWithDID(did: string, signature: string): Promise<{ token: string; user: any }> {
  const { data, error } = await coreHubClient.functions.invoke('aa-auth-login', {
    body: { did, signature }
  });

  if (error) throw new Error(`Failed to login: ${error.message}`);
  return data;
}

/**
 * Get current user's DID
 */
export async function getUserDID(): Promise<string> {
  const { data, error } = await coreHubClient.functions.invoke('aa-auth-did', {
    body: {}
  });

  if (error) throw new Error(`Failed to get DID: ${error.message}`);
  return data.did;
}

export interface ShareLink {
  shareToken: string;
  shareUrl: string;
  expiresAt: string;
  accessRights: string[];
}

/**
 * Create a shareable link for an asset
 */
export async function createShareLink(
  assetId: string, 
  expiresIn?: number, 
  accessRights?: string[]
): Promise<ShareLink> {
  const { data, error } = await coreHubClient.functions.invoke('aa-assets-share', {
    body: { assetId, expiresIn, accessRights }
  });

  if (error) throw new Error(`Failed to create share link: ${error.message}`);
  return data;
}

/**
 * Access a shared asset via token
 */
export async function getSharedAsset(shareToken: string): Promise<{ asset: Asset; entitlement: Entitlement }> {
  const { data, error } = await coreHubClient.functions.invoke('aa-assets-shared', {
    body: { shareToken }
  });

  if (error) throw new Error(`Failed to access shared asset: ${error.message}`);
  return data;
}

/**
 * Revoke a share link
 */
export async function revokeShareLink(shareToken: string): Promise<void> {
  const { data, error } = await coreHubClient.functions.invoke('aa-assets-revoke', {
    body: { shareToken }
  });

  if (error) throw new Error(`Failed to revoke share link: ${error.message}`);
}
