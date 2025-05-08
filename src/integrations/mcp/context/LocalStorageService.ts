
import { MCPContext } from '../types';
import { ContextStorageService, StorageOptions } from './types';

/**
 * Service for storing MCP context in browser's localStorage
 */
export class LocalStorageService implements ContextStorageService {
  private storage: Storage;
  private keyPrefix: string;
  
  constructor(options: StorageOptions = {}) {
    this.storage = options.storage || localStorage;
    this.keyPrefix = options.keyPrefix || 'mcp-context-';
  }
  
  /**
   * Save context to storage
   */
  saveContext(conversationId: string, context: MCPContext): void {
    try {
      const key = `${this.keyPrefix}${conversationId}`;
      this.storage.setItem(key, JSON.stringify(context));
    } catch (error) {
      console.error('Error saving context to storage:', error);
    }
  }
  
  /**
   * Load context from storage
   */
  loadContext(conversationId: string): MCPContext | null {
    try {
      const key = `${this.keyPrefix}${conversationId}`;
      const storedContext = this.storage.getItem(key);
      
      if (storedContext) {
        return JSON.parse(storedContext);
      }
    } catch (error) {
      console.error('Error loading context from storage:', error);
    }
    
    return null;
  }
  
  /**
   * Remove context from storage
   */
  removeContext(conversationId: string): boolean {
    try {
      const key = `${this.keyPrefix}${conversationId}`;
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing context from storage:', error);
      return false;
    }
  }
}
