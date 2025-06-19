
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
  // Define read-only fields for KNYT Persona
  const knytReadOnlyFields = [
    'OM-Member-Since',
    'Metaiye-Shares-Owned', 
    'Total-Invested',
    'OM-Tier-Status'
  ];

  const isReadOnlyField = (key: string) => {
    return isKNYTPersona && knytReadOnlyFields.includes(key);
  };

  return (
    <>
      <div className="max-h-[200px] overflow-y-auto pr-2">
        {Object.entries(privateData).map(([key, value]) => {
          const displayValue = Array.isArray(value) ? value.join(', ') : value;
          const isReadOnly = isReadOnlyField(key);
          
          return (
            <div key={key} className="flex items-center justify-between py-1 text-xs border-b border-gray-100">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                {getSourceIcon(key)}
                <span className="font-medium text-gray-600 truncate">{key}:</span>
                <span className={`truncate ${isReadOnly ? 'text-gray-500 italic' : 'text-gray-800'}`}>
                  {displayValue || 'Not set'}
                </span>
                {isReadOnly && (
                  <span className="text-xs text-gray-400 ml-1">(Read-only)</span>
                )}
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
