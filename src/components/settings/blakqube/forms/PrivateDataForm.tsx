
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import DataSourceSelector from '../DataSourceSelector';
import ReadOnlyInputWithTooltip from '../ReadOnlyInputWithTooltip';

interface PrivateDataFormProps {
  editingData: { [key: string]: string | string[] };
  dataSources: { [key: string]: string };
  iQubeType: string;
  isKNYTPersona: boolean;
  onInputChange: (key: string, newValue: string) => void;
  onArrayInputChange: (key: string, newValue: string) => void;
  onSourceChange: (key: string, value: string) => void;
  formatValue: (key: string, value: string | string[]) => string;
  isReadOnlyField: (key: string) => boolean;
}

const PrivateDataForm = ({
  editingData,
  dataSources,
  iQubeType,
  isKNYTPersona,
  onInputChange,
  onArrayInputChange,
  onSourceChange,
  formatValue,
  isReadOnlyField
}: PrivateDataFormProps) => {
  return (
    <div className="max-h-[220px] overflow-y-auto pr-2">
      {Object.entries(editingData).map(([key, value]) => (
        <div key={key} className="space-y-1 border-b pb-2 mb-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-white">{key}</Label>
            <DataSourceSelector 
              sourceKey={key}
              currentSource={dataSources[key] || 'manual'}
              iQubeType={iQubeType}
              onSourceChange={onSourceChange}
              isKNYTPersona={isKNYTPersona}
            />
          </div>
          {isReadOnlyField(key) ? (
            <ReadOnlyInputWithTooltip 
              value={formatValue(key, value)}
              className="h-7 text-sm"
            />
          ) : Array.isArray(value) ? (
            <Input
              value={value.join(', ')}
              onChange={(e) => onArrayInputChange(key, e.target.value)}
              className="h-7 text-sm"
            />
          ) : (
            <Input
              value={value as string}
              onChange={(e) => onInputChange(key, e.target.value)}
              className="h-7 text-sm"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default PrivateDataForm;
