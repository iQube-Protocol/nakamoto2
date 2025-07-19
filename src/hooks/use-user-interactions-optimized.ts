
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserInteractions, storeUserInteraction, InteractionData } from '@/services/user-interaction-service';
import { useAuth } from './use-auth';
import { toast } from 'sonner';
import { useCallback, useMemo } from 'react';

export const useUserInteractionsOptimized = (
  interactionType?: 'learn' | 'earn' | 'connect'
) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Create a stable query key
  const queryKey = useMemo(() => 
    ['user-interactions', user?.id, interactionType], 
    [user?.id, interactionType]
  );

  // Use React Query for automatic caching and deduplication
  const {
    data: interactions = [],
    isLoading: loading,
    error,
    refetch: refreshInteractions
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user) return [];
      
      console.log(`Fetching interactions for user: ${user.id}, type: ${interactionType || 'all'}`);
      const { data, error: fetchError } = await getUserInteractions(interactionType);
      
      if (fetchError) {
        console.error('Error fetching interactions:', fetchError);
        throw fetchError;
      }
      
      console.log(`Found ${data?.length || 0} interactions`);
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const saveInteraction = useCallback(async (data: Omit<InteractionData, 'user_id'>) => {
    if (!user) {
      console.error('Cannot save interaction: No authenticated user');
      return { success: false, error: new Error('User not authenticated') };
    }
    
    try {
      console.log(`Saving interaction for user: ${user.id} type: ${data.interactionType}`);
      const result = await storeUserInteraction({
        ...data,
        user_id: user.id
      });
      
      if (result.success) {
        console.log('Interaction saved successfully, invalidating cache');
        // Invalidate and refetch the query to update the cache
        queryClient.invalidateQueries({ queryKey });
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
  }, [user, queryClient, queryKey]);

  const createTestInteraction = useCallback(async (type?: 'learn' | 'earn' | 'connect') => {
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
      queryClient.invalidateQueries({ queryKey });
      return result;
    } else {
      toast.error('Failed to create test interaction');
      return result;
    }
  }, [user, interactionType, queryClient, queryKey]);

  return {
    interactions,
    loading,
    error: error as Error | null,
    saveInteraction,
    refreshInteractions: useCallback(() => refreshInteractions(), [refreshInteractions]),
    createTestInteraction
  };
};
