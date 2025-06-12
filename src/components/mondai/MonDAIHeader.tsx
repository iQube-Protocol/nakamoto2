
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
  
  // Debug logging for MonDAI header
  console.log('MonDAIHeader: Rendering with Venice state:', veniceActivated);
  
  return (
    <div className="flex flex-row justify-between items-center mb-2">
      <div className="flex-1">
        {/* This is empty space for alignment */}
      </div>
      <div className="flex items-center gap-4">
        <ReliabilityIndicator 
          isProcessing={isRetrying} 
          key={`mondai-reliability-${veniceActivated ? 'venice' : 'base'}`}
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
