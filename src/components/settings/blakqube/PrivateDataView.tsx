
import React from 'react';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface PrivateDataViewProps {
  privateData: { [key: string]: string | string[] };
  onEdit: () => void;
  getSourceIcon: (key: string) => JSX.Element;
}

const PrivateDataView = ({ privateData, onEdit, getSourceIcon }: PrivateDataViewProps) => {
  return (
    <>
      {Object.entries(privateData).slice(0, 6).map(([key, value]) => (
        <div key={key} className="flex justify-between items-center border-b pb-1">
          <span className="text-xs font-medium">
            {key}
          </span>
          <span className="text-xs text-muted-foreground truncate max-w-[60%] text-right flex items-center justify-end">
            {Array.isArray(value) ? value.join(", ") : value}
            <span className="ml-1.5">{getSourceIcon(key)}</span>
          </span>
        </div>
      ))}
      <div className="flex justify-between">
        <Button variant="outline" size="sm" className="mt-2" onClick={onEdit}>
          <Info className="h-3.5 w-3.5 mr-1" /> Edit Data
        </Button>
        <Button variant="outline" size="sm" className="mt-2">
          <Info className="h-3.5 w-3.5 mr-1" /> View All
        </Button>
      </div>
    </>
  );
};

export default PrivateDataView;
