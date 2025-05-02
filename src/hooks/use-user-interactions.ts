
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
      
      // Build query
      let query = supabase
        .from('user_interactions')
        .select('*')
        .eq('user_id', user.id);
      
      // Filter by interaction type if specified
      if (interactionType) {
        console.log(`Filtering by interaction type: ${interactionType}`);
        query = query.eq('interaction_type', interactionType);
      }
      
      // Order by created_at descending
      const { data, error: fetchError } = await query.order('created_at', { ascending: false });
      
      if (fetchError) {
        console.error('Error fetching interactions:', fetchError);
        throw fetchError;
      }
      
      console.log(`Direct DB query returned ${data?.length || 0} total interactions`);
      
      if (data && data.length > 0) {
        console.log('First interaction:', {
          id: data[0].id,
          type: data[0].interaction_type,
          created_at: data[0].created_at,
          query_length: data[0].query?.length || 0,
        });
        
        setInteractions(data);
      } else {
        console.log('No interactions found in database for this user and type');
        setInteractions([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching interactions:', err);
      setError(err as Error);
      toast.error('Failed to load your interaction history');
      setInteractions([]); // Clear interactions on error
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

  // Add a function to create a test interaction
  const createTestInteraction = async (type?: 'learn' | 'earn' | 'connect') => {
    if (!user) return;
    
    const testType = type || interactionType || 'learn';
    console.log(`Creating test ${testType} interaction`);
    
    const result = await storeUserInteraction({
      query: `Test ${testType} query from profile page`,
      response: `This is a test ${testType} response to verify database functionality`,
      interactionType: testType,
      user_id: user.id
    });
    
    if (result.success) {
      toast.success('Test interaction created successfully');
      fetchInteractions(); // Refresh to show the new interaction
      return result;
    } else {
      toast.error('Failed to create test interaction');
      return result;
    }
  };

  return {
    interactions,
    loading,
    error,
    saveInteraction,
    refreshInteractions: fetchInteractions,
    createTestInteraction
  };
};
