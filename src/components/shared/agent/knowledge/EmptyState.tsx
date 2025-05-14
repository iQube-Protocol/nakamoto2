
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface EmptyStateProps {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
}

const EmptyState = ({ connectionStatus }: EmptyStateProps) => {
  return (
    <div className="col-span-full text-center py-8 text-muted-foreground">
      {connectionStatus === 'error' ? (
        <div className="flex flex-col items-center gap-3">
          <AlertTriangle className="h-12 w-12 text-amber-500" />
          <p>Connection error. Unable to load knowledge items.</p>
        </div>
      ) : (
        'No knowledge items found.'
      )}
    </div>
  );
};

export default EmptyState;
