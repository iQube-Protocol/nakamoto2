
import React from 'react';
import { Button } from '@/components/ui/button';

interface EditorActionsProps {
  onSave: () => void;
  onCancel: () => void;
}

const EditorActions = ({ onSave, onCancel }: EditorActionsProps) => {
  return (
    <div className="flex justify-between pt-2">
      <Button variant="outline" size="sm" onClick={onCancel}>
        Cancel
      </Button>
      <Button size="sm" className="bg-iqube-primary" onClick={onSave}>
        Save Changes
      </Button>
    </div>
  );
};

export default EditorActions;
