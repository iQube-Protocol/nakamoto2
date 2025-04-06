
import React from 'react';
import { Button } from '@/components/ui/button';

export interface ServiceConnectionProps {
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  onConnect: () => void;
}

const ServiceConnection = ({ name, icon, connected, onConnect }: ServiceConnectionProps) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <div className="flex items-center">
        <div className="p-2 bg-iqube-primary/20 rounded-md mr-3">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium">{name}</h3>
          <p className="text-xs text-muted-foreground">
            {connected ? 'Connected' : 'Not connected'}
          </p>
        </div>
      </div>
      <Button 
        size="sm"
        variant={connected ? "outline" : "default"}
        onClick={onConnect}
        className={connected ? "" : "bg-iqube-primary hover:bg-iqube-primary/90"}
      >
        {connected ? 'Disconnect' : 'Connect'}
      </Button>
    </div>
  );
};

export default ServiceConnection;
