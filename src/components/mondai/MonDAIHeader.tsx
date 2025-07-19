
import React from 'react';
import ConnectionStatus from './ConnectionStatus';
import DotScore from '../shared/DotScore';
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
  
  // Calculate Trust and Reliability scores based on connection status
  const calculateScores = () => {
    const baseAccuracy = connectionStatus === 'connected' ? 8.5 : 7.0;
    const baseVerifiability = connectionStatus === 'connected' ? 8.0 : 6.5;
    const baseRisk = connectionStatus === 'connected' ? 2.0 : 3.5;
    
    const trustScore = (baseAccuracy + baseVerifiability) / 2;
    const reliabilityScore = (baseAccuracy + baseVerifiability + (10 - baseRisk)) / 3;
    
    return { trustScore, reliabilityScore };
  };
  
  const { trustScore, reliabilityScore } = calculateScores();
  
  return (
    <div className="flex flex-row justify-between items-center mb-2">
      <div className="flex-1">
        {/* This is empty space for alignment */}
      </div>
      <div className="flex items-center gap-4">
        <DotScore 
          value={reliabilityScore}
          label="Reliability"
          key={`mondai-reliability-${veniceActivated}`}
        />
        <DotScore 
          value={trustScore}
          label="Trust"
          key={`mondai-trust-${veniceActivated}`}
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
