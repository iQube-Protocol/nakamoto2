
/**
 * Manages events related to context changes
 */
export class ContextEventManager {
  /**
   * Dispatch an event when document context is updated
   */
  dispatchDocumentEvent(action: 'added' | 'removed', documentId: string, documentName?: string): void {
    try {
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('documentContextUpdated', {
          detail: { documentId, documentName, action }
        });
        window.dispatchEvent(event);
        console.log(`Event dispatched for document ${action}: ${documentName || documentId}`);
      }
    } catch (eventError) {
      console.error('Error dispatching document context updated event:', eventError);
    }
  }
}
