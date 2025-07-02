
import React from 'react';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
interface PrivateDataViewProps {
  privateData: {
    [key: string]: string | string[];
  };
  onEdit: () => void;
  getSourceIcon: (key: string) => JSX.Element;
}
const PrivateDataView = ({
  privateData,
  onEdit,
  getSourceIcon
}: PrivateDataViewProps) => {
  console.log('PrivateDataView: Rendering with data:', {
    keys: Object.keys(privateData),
    first_name: privateData['First-Name'],
    last_name: privateData['Last-Name'],
    email: privateData['Email'],
    total_fields: Object.keys(privateData).length
  });

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

  // Filter out empty values for display
  const filteredData = Object.entries(privateData).filter(([key, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== null && value !== undefined && value !== '';
  });

  console.log('PrivateDataView: Filtered data for display:', {
    original_count: Object.keys(privateData).length,
    filtered_count: filteredData.length,
    filtered_keys: filteredData.map(([key]) => key)
  });
  return <>
      <div className="max-h-[220px] overflow-y-auto pr-2 space-y-1.5">
        {filteredData.map(([key, value]) => <div key={key} className="flex justify-between items-center border-b pb-1">
            <span className="font-medium text-white text-sm">
              {key}
            </span>
            <div className="text-muted-foreground truncate max-w-[60%] text-right flex items-center justify-end text-sm">
              <span className="mr-1.5">{formatDisplayValue(key, value)}</span>
              <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">
                {getSourceIcon(key)}
              </div>
            </div>
          </div>)}
      </div>
      <div className="flex justify-between pt-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Info className="h-3.5 w-3.5 mr-1" /> Edit Data
        </Button>
      </div>
    </>;
};
export default PrivateDataView;
