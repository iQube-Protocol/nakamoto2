import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
export interface ServiceConnectionProps {
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  onConnect: () => void;
  isProcessing?: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
}
const ServiceConnection = ({
  name,
  icon,
  connected,
  onConnect,
  isProcessing = false,
  disabled = false,
  comingSoon = false
}: ServiceConnectionProps) => {
  const getStatusText = () => {
    if (isProcessing) {
      return connected ? 'Disconnecting...' : 'Connecting...';
    }
    if (comingSoon) {
      return 'Coming Soon';
    }
    return connected ? 'Connected' : 'Not connected';
  };
  const getButtonText = () => {
    if (isProcessing) {
      return connected ? 'Disconnecting...' : 'Connecting...';
    }
    if (comingSoon) {
      return 'Coming Soon';
    }
    return connected ? 'Disconnect' : 'Connect';
  };
  return <div className="flex items-center justify-between p-3 border rounded-md">
      <div className="flex items-center">
        <div className="p-2 bg-iqube-primary/20 rounded-md mr-3">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">{name}</h3>
            {comingSoon}
          </div>
          <p className="text-xs text-muted-foreground">
            {getStatusText()}
          </p>
        </div>
      </div>
      <Button size="sm" variant={connected ? "outline" : "default"} onClick={onConnect} disabled={isProcessing || disabled || comingSoon} className={`${connected && !isProcessing ? "" : "bg-iqube-primary hover:bg-iqube-primary/90"} ${disabled || comingSoon ? "opacity-50" : ""}`}>
        {isProcessing && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
        {getButtonText()}
      </Button>
    </div>;
};
export default ServiceConnection;