
  /**
   * Refresh the current context
   * @returns boolean indicating success or failure
   */
  refreshContext(): boolean {
    try {
      if (this.conversationId) {
        this.persistContext();
        console.log(`MCP: Refreshed context for conversation ${this.conversationId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing context:', error);
      return false;
    }
  }

