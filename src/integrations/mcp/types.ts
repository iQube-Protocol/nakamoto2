export type MCPContextMetadata = {
  userProfile?: Record<string, any>;
  environment?: string;
  modelPreference?: string;
  source?: 'google-drive' | 'local' | 'other';
  metisActive?: boolean;
  lastUpdated?: string; // Added missing property
};
