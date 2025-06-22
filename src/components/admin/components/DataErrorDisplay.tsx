
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle as AlertIcon } from 'lucide-react';

interface DataErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

const DataErrorDisplay: React.FC<DataErrorDisplayProps> = ({ error, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center mb-2">
        <AlertIcon className="h-4 w-4 text-red-600 mr-2" />
        <span className="font-medium text-red-800">Data Loading Error</span>
      </div>
      <p className="text-sm text-red-700">{error}</p>
      <Button
        onClick={onRetry}
        className="mt-2"
        size="sm"
        variant="outline"
      >
        Try Again
      </Button>
    </div>
  );
};

export default DataErrorDisplay;
