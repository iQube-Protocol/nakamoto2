
// This file is now deprecated and replaced by the modular version
// Re-exporting the new implementation for backward compatibility

import { useDriveConnection as useModularDriveConnection } from './mcp/useDriveConnection';

export function useDriveConnection() {
  return useModularDriveConnection();
}
