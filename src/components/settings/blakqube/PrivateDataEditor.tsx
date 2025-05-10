
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
  return (
    <>
      {Object.entries(editingData).map(([key, value]) => (
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
      <div className="flex justify-between">
        <Button variant="outline" size="sm" className="mt-2" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" className="mt-2 bg-iqube-primary" onClick={onSave}>
          Save Changes
        </Button>
      </div>
    </>
  );
};

export default PrivateDataEditor;
