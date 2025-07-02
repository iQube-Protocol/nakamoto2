/**
 * Service for managing persona data synchronization across the application
 * Ensures consistent data display between Personal Data tab and BlakQube management
 */

export class PersonaDataSyncService {
  private static instance: PersonaDataSyncService;
  private listeners: Set<() => void> = new Set();

  private constructor() {}

  static getInstance(): PersonaDataSyncService {
    if (!PersonaDataSyncService.instance) {
      PersonaDataSyncService.instance = new PersonaDataSyncService();
    }
    return PersonaDataSyncService.instance;
  }

  /**
   * Subscribe to persona data updates
   */
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all subscribers that persona data has been updated
   */
  notifyDataUpdated(): void {
    console.log('PersonaDataSyncService: Notifying', this.listeners.size, 'listeners of data update');
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in persona data sync listener:', error);
      }
    });

    // Also trigger the legacy window event for backward compatibility
    window.dispatchEvent(new Event('privateDataUpdated'));
  }

  /**
   * Clear all listeners (useful for cleanup)
   */
  clearListeners(): void {
    this.listeners.clear();
  }
}

// Export singleton instance
export const personaDataSync = PersonaDataSyncService.getInstance();