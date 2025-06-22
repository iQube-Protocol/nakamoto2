
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ReconciliationControlProps {
  isReconciling: boolean;
  isRefreshing: boolean;
  onReconcile: () => void;
}

const ReconciliationControl: React.FC<ReconciliationControlProps> = ({
  isReconciling,
  isRefreshing,
  onReconcile
}) => {
  return (
    <>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
          <span className="font-medium text-yellow-800">Historical Data Cleanup</span>
        </div>
        <p className="text-sm text-yellow-700">
          This tool reconciles historical data from before the batch email system was implemented. 
          It will mark users as having received emails if they've signed up, and ensure signup completion status is accurate.
        </p>
      </div>

      <Button 
        onClick={onReconcile}
        disabled={isReconciling || isRefreshing}
        className="w-full"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isReconciling ? 'animate-spin' : ''}`} />
        {isReconciling ? 'Reconciling Data...' : 'Run Data Reconciliation'}
      </Button>
    </>
  );
};

export default ReconciliationControl;
