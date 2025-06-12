
import { useState, useEffect } from 'react';
import { MetaQube } from '@/lib/types';
import { blakQubeService } from '@/services/blakqube-service';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { blakQubeToPrivateData, createDefaultBlakQube } from '@/services/blakqube/data-transformers';

interface PrivateData {
  [key: string]: string | string[];
}

export const usePrivateData = (selectedIQube: MetaQube) => {
  const { user } = useAuth();
  const [privateData, setPrivateData] = useState<PrivateData>({});
  const [loading, setLoading] = useState(true);

  // Load real BlakQube data from database
  const loadBlakQubeData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Loading BlakQube data...');
      const blakQubeData = await blakQubeService.getBlakQubeData();
      
      if (blakQubeData) {
        console.log('BlakQube data loaded:', blakQubeData);
        // Convert BlakQube data to privateData format
        const formattedData = blakQubeToPrivateData(blakQubeData);
        setPrivateData(formattedData);
      } else {
        console.log('No BlakQube data found, using defaults');
        // Set default empty data if no BlakQube exists
        const defaultData = createDefaultBlakQube(user.email);
        const formattedData = blakQubeToPrivateData(defaultData as any);
        setPrivateData(formattedData);
      }
    } catch (error) {
      console.error('Error loading BlakQube data:', error);
      // Fallback to empty data
      const defaultData = createDefaultBlakQube(user?.email);
      const formattedData = blakQubeToPrivateData(defaultData as any);
      setPrivateData(formattedData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlakQubeData();
  }, [user]);

  // Listen for private data updates from wallet connections
  useEffect(() => {
    const handlePrivateDataUpdate = () => {
      console.log('Private data update event received, reloading BlakQube data...');
      loadBlakQubeData();
    };

    window.addEventListener('privateDataUpdated', handlePrivateDataUpdate);
    
    return () => {
      window.removeEventListener('privateDataUpdated', handlePrivateDataUpdate);
    };
  }, [user]);

  const handleUpdatePrivateData = async (newData: PrivateData) => {
    console.log('Updating private data:', newData);
    
    try {
      // Update local state immediately for UI responsiveness
      setPrivateData(newData);
      
      // Save to database using BlakQube service
      const success = await blakQubeService.saveManualBlakQubeData(newData);
      
      if (success) {
        console.log('Private data saved successfully to database');
        toast.success('BlakQube data saved successfully');
        
        // Also trigger connection updates to maintain consistency
        console.log('Triggering connection updates after manual save...');
        await blakQubeService.updateBlakQubeFromConnections();
        
        // Trigger a final refresh to ensure data consistency
        await loadBlakQubeData();
      } else {
        console.error('Failed to save private data to database');
        toast.error('Failed to save BlakQube data. Please try again.');
        
        // Revert local state on failure
        await loadBlakQubeData();
      }
    } catch (error) {
      console.error('Error saving private data:', error);
      toast.error('Error saving BlakQube data. Please try again.');
      
      // Revert local state on error
      await loadBlakQubeData();
    }
  };

  return {
    privateData,
    handleUpdatePrivateData,
    loading,
    refreshData: loadBlakQubeData
  };
};
