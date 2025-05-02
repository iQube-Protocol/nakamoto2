
import { useEffect, useState, useCallback } from 'react';
import { getUserInteractions, InteractionData, storeUserInteraction } from '@/services/user-interaction-service';
import { useAuth } from './use-auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
    setError(null); // Reset error state before fetching
    
    try {
      console.log(`Fetching interactions for user: ${user.id} type: ${interactionType || 'all'}`);
      
      // First try with the service function
      const { data, error } = await getUserInteractions(interactionType);
      
      if (error) {
        console.error('Error fetching interactions:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log(`No interactions found using service, trying direct DB query`);
        
        // If no data returned, try a direct DB query as a fallback
        const { data: directData, error: directError } = await supabase
          .from('user_interactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (interactionType) {
          const filtered = directData?.filter(item => item.interaction_type === interactionType) || [];
          console.log(`Direct DB query results (filtered): ${filtered.length} interactions`);
          setInteractions(filtered);
        } else {
          console.log(`Direct DB query results: ${directData?.length || 0} interactions`);
          setInteractions(directData || []);
        }
        
        if (directError) {
          throw directError;
        }
      } else {
        console.log(`Fetched interactions: ${data.length || 0}`);
        
        // Add detailed logging
        if (data && data.length > 0) {
          console.log('First interaction:', {
            id: data[0].id,
            type: data[0].interaction_type,
            query: data[0].query?.substring(0, 30) + '...',
            response: data[0].response?.substring(0, 30) + '...',
            user_id: data[0].user_id,
            created_at: data[0].created_at
          });
        } else {
          console.log('No interactions found for type:', interactionType);
        }
        
        setInteractions(data || []);
      }
      
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
    if (user) {
      fetchInteractions();
    } else {
      // Reset state if user is not logged in
      setInteractions([]);
      setError(null);
      setLoading(false);
    }
  }, [fetchInteractions, user]);

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
