
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const AccessControls = () => {
  return (
    <div className="mt-4 space-y-3">
      <h4 className="text-sm font-medium">Access Controls</h4>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Agent Access</Label>
          <Switch checked={true} />
        </div>
        
        <div className="flex items-center justify-between">
          <Label className="text-xs">Third-party Apps</Label>
          <Switch checked={false} />
        </div>
        
        <div className="flex items-center justify-between">
          <Label className="text-xs">Public Analytics</Label>
          <Switch checked={true} />
        </div>
      </div>
    </div>
  );
};

export default AccessControls;
