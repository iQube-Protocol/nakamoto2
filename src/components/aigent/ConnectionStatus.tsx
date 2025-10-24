
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { KBAIServerConfig } from '@/components/shared/agent/KBAIServerConfig';
import { KBAIServerSettings } from '@/integrations/kbai/KBAIDirectService';

interface ConnectionStatusProps {
  isRetrying: boolean;
  connectionStatus: string;
  serverConfig: KBAIServerSettings;
  onConfigUpdate: (config: KBAIServerSettings) => void;
  onRetryConnection: () => Promise<void>;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isRetrying,
  connectionStatus,
  serverConfig,
  onConfigUpdate,
  onRetryConnection
}) => {
  return (
    <div className="flex items-center gap-2">
      <KBAIServerConfig 
        onConfigUpdate={onConfigUpdate}
        currentSettings={serverConfig}
      />
    
      {(connectionStatus === 'error' || connectionStatus === 'disconnected') && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetryConnection}
          disabled={isRetrying}
        >
          {isRetrying ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default ConnectionStatus;
