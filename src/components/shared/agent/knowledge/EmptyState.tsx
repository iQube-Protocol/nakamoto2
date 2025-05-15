
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  onRetryConnection?: () => void;
}

const EmptyState = ({ connectionStatus, onRetryConnection }: EmptyStateProps) => {
  return (
    <div className="col-span-full text-center py-8 text-muted-foreground">
      {connectionStatus === 'error' ? (
        <div className="flex flex-col items-center gap-3">
          <AlertTriangle className="h-12 w-12 text-amber-500" />
          <p>Connection error. Unable to load knowledge items.</p>
          {onRetryConnection && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetryConnection}
              className="mt-2"
            >
              Retry Connection
            </Button>
          )}
        </div>
      ) : (
        'No knowledge items found.'
      )}
    </div>
  );
};

export default EmptyState;
