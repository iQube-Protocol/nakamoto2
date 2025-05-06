
/**
 * Service for handling localStorage operations with error handling
 */
export class LocalStorageService {
  /**
   * Safely get an item from localStorage with error handling
   */
  static getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`MCP: Error reading from localStorage for key ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Safely set an item in localStorage with error handling
   */
  static setItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`MCP: Error writing to localStorage for key ${key}:`, error);
      return false;
    }
  }
  
  /**
   * Remove an item from localStorage
   */
  static removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`MCP: Error removing from localStorage for key ${key}:`, error);
      return false;
    }
  }
  
  /**
   * Find keys in localStorage that match a pattern
   */
  static findKeys(pattern: string): string[] {
    const keys: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(pattern)) {
          keys.push(key);
        }
      }
    } catch (error) {
      console.error(`MCP: Error finding keys with pattern ${pattern}:`, error);
    }
    return keys;
  }
}
