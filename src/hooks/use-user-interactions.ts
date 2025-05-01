
import { useEffect, useState } from 'react';
import { getUserInteractions, InteractionData, storeUserInteraction } from '@/services/user-interaction-service';
import { useAuth } from './use-auth';

export const useUserInteractions = (
  interactionType?: 'learn' | 'earn' | 'connect'
) => {
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchInteractions = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await getUserInteractions(interactionType);
        
        if (error) {
          throw error;
        }
        
        setInteractions(data || []);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchInteractions();
  }, [interactionType, user]);

  const saveInteraction = async (data: Omit<InteractionData, 'user_id'>) => {
    if (!user) return { success: false, error: new Error('User not authenticated') };
    
    try {
      const result = await storeUserInteraction(data);
      
      if (result.success) {
        // Refresh the interactions list
        const { data: updatedData } = await getUserInteractions(interactionType);
        if (updatedData) {
          setInteractions(updatedData);
        }
      }
      
      return result;
    } catch (err) {
      return { success: false, error: err as Error };
    }
  };

  return {
    interactions,
    loading,
    error,
    saveInteraction,
  };
};
