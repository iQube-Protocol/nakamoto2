
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Loader2 } from 'lucide-react';
import DataSourceSelector from './DataSourceSelector';

interface PrivateDataEditorProps {
  editingData: { [key: string]: string | string[] };
  setEditingData: (data: { [key: string]: string | string[] }) => void;
  onSave: () => void;
  onCancel: () => void;
  dataSources: {[key: string]: string};
  iQubeType: string;
  onSourceChange: (key: string, value: string) => void;
  saving?: boolean;
}

const PrivateDataEditor = ({
  editingData,
  setEditingData,
  onSave,
  onCancel,
  dataSources,
  iQubeType,
  onSourceChange,
  saving = false
}: PrivateDataEditorProps) => {
  const handleValueChange = (key: string, value: string | string[]) => {
    setEditingData({
      ...editingData,
      [key]: value
    });
  };

  const handleArrayValueChange = (key: string, newValue: string) => {
    const currentValues = Array.isArray(editingData[key]) ? editingData[key] as string[] : [];
    if (newValue.trim() && !currentValues.includes(newValue.trim())) {
      handleValueChange(key, [...currentValues, newValue.trim()]);
    }
  };

  const removeArrayItem = (key: string, index: number) => {
    const currentValues = Array.isArray(editingData[key]) ? editingData[key] as string[] : [];
    const newValues = currentValues.filter((_, i) => i !== index);
    handleValueChange(key, newValues);
  };

  return (
    <div className="space-y-4">
      {Object.entries(editingData).map(([key, value]) => (
        <div key={key} className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">{key}</label>
            <DataSourceSelector
              iQubeType={iQubeType}
              currentSource={dataSources[key] || 'manual'}
              onSourceChange={(newSource) => onSourceChange(key, newSource)}
            />
          </div>
          
          {Array.isArray(value) ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {value.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeArrayItem(key, index)}
                    />
                  </Badge>
                ))}
              </div>
              <Input
                placeholder={`Add ${key.toLowerCase()}...`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleArrayValueChange(key, e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          ) : key.toLowerCase().includes('description') || key.toLowerCase().includes('content') ? (
            <Textarea
              value={value || ''}
              onChange={(e) => handleValueChange(key, e.target.value)}
              placeholder={`Enter ${key.toLowerCase()}...`}
              rows={3}
            />
          ) : (
            <Input
              type={key.toLowerCase().includes('email') ? 'email' : 'text'}
              value={value || ''}
              onChange={(e) => handleValueChange(key, e.target.value)}
              placeholder={`Enter ${key.toLowerCase()}...`}
            />
          )}
        </div>
      ))}
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
};

export default PrivateDataEditor;
