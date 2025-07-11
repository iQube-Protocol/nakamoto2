
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

interface AccessGrantsProps {
  grants?: Array<{ address: string; access: 'Full' | 'Read' }>;
  onAddAccessGrant: () => void;
}

const AccessGrants = ({ 
  grants = [
    { address: '0x391874...35F1', access: 'Full' },
    { address: '0x71C765...976F', access: 'Read' }
  ],
  onAddAccessGrant 
}: AccessGrantsProps) => {
  return (
    <div>
      <div className="flex justify-between items-center">
        <Label className="text-xs">Access Grants</Label>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-5 w-5" 
          onClick={onAddAccessGrant}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="border rounded-md p-2 mt-1 min-h-16 space-y-1 text-xs">
        {grants.map((grant, index) => (
          <div key={index} className="flex items-center justify-between p-1 bg-muted/50 rounded text-xs">
            <span className="font-mono truncate">{grant.address}</span>
            <Badge 
              className={`text-[10px] px-1 py-0 h-4 ${
                grant.access === 'Full' ? 'bg-green-500' : 'bg-blue-500'
              }`}
            >
              {grant.access}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccessGrants;
