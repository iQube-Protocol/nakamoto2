
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { blakQubeService } from '@/services/blakqube-service';

interface BlakQubeRefreshButtonProps {
  onRefresh?: () => void;
}

const BlakQubeRefreshButton = ({ onRefresh }: BlakQubeRefreshButtonProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log('Refreshing BlakQube data from connections...');
      const success = await blakQubeService.updateBlakQubeFromConnections();
      
      if (success) {
        toast.success('BlakQube data refreshed successfully!');
        
        // Trigger private data refresh
        const updateEvent = new CustomEvent('privateDataUpdated');
        window.dispatchEvent(updateEvent);
        
        // Call the optional onRefresh callback
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error('Failed to refresh BlakQube data');
      }
    } catch (error) {
      console.error('Error refreshing BlakQube data:', error);
      toast.error('Error refreshing BlakQube data');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
    </Button>
  );
};

export default BlakQubeRefreshButton;
