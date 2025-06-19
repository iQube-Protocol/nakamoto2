
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit2 } from 'lucide-react';

interface PrivateDataViewProps {
  privateData: { [key: string]: string | string[] };
  onEdit: () => void;
  getSourceIcon: (key: string) => React.ReactNode;
  isKNYTPersona?: boolean;
}

const PrivateDataView = ({ privateData, onEdit, getSourceIcon, isKNYTPersona = false }: PrivateDataViewProps) => {
  return (
    <>
      <div className="max-h-[200px] overflow-y-auto pr-2">
        {Object.entries(privateData).map(([key, value]) => {
          const displayValue = Array.isArray(value) ? value.join(', ') : value;
          
          return (
            <div key={key} className="flex items-center justify-between py-1 text-xs border-b border-gray-100">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <span className="font-medium text-white truncate">{key}:</span>
                <span className="truncate text-gray-300 flex-1">
                  {displayValue || 'Not set'}
                </span>
              </div>
              <div className="ml-2">
                {getSourceIcon(key)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end pt-2">
        <Button size="sm" variant="outline" onClick={onEdit}>
          <Edit2 className="h-3 w-3 mr-1" />
          Edit Data
        </Button>
      </div>
    </>
  );
};

export default PrivateDataView;
