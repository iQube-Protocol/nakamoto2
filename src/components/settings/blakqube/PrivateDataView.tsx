
import React from 'react';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface PrivateDataViewProps {
  privateData: { [key: string]: string | string[] };
  onEdit: () => void;
  getSourceIcon: (key: string) => JSX.Element;
}

const PrivateDataView = ({ privateData, onEdit, getSourceIcon }: PrivateDataViewProps) => {
  const formatDisplayValue = (key: string, value: string | string[]) => {
    if (key === 'Total-Invested' && typeof value === 'string' && value) {
      // Format as dollar amount if not already formatted
      const numericValue = value.replace(/[$,]/g, '');
      if (!isNaN(Number(numericValue)) && numericValue !== '') {
        return `$${Number(numericValue).toLocaleString()}`;
      }
    }
    return Array.isArray(value) ? value.join(", ") : value;
  };

  return (
    <>
      <div className="max-h-[220px] overflow-y-auto pr-2 space-y-1.5">
        {Object.entries(privateData).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center border-b pb-1">
            <span className="text-xs font-medium text-white">
              {key}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[60%] text-right flex items-center justify-end">
              {formatDisplayValue(key, value)}
              <span className="ml-1.5">{getSourceIcon(key)}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between pt-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Info className="h-3.5 w-3.5 mr-1" /> Edit Data
        </Button>
      </div>
    </>
  );
};

export default PrivateDataView;
