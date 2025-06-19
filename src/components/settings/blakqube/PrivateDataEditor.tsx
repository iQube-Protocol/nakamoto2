
import React from 'react';
import PrivateDataForm from './forms/PrivateDataForm';
import EditorActions from './forms/EditorActions';
import { calculateOMTierStatus } from './utils/tierCalculator';

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
  const knytReadOnlyFields = ['OM-Member-Since', 'Metaiye-Shares-Owned', 'Total-Invested', 'OM-Tier-Status'];
  
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
      <PrivateDataForm
        editingData={editingData}
        dataSources={dataSources}
        iQubeType={iQubeType}
        isKNYTPersona={isKNYTPersona}
        onInputChange={handleInputChange}
        onArrayInputChange={handleArrayInputChange}
        onSourceChange={onSourceChange}
        formatValue={formatValue}
        isReadOnlyField={isReadOnlyField}
      />
      <EditorActions onSave={onSave} onCancel={onCancel} />
    </>
  );
};

export default PrivateDataEditor;
