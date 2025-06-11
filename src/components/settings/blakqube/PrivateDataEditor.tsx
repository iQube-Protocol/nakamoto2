
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DataSourceSelector from './DataSourceSelector';

interface PrivateDataEditorProps {
  editingData: { [key: string]: string | string[] };
  setEditingData: React.Dispatch<React.SetStateAction<{ [key: string]: string | string[] }>>;
  onSave: () => void;
  onCancel: () => void;
  dataSources: { [key: string]: string };
  iQubeType: string;
  onSourceChange: (key: string, value: string) => void;
}

const PrivateDataEditor = ({
  editingData,
  setEditingData,
  onSave,
  onCancel,
  dataSources,
  iQubeType,
  onSourceChange
}: PrivateDataEditorProps) => {
  const dataEntries = Object.entries(editingData);
  
  return (
    <>
      <div className="max-h-[220px] overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {dataEntries.map(([key, value]) => (
            <div key={key} className="space-y-1 border-b pb-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs">{key}</Label>
                <DataSourceSelector 
                  sourceKey={key}
                  currentSource={dataSources[key] || 'manual'}
                  iQubeType={iQubeType}
                  onSourceChange={onSourceChange}
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
          ))}
        </div>
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
