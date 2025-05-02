
export type MCPContextMetadata = {
  userProfile?: Record<string, any>;
  environment?: string;
  modelPreference?: string;
  source?: 'google-drive' | 'local' | 'other';
  metisActive?: boolean;
  lastUpdated?: string; // Added missing property
};

export interface MCPContext {
  conversationId: string;
  documentContext?: DocumentContext[];
  messages: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  metadata: MCPContextMetadata;
}

export interface MCPClientOptions {
  serverUrl?: string;
  authToken?: string;
  metisActive?: boolean;
  onApiLoadStart?: () => void;
  onApiLoadComplete?: () => void;
}

// Add document interface for better type safety
export interface DocumentContext {
  documentId: string;
  documentName: string;
  documentType: string;
  content: string;
  summary?: string;
  lastModified?: string;
}
