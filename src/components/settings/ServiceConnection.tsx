
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { connectionStateManager } from '@/services/connection-state-manager';
import { connectionService } from '@/services/connection-service';

export interface ServiceConnectionProps {
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  onConnect: () => void;
  isProcessing?: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
  service: string;
}

const ServiceConnection = ({
  name,
  icon,
  connected,
  onConnect,
  isProcessing = false,
  disabled = false,
  comingSoon = false,
  service
}: ServiceConnectionProps) => {
  const [connectionState, setConnectionState] = useState<string>('idle');
  const serviceKey = name.toLowerCase().replace(/\s+/g, '').replace('metamask', 'wallet').replace('linkedin', 'linkedin');

  useEffect(() => {
    const handleConnectionStateChange = (event: CustomEvent) => {
      if (event.detail.service === serviceKey || 
          (serviceKey === 'wallet' && event.detail.service === 'wallet')) {
        setConnectionState(event.detail.state);
      }
    };

    window.addEventListener('connectionStateChanged', handleConnectionStateChange as EventListener);
    
    // Set initial state
    const initialState = connectionStateManager.getConnectionState(serviceKey as any);
    setConnectionState(initialState);

    return () => {
      window.removeEventListener('connectionStateChanged', handleConnectionStateChange as EventListener);
    };
  }, [serviceKey]);

  const getStatusText = () => {
    const isBrave = (navigator as any).brave && typeof (navigator as any).brave.isBrave === 'function';
    
    if (connectionState === 'connecting') {
      return isBrave && name === 'LinkedIn' ? 'Connecting... (disable Shields if stuck)' : 'Connecting...';
    }
    if (connectionState === 'redirecting') return 'Redirecting to LinkedIn...';
    if (connectionState === 'disconnecting') return 'Disconnecting...';
    if (connectionState === 'error') {
      return isBrave && name === 'LinkedIn' ? 'Failed (try disabling Brave Shields)' : 'Connection error';
    }
    if (comingSoon) return 'Coming Soon';
    return connected ? 'Connected' : 'Not connected';
  };

  const getButtonText = () => {
    if (connectionState === 'connecting') return 'Connecting...';
    if (connectionState === 'redirecting') return 'Redirecting...';
    if (connectionState === 'disconnecting') return 'Disconnecting...';
    if (comingSoon) return 'Coming Soon';
    return connected ? 'Disconnect' : 'Connect';
  };

  const isConnecting = connectionState === 'connecting' || connectionState === 'disconnecting' || connectionState === 'redirecting';
  const hasError = connectionState === 'error';
  const isStuck = connectionState === 'redirecting' || connectionState === 'error';

  const handleReset = () => {
    console.log(`🔄 Manual reset requested for ${serviceKey}`);
    
    // Force cleanup of all stuck states first
    connectionStateManager.forceCleanupAllStates();
    
    // Then reset the specific service
    connectionService.resetConnection(serviceKey as any);
    setConnectionState('idle');
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <div className="flex items-center">
        <div className="p-2 bg-iqube-primary/20 rounded-md mr-3">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">{name}</h3>
            {hasError && (
              <Badge variant="destructive" className="text-xs">
                Error
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {getStatusText()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isStuck && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            className="text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
        <Button 
          size="sm" 
          variant={connected ? "outline" : "default"} 
          onClick={onConnect} 
          disabled={isConnecting || disabled || comingSoon}
          className={`${connected && !isConnecting ? "" : "bg-iqube-primary hover:bg-iqube-primary/90"} ${disabled || comingSoon ? "opacity-50" : ""}`}
        >
          {isConnecting && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
          {getButtonText()}
        </Button>
      </div>
    </div>
  );
};

export default ServiceConnection;
