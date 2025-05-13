
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, RefreshCw, Loader2 } from 'lucide-react';
import KBAIDiagnostics from './KBAIDiagnostics';
import { DiagnosticResult } from '@/integrations/kbai/types';

interface ConnectionStatusAlertProps {
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  errorMessage?: string | null;
  onReconnect: () => void;
  onShowHelp: () => void;
  onRunDiagnostics: () => Promise<DiagnosticResult>;
}

const ConnectionStatusAlert: React.FC<ConnectionStatusAlertProps> = ({
  connectionStatus,
  errorMessage,
  onReconnect,
  onShowHelp,
  onRunDiagnostics
}) => {
  const [isReconnecting, setIsReconnecting] = React.useState(false);
  
  if (connectionStatus === 'connected') return null;
  if (connectionStatus === 'connecting') {
    return (
      <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-md flex items-center">
        <Loader2 className="text-blue-500 mr-2 animate-spin" size={18} />
        <div className="flex-1 text-sm">
          <p className="font-medium">Connecting to Knowledge Base</p>
          <p className="text-muted-foreground text-xs mt-1">
            Establishing connection to KBAI service...
          </p>
        </div>
      </div>
    );
  }
  
  const isDeploymentError = errorMessage?.includes('Edge function not') || 
                           errorMessage?.includes('deployed') ||
                           errorMessage?.includes('NetworkError') ||
                           errorMessage?.includes('timed out') ||
                           false;
  
  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      await onReconnect();
    } finally {
      setIsReconnecting(false);
    }
  };
  
  return (
    <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-md flex flex-col gap-3">
      <div className="flex items-center">
        <AlertTriangle className="text-amber-500 mr-2 flex-shrink-0" size={18} />
        <div className="flex-1 text-sm">
          <p className="font-medium">Knowledge Base Using Fallback Data</p>
          <p className="text-muted-foreground text-xs mt-1">
            {isDeploymentError ? 
              "Edge function not deployed correctly or inaccessible. MonDAI is using local fallback data." : 
              errorMessage || "Using fallback knowledge data."}
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 items-center justify-end">
        <KBAIDiagnostics
          connectionStatus={connectionStatus}
          onRunDiagnostics={onRunDiagnostics}
        />
        
        {(isDeploymentError || connectionStatus === 'error') && (
          <Button
            variant="outline"
            size="sm"
            onClick={onShowHelp}
            className="border-amber-500/40 text-amber-600 hover:text-amber-700"
          >
            <Info size={14} className="mr-1" />
            Deployment Help
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleReconnect}
          disabled={isReconnecting}
          className="border-amber-500/40 text-amber-600 hover:text-amber-700"
        >
          {isReconnecting ? (
            <>
              <Loader2 size={14} className="mr-1 animate-spin" />
              Reconnecting...
            </>
          ) : (
            <>
              <RefreshCw size={14} className="mr-1" />
              Retry Connection
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ConnectionStatusAlert;
