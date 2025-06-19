
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DataSourceSelector from './DataSourceSelector';
import ReadOnlyInputWithTooltip from './ReadOnlyInputWithTooltip';

interface PrivateDataEditorProps {
  editingData: { [key: string]: string | string[] };
  setEditingData: React.Dispatch<React.SetStateAction<{ [key: string]: string | string[] }>>;
  onSave: () => void;
  onCancel: () => void;
  dataSources: { [key: string]: string };
  iQubeType: string;
  onSourceChange: (key: string, value: string) => void;
  isKNYTPersona?: boolean;
}

// Function to calculate OM Tier Status based on investment amount
const calculateOMTierStatus = (totalInvested: string): string => {
  if (!totalInvested) return '';
  
  // Extract numeric value from string (remove $ and commas)
  const numericValue = parseFloat(totalInvested.replace(/[$,]/g, ''));
  
  if (isNaN(numericValue)) return '';
  
  if (numericValue >= 999) return 'ZeroJ+KNYT';
  if (numericValue >= 499) return 'FirstKNYT';
  if (numericValue >= 299) return 'KejiKNYT';
  if (numericValue >= 100) return 'KetaKNYT';
  
  return '';
};

const PrivateDataEditor = ({
  editingData,
  setEditingData,
  onSave,
  onCancel,
  dataSources,
  iQubeType,
  onSourceChange,
  isKNYTPersona = false
}: PrivateDataEditorProps) => {
  // Fields that should be read-only for KNYT Persona
  const knytReadOnlyFields = ['OM-Member-Since', 'Metaiye-Shares-Owned', 'Total-Invested'];
  
  const isReadOnlyField = (key: string) => {
    return isKNYTPersona && knytReadOnlyFields.includes(key);
  };

  const formatValue = (key: string, value: string | string[]) => {
    if (key === 'Total-Invested' && typeof value === 'string' && value) {
      // Format as dollar amount if not already formatted
      const numericValue = value.replace(/[$,]/g, '');
      if (!isNaN(Number(numericValue)) && numericValue !== '') {
        return `$${Number(numericValue).toLocaleString()}`;
      }
    }
    return Array.isArray(value) ? value.join(', ') : value;
  };

  const handleInputChange = (key: string, newValue: string) => {
    const updatedData = {
      ...editingData,
      [key]: newValue
    };

    // If this is KNYT Persona and Total-Invested changed, recalculate OM-Tier-Status
    if (isKNYTPersona && key === 'Total-Invested') {
      const calculatedTier = calculateOMTierStatus(newValue);
      if (calculatedTier) {
        updatedData['OM-Tier-Status'] = calculatedTier;
      }
    }

    setEditingData(updatedData);
  };

  const handleArrayInputChange = (key: string, newValue: string) => {
    setEditingData({
      ...editingData,
      [key]: newValue.split(',').map(item => item.trim())
    });
  };

  return (
    <>
      <div className="max-h-[220px] overflow-y-auto pr-2">
        {Object.entries(editingData).map(([key, value]) => (
          <div key={key} className="space-y-1 border-b pb-2 mb-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">{key}</Label>
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
                className="h-7 text-xs"
              />
            ) : Array.isArray(value) ? (
              <Input
                value={value.join(', ')}
                onChange={(e) => handleArrayInputChange(key, e.target.value)}
                className="h-7 text-xs"
              />
            ) : (
              <Input
                value={value as string}
                onChange={(e) => handleInputChange(key, e.target.value)}
                className="h-7 text-xs"
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between pt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" className="bg-iqube-primary" onClick={onSave}>
          Save Changes
        </Button>
      </div>
    </>
  );
};

export default PrivateDataEditor;
