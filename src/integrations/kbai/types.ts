
/**
 * KBAI Knowledge Base Integration Types
 */

// Knowledge item definition
export interface KBAIKnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: string;
  source: string;
  relevance: number;
  timestamp: string;
}

// Query options for knowledge base
export interface KBAIQueryOptions {
  query?: string;
  category?: string;
  limit?: number;
  includeMetadata?: boolean;
}

// Connection status type
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// Response format from KBAI connector
export interface KBAIConnectorResponse {
  data: {
    items: any[];
    metadata?: {
      source: string;
      timestamp: string;
      error?: string;
      requestId?: string;
    };
    error?: string;
    status?: number;
  } | null;
  error: Error | null;
}

// Diagnostic result format
export interface DiagnosticResult {
  edgeFunctionHealthy?: boolean;
  corsConfigured?: boolean;
  connectionStatus?: ConnectionStatus;
  errorMessage?: string | null;
  timestamp: string;
  error?: string;
  details?: {
    edgeFunctionUrl?: string;
    [key: string]: any;
  };
}

// Cache entry structure
export interface CacheEntry<T> {
  data: T[];
  timestamp: number;
}
