
import { useEffect, useState, useCallback } from 'react';
import { getUserInteractions, InteractionData, storeUserInteraction } from '@/services/user-interaction-service';
import { useAuth } from './use-auth';
import { toast } from 'sonner';

export const useUserInteractions = (
  interactionType?: 'learn' | 'earn' | 'connect'
) => {
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchInteractions = useCallback(async () => {
    if (!user) {
      console.log('No user found, skipping fetch interactions');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log(`Fetching interactions for user: ${user.id} type: ${interactionType}`);
      const { data, error } = await getUserInteractions(interactionType);
      
      if (error) {
        console.error('Error fetching interactions:', error);
        throw error;
      }
      
      console.log(`Fetched interactions: ${data?.length || 0}`);
      setInteractions(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching interactions:', err);
      setError(err as Error);
      toast.error('Failed to load your interaction history');
    } finally {
      setLoading(false);
    }
  }, [interactionType, user]);

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  const saveInteraction = async (data: Omit<InteractionData, 'user_id'>) => {
    if (!user) {
      console.error('Cannot save interaction: No authenticated user');
      return { success: false, error: new Error('User not authenticated') };
    }
    
    try {
      console.log(`Saving interaction for user: ${user.id} type: ${data.interactionType}`);
      // Explicitly pass the user ID from the current auth context
      const result = await storeUserInteraction({
        ...data,
        user_id: user.id
      });
      
      if (result.success) {
        console.log('Interaction saved successfully, refreshing list');
        // Refresh the interactions list
        fetchInteractions();
      } else {
        console.error('Failed to save interaction:', result.error);
        toast.error('Failed to save your interaction');
      }
      
      return result;
    } catch (err) {
      console.error('Error saving interaction:', err);
      toast.error('Failed to save your interaction');
      return { success: false, error: err as Error };
    }
  };

  return {
    interactions,
    loading,
    error,
    saveInteraction,
    refreshInteractions: fetchInteractions
  };
};
