/**
 * Service for validating document content integrity
 */
export class DocumentValidationService {
  /**
   * Validates document content to ensure it's complete and usable
   */
  validateContent(content: string | null, documentName: string, mimeType: string): { 
    isValid: boolean;
    message: string;
    content: string | null;
  } {
    // Check for null content
    if (content === null) {
      return {
        isValid: false,
        message: `Document "${documentName}" has no content`,
        content: null
      };
    }
    
    // Check for empty content
    if (content.trim().length === 0) {
      return {
        isValid: false,
        message: `Document "${documentName}" content is empty`,
        content: null
      };
    }
    
    // Check for overly short content that might indicate truncation
    if (content.length < 20 && !this.isShortContentValid(content, mimeType)) {
      return {
        isValid: false,
        message: `Document "${documentName}" content is suspiciously short (${content.length} chars)`,
        content
      };
    }
    
    // Binary file check (if content contains many unprintable characters)
    if (this.isBinaryContent(content) && !mimeType.includes('text')) {
      return {
        isValid: false,
        message: `Document "${documentName}" appears to be binary data and cannot be processed as text`,
        content: `This file (${documentName}) is a binary file of type ${mimeType} and cannot be processed as text.`
      };
    }
    
    return {
      isValid: true,
      message: `Document "${documentName}" content validated (${content.length} chars)`,
      content
    };
  }
  
  /**
   * Some short content might be valid depending on context
   */
  private isShortContentValid(content: string, mimeType: string): boolean {
    // Allow short JSON files that are valid
    if (mimeType.includes('json')) {
      try {
        JSON.parse(content);
        return true;
      } catch {
        return false;
      }
    }
    
    // Other cases where short content might be valid
    return content.trim().length > 0;
  }
  
  /**
   * Check if content appears to be binary data rather than text
   */
  private isBinaryContent(content: string): boolean {
    // Sample the first 100 characters to check for binary content
    const sample = content.slice(0, 100);
    let unprintableCount = 0;
    
    for (let i = 0; i < sample.length; i++) {
      const charCode = sample.charCodeAt(i);
      // Count characters outside normal printable ASCII range
      if (charCode < 32 && ![9, 10, 13].includes(charCode) || charCode > 126) {
        unprintableCount++;
      }
    }
    
    // If more than 15% of characters are unprintable, consider it binary
    return unprintableCount > sample.length * 0.15;
  }
}

// Singleton instance for global use
export const documentValidationService = new DocumentValidationService();
