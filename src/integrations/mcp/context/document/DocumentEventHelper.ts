
/**
 * Helper for document-related events
 */
export class DocumentEventHelper {
  /**
   * Dispatch custom event when document is updated
   */
  dispatchDocumentUpdatedEvent(documentId: string, action: 'added' | 'removed' | 'updated', details: any): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('documentContextUpdated', { 
        detail: { 
          documentId, 
          action,
          timestamp: Date.now(),
          ...details
        } 
      });
      window.dispatchEvent(event);
      console.log(`Dispatched documentContextUpdated event for ${action} action on document ${details.documentName || documentId}`);
    }
  }
}
