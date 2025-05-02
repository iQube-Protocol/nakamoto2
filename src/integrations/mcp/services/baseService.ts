
import { toast } from 'sonner';

/**
 * Base service class with shared utilities
 */
export abstract class BaseService {
  /**
   * Show error toast with consistent formatting
   */
  protected showErrorToast(title: string, error: unknown): void {
    toast.error(title, { 
      description: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
