
import React from 'react';
import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConnectionStatusProps {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  onRetryConnection?: () => Promise<void> | void;
}

const ConnectionStatus = ({ status, onRetryConnection }: ConnectionStatusProps) => {
  if (status === 'connected') return null;
  
  return (
    <div className={`p-2 rounded text-sm flex items-center justify-between gap-2 mb-4 ${
      status === 'error' 
        ? 'bg-destructive/10 text-destructive' 
        : status === 'connecting'
          ? 'bg-amber-500/10 text-amber-500'
          : 'bg-slate-500/10 text-slate-500'
    }`}>
      <div className="flex items-center gap-2">
        {status === 'connecting' ? (
          <>
            <span className="animate-pulse">●</span>
            <span>Connecting to knowledge base...</span>
          </>
        ) : (
          <>
            <WifiOff size={16} />
            <span>Disconnected from knowledge base</span>
          </>
        )}
      </div>
      
      {status !== 'connecting' && onRetryConnection && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetryConnection}
          className="h-7 px-2 text-xs"
        >
          Retry Connection
        </Button>
      )}
    </div>
  );
};

export default ConnectionStatus;
