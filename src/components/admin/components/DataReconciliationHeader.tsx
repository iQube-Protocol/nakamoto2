
import React from 'react';
import { Button } from '@/components/ui/button';
import { Database, Clock, RefreshCw } from 'lucide-react';

interface DataReconciliationHeaderProps {
  lastRefreshTime: Date | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

const DataReconciliationHeader: React.FC<DataReconciliationHeaderProps> = ({
  lastRefreshTime,
  isRefreshing,
  onRefresh
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Database className="h-5 w-5 mr-2" />
        Data Reconciliation & Validation
      </div>
      <div className="flex items-center space-x-2">
        {lastRefreshTime && (
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            Last updated: {lastRefreshTime.toLocaleTimeString()}
          </div>
        )}
        <Button
          onClick={onRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>
    </div>
  );
};

export default DataReconciliationHeader;
