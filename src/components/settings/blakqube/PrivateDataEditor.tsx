
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DataSourceSelector from './DataSourceSelector';
import ReadOnlyField from './ReadOnlyField';

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
  
  // Define read-only fields for KNYT Persona
  const knytReadOnlyFields = [
    'OM-Member-Since',
    'Metaiye-Shares-Owned', 
    'Total-Invested',
    'OM-Tier-Status'
  ];

  const getSourceIcon = (key: string) => {
    // This would be passed from parent, but for now we'll use a simple implementation
    return <span className="text-xs">📊</span>;
  };

  const isReadOnlyField = (key: string) => {
    return isKNYTPersona && knytReadOnlyFields.includes(key);
  };

  return (
    <>
      <div className="max-h-[220px] overflow-y-auto pr-2">
        {Object.entries(editingData).map(([key, value]) => (
          <div key={key}>
            {isReadOnlyField(key) ? (
              <div className="flex items-center justify-between py-1 text-xs border-b border-gray-100">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {getSourceIcon(key)}
                  <span className="font-medium text-gray-600 truncate">{key}:</span>
                  <span className="truncate text-gray-500 italic">
                    {Array.isArray(value) ? value.join(', ') : value || 'Not set'}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">(Read-only)</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1 border-b pb-2 mb-2">
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
                {Array.isArray(value) ? (
                  <Input
                    value={value.join(', ')}
                    onChange={(e) => setEditingData({
                      ...editingData,
                      [key]: e.target.value.split(',').map(item => item.trim())
                    })}
                    className="h-7 text-xs"
                  />
                ) : (
                  <Input
                    value={value as string}
                    onChange={(e) => setEditingData({
                      ...editingData,
                      [key]: e.target.value
                    })}
                    className="h-7 text-xs"
                  />
                )}
              </div>
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
