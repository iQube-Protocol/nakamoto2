
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  return <TooltipProvider>
      <div className="max-h-[220px] overflow-y-auto pr-2 space-y-1.5">
        {Object.entries(privateData).map(([key, value]) => {
          const displayValue = formatDisplayValue(key, value);
          const fullValue = Array.isArray(value) ? value.join(", ") : value;
          const isLongValue = fullValue && fullValue.length > 30;
          
          return (
            <div key={key} className="flex justify-between items-center border-b pb-1">
              <span className="font-medium text-white text-sm">
                {key}
              </span>
              <div className="text-muted-foreground truncate max-w-[60%] text-right flex items-center justify-end text-sm">
                {isLongValue ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="mr-1.5 cursor-help">{displayValue}</span>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[500px] p-3 z-50">
                      <div className="text-sm break-words whitespace-pre-wrap">{fullValue}</div>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span className="mr-1.5">{displayValue}</span>
                )}
                <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">
                  {getSourceIcon(key)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between pt-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Info className="h-3.5 w-3.5 mr-1" /> Edit Data
        </Button>
      </div>
    </TooltipProvider>;
};
export default PrivateDataView;
