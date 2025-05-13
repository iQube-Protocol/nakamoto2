
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, RefreshCw } from 'lucide-react';
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
  if (connectionStatus === 'connected' || connectionStatus === 'connecting') return null;
  
  const isDeploymentError = errorMessage?.includes('Edge function not') || false;
  
  return (
    <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-md flex items-center">
      <AlertTriangle className="text-amber-500 mr-2" size={18} />
      <div className="flex-1 text-sm">
        <p className="font-medium">Knowledge Base Using Fallback Data</p>
        <p className="text-muted-foreground text-xs mt-1">
          {isDeploymentError ? 
            "Edge function not deployed. MonDAI is using local fallback data." : 
            errorMessage || "Using fallback knowledge data."}
        </p>
      </div>
      <div className="flex gap-2">
        <KBAIDiagnostics
          connectionStatus={connectionStatus}
          onRunDiagnostics={onRunDiagnostics}
        />
        
        {isDeploymentError && (
          <Button
            variant="outline"
            size="sm"
            onClick={onShowHelp}
            className="border-amber-500/40 text-amber-600 hover:text-amber-700"
          >
            <Info size={14} className="mr-1" />
            Help
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onReconnect}
          className="border-amber-500/40 text-amber-600 hover:text-amber-700"
        >
          <RefreshCw size={14} className="mr-1" />
          Retry
        </Button>
      </div>
    </div>
  );
};

export default ConnectionStatusAlert;
