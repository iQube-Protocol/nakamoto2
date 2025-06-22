
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { ReconciliationResult } from '@/services/data-reconciliation';

interface ReconciliationResultsProps {
  result: ReconciliationResult;
}

const ReconciliationResults: React.FC<ReconciliationResultsProps> = ({ result }) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center mb-2">
        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
        <span className="font-medium text-green-800">Last Reconciliation Results</span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Emails reconciled:</span>
          <span className="ml-2 font-medium text-green-600">{result.emailsReconciled}</span>
        </div>
        <div>
          <span className="text-gray-600">Signups reconciled:</span>
          <span className="ml-2 font-medium text-green-600">{result.signupsReconciled}</span>
        </div>
        <div>
          <span className="text-gray-600">Duplicates handled:</span>
          <span className="ml-2 font-medium">{result.duplicatesHandled}</span>
        </div>
        <div>
          <span className="text-gray-600">Errors:</span>
          <span className="ml-2 font-medium text-red-600">{result.errors.length}</span>
        </div>
      </div>
      {result.errors.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-red-800">Errors:</p>
          <div className="text-xs text-red-700 max-h-20 overflow-y-auto">
            {result.errors.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReconciliationResults;
