
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { blakQubeService } from '@/services/blakqube-service';

interface BlakQubeRefreshButtonProps {
  onRefresh?: () => void;
  personaType?: 'knyt' | 'qrypto';
}

const BlakQubeRefreshButton = ({ onRefresh, personaType = 'qrypto' }: BlakQubeRefreshButtonProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log('=== BLAKQUBE REFRESH START ===');
      console.log('🔄 Refreshing persona data from connections for type:', personaType);
      console.log('📋 Refresh button persona type:', personaType);
      
      // First ensure wallet data is updated with KNYT balance
      const { walletConnectionService } = await import('@/services/wallet-connection-service');
      console.log('💰 Updating wallet with KNYT balance...');
      await walletConnectionService.updateWalletWithKnytBalance();
      
      // Update persona from connections with explicit type logging
      console.log('🔄 Calling updatePersonaFromConnections with type:', personaType);
      const success = await blakQubeService.updatePersonaFromConnections(personaType);
      
      if (success) {
        console.log('✅ Persona data refresh successful for type:', personaType);
        toast.success(`${personaType === 'knyt' ? 'KNYT' : 'Qrypto'} Persona data refreshed successfully!`);
        
        // Trigger comprehensive data refresh events
        const events = ['privateDataUpdated', 'personaDataUpdated', 'balanceUpdated', 'walletDataRefreshed'];
        events.forEach(eventName => {
          console.log(`📡 Dispatching event: ${eventName}`);
          const event = new CustomEvent(eventName);
          window.dispatchEvent(event);
        });
        
        // Call the optional onRefresh callback
        if (onRefresh) {
          onRefresh();
        }
      } else {
        console.error('❌ Persona data refresh failed for type:', personaType);
        toast.error(`Failed to refresh ${personaType === 'knyt' ? 'KNYT' : 'Qrypto'} Persona data`);
      }
    } catch (error) {
      console.error('❌ Error refreshing persona data:', error);
      toast.error(`Error refreshing ${personaType === 'knyt' ? 'KNYT' : 'Qrypto'} Persona data`);
    } finally {
      setIsRefreshing(false);
      console.log('=== BLAKQUBE REFRESH END ===');
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
