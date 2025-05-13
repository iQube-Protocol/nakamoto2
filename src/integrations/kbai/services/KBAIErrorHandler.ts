
import { toast } from 'sonner';

/**
 * Service for handling KBAI errors and notifications
 */
export class KBAIErrorHandler {
  private hasShownDeploymentError = false;
  private lastErrorMessage: string | null = null;

  /**
   * Handle connection error and show appropriate notification
   */
  public handleConnectionError(error: unknown, isDeploymentError: boolean): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.lastErrorMessage = errorMessage;

    // Only show the toast error once per session for deployment errors
    if (isDeploymentError) {
      if (!this.hasShownDeploymentError) {
        toast.error("Knowledge Base Connection Failed", {
          description: "Edge function not deployed. Using fallback data.",
          duration: 5000
        });
        this.hasShownDeploymentError = true;
      }
    } else if (!this.hasShownDeploymentError) {
      // Show error for other types of errors
      toast.error("Knowledge base connection failed", {
        description: `Using fallback data.`
      });
    }
  }

  /**
   * Reset error state
   */
  public reset(): void {
    this.lastErrorMessage = null;
    this.hasShownDeploymentError = false;
  }

  /**
   * Get last error message
   */
  public getLastErrorMessage(): string | null {
    return this.lastErrorMessage;
  }
}
