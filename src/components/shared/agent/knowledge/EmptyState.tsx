
import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  onRetryConnection?: () => void;
}

const EmptyState = ({ connectionStatus, onRetryConnection }: EmptyStateProps) => {
  return (
    <div className="col-span-full text-center py-8">
      {connectionStatus === 'error' ? (
        <div className="flex flex-col items-center gap-3 text-destructive">
          <AlertCircle className="h-12 w-12" />
          <p>Connection to knowledge base failed.</p>
          {onRetryConnection && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={onRetryConnection}
              className="mt-2"
            >
              Retry
            </Button>
          )}
        </div>
      ) : connectionStatus === 'connecting' ? (
        <div className="flex flex-col items-center gap-3 text-amber-500">
          <Loader2 className="h-12 w-12 animate-spin" />
          <p>Connecting to knowledge base...</p>
        </div>
      ) : (
        <div className="text-muted-foreground">
          No knowledge items found.
        </div>
      )}
    </div>
  );
};

export default EmptyState;
