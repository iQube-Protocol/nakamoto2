
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface EmptyStateProps {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  onRetryConnection: () => void;
}

const EmptyState = ({ connectionStatus, onRetryConnection }: EmptyStateProps) => {
  return (
    <div className="col-span-full text-center py-8 text-muted-foreground">
      {connectionStatus === 'error' ? (
        <div className="flex flex-col items-center gap-3">
          <AlertTriangle className="h-12 w-12 text-amber-500" />
          <p>Connection error. Unable to load knowledge items.</p>
          <Button onClick={onRetryConnection} variant="outline">
            <RefreshCw size={16} className="mr-2" />
            Retry Connection
          </Button>
        </div>
      ) : (
        'No knowledge items found.'
      )}
    </div>
  );
};

export default EmptyState;
