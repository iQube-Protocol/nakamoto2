
import React from 'react';
import ConnectionStatus from './ConnectionStatus';
import ReliabilityIndicator from '../shared/agent/ReliabilityIndicator';
import { KBAIServerSettings } from '@/integrations/kbai/KBAIDirectService';
import { useVeniceAgent } from '@/hooks/use-venice-agent';

interface MonDAIHeaderProps {
  isRetrying: boolean;
  connectionStatus: string;
  serverConfig: KBAIServerSettings;
  onConfigUpdate: (config: KBAIServerSettings) => void;
  onRetryConnection: () => Promise<void>;
}

const MonDAIHeader: React.FC<MonDAIHeaderProps> = ({
  isRetrying,
  connectionStatus,
  serverConfig,
  onConfigUpdate,
  onRetryConnection
}) => {
  const { veniceActivated } = useVeniceAgent();
  
  return (
    <div className="flex flex-row justify-between items-center mb-2">
      <div className="flex-1">
        {/* This is empty space for alignment */}
      </div>
      <div className="flex items-center gap-4">
        <ReliabilityIndicator 
          key={`mondai-reliability-${veniceActivated}`}
        />
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

export default MonDAIHeader;
