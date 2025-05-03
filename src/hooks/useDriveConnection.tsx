
// Re-export the drive connection hook for backward compatibility
import { useDriveConnection as useModularDriveConnection } from './mcp/use-drive-connection';

export function useDriveConnection() {
  return useModularDriveConnection();
}
