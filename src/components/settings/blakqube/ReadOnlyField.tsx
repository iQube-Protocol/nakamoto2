
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
    <div className="flex items-center justify-between py-1 text-xs border-b border-gray-100">
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        {getSourceIcon(fieldKey)}
        <span className="font-medium text-gray-600 truncate">{label}:</span>
        <span className="truncate text-gray-500 italic">
          {displayValue || 'Not set'}
        </span>
        <span className="text-xs text-gray-400 ml-1">(Read-only)</span>
      </div>
    </div>
  );
};

export default ReadOnlyField;
