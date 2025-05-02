
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
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching interactions for type:', interactionType);
      const { data, error } = await getUserInteractions(interactionType);
      
      if (error) {
        throw error;
      }
      
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
    if (!user) return { success: false, error: new Error('User not authenticated') };
    
    try {
      // The user_id will be retrieved inside storeUserInteraction from the session
      const result = await storeUserInteraction({
        ...data,
        user_id: user.id // We can explicitly pass it here as well
      });
      
      if (result.success) {
        // Refresh the interactions list
        fetchInteractions();
      } else {
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
