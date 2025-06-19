
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ReadOnlyFieldProps {
  label: string;
  value: string | string[];
  getSourceIcon: (key: string) => React.ReactNode;
  fieldKey: string;
}

const ReadOnlyField = ({ label, value, getSourceIcon, fieldKey }: ReadOnlyFieldProps) => {
  const displayValue = Array.isArray(value) ? value.join(', ') : value;
  
  return (
    <div className="space-y-1 border-b pb-2 mb-2">
      <div className="flex justify-between items-center">
        <Label className="text-xs">{label}</Label>
        <div className="flex items-center space-x-1">
          {getSourceIcon(fieldKey)}
          <span className="text-xs text-gray-500">Read-only</span>
        </div>
      </div>
      <Input
        value={displayValue}
        readOnly
        className="h-7 text-xs bg-gray-50 cursor-not-allowed"
        disabled
      />
    </div>
  );
};

export default ReadOnlyField;
