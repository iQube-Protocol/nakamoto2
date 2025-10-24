
import React from 'react';
import ConnectionStatus from './ConnectionStatus';
import { KBAIServerSettings } from '@/integrations/kbai/KBAIDirectService';

interface AigentHeaderProps {
  isRetrying: boolean;
  connectionStatus: string;
  serverConfig: KBAIServerSettings;
  onConfigUpdate: (config: KBAIServerSettings) => void;
  onRetryConnection: () => Promise<void>;
}

const AigentHeader: React.FC<AigentHeaderProps> = ({
  isRetrying,
  connectionStatus,
  serverConfig,
  onConfigUpdate,
  onRetryConnection
}) => {
  return (
    <div className="flex flex-row justify-between items-center mb-2">
      <div className="flex-1">
        {/* This is empty space for alignment */}
      </div>
      <div className="flex items-center gap-4">
        <ConnectionStatus
          isRetrying={isRetrying}
          connectionStatus={connectionStatus}
          serverConfig={serverConfig}
          onConfigUpdate={onConfigUpdate}
          onRetryConnection={onRetryConnection}
        />
      </div>
    </div>
  );
};

export default AigentHeader;
