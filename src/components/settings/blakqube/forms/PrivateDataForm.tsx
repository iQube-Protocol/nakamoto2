
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import DataSourceSelector from '../DataSourceSelector';
import ReadOnlyInputWithTooltip from '../ReadOnlyInputWithTooltip';
import DropdownRadioSelector from './DropdownRadioSelector';

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
  
  // Define the KNYT fields that should use dropdown radio selectors
  const knytDropdownFields = {
    'Paper-Comics-Owned': Array.from({length: 13}, (_, i) => `Episode #${i}`),
    'Motion-Comics-Owned': Array.from({length: 13}, (_, i) => `Episode #${i}`),
    'Digital-Comics-Owned': Array.from({length: 13}, (_, i) => `Episode #${i}`),
    'KNYT-Posters-Owned': Array.from({length: 13}, (_, i) => `#${i}`),
    'Characters-Owned': Array.from({length: 13}, (_, i) => `#${i}`),
    'KNYT-Cards-Owned': Array.from({length: 13}, (_, i) => `Episode #${i}`)
  };

  const isKNYTDropdownField = (key: string) => {
    return isKNYTPersona && knytDropdownFields.hasOwnProperty(key);
  };

  return (
    <div className="max-h-[220px] overflow-y-auto pr-2">
      {Object.entries(editingData).map(([key, value]) => (
        <div key={key} className="space-y-1 border-b pb-2 mb-2">
          <div className="flex justify-between items-center">
            <DataSourceSelector 
              sourceKey={key}
              currentSource={dataSources[key] || 'manual'}
              iQubeType={iQubeType}
              onSourceChange={onSourceChange}
              isKNYTPersona={isKNYTPersona}
            />
          </div>
          
          {isKNYTDropdownField(key) ? (
            <DropdownRadioSelector
              label={key}
              value={value}
              onChange={(newValue) => onInputChange(key, newValue)}
              options={knytDropdownFields[key as keyof typeof knytDropdownFields]}
              fieldKey={key}
            />
          ) : isReadOnlyField(key) ? (
            <>
              <Label className="text-sm font-medium text-white">{key}</Label>
              <ReadOnlyInputWithTooltip 
                value={formatValue(key, value)}
                className="h-7 text-sm"
              />
            </>
          ) : Array.isArray(value) ? (
            <>
              <Label className="text-sm font-medium text-white">{key}</Label>
              <Input
                value={value.join(', ')}
                onChange={(e) => onArrayInputChange(key, e.target.value)}
                className="h-7 text-sm"
              />
            </>
          ) : (
            <>
              <Label className="text-sm font-medium text-white">{key}</Label>
              <Input
                value={value as string}
                onChange={(e) => onInputChange(key, e.target.value)}
                className="h-7 text-sm"
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default PrivateDataForm;
