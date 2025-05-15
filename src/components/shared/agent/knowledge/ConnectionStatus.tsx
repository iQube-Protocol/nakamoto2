
import React from 'react';
import { AlertCircle, WifiOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  connectionAttempts?: number;
  maxRetries?: number;
  onRetryConnection?: () => Promise<void> | void;
}

const ConnectionStatus = ({ 
  status, 
  connectionAttempts = 0, 
  maxRetries = 3,
  onRetryConnection 
}: ConnectionStatusProps) => {
  if (status === 'connected') return null;
  
  return (
    <div className={cn(
      "p-3 rounded-md text-sm flex items-center justify-between gap-2 mb-4",
      status === 'error' 
        ? 'bg-destructive/15 text-destructive border border-destructive/30' 
        : status === 'connecting'
          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
          : 'bg-slate-500/10 text-slate-500 border border-slate-500/30'
    )}>
      <div className="flex items-center gap-2">
        {status === 'connecting' ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {connectionAttempts < maxRetries ? (
              <span>Connecting to knowledge base... Attempt {connectionAttempts} of {maxRetries}</span>
            ) : (
              <span>Connection attempts exhausted</span>
            )}
          </>
        ) : (
          <>
            {status === 'error' ? (
              <AlertCircle size={16} />
            ) : (
              <WifiOff size={16} />
            )}
            <span>Connection to knowledge base failed</span>
          </>
        )}
      </div>
      
      {status === 'error' && onRetryConnection && (
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onRetryConnection}
          className="h-7 px-3 text-xs"
        >
          Retry
        </Button>
      )}
    </div>
  );
};

export default ConnectionStatus;
