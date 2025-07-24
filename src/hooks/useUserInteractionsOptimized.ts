import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserInteractions } from '@/services/user-interaction-service';
import { useAuthOptimized } from './useAuthOptimized';
import { toast } from 'sonner';
import { withCircuitBreaker } from '@/utils/circuitBreaker';

export const useUserInteractionsOptimized = (
  interactionType?: 'learn' | 'earn' | 'connect'
) => {
  const { user } = useAuthOptimized();
  const queryClient = useQueryClient();

  const {
    data: interactions = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['user-interactions', user?.id, interactionType],
    queryFn: async () => {
      if (!user) {
        console.log('No user found, skipping fetch interactions');
        return [];
      }
      
      console.log(`Fetching interactions for user: ${user.id}, type: ${interactionType || 'all'}`);
      
      const { data, error: fetchError } = await withCircuitBreaker(
        `user-interactions-${interactionType || 'all'}`,
        () => getUserInteractions(interactionType)
      );
      
      if (fetchError) {
        console.error('Error fetching interactions:', fetchError);
        throw fetchError;
      }
      
      console.log(`Found ${data?.length || 0} interactions`);
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Prevent refetch on mount if data exists
    retry: (failureCount, error) => {
      // Only retry on specific errors, not 406 errors
      if (error && typeof error === 'object' && 'status' in error && error.status === 406) {
        return false;
      }
      return failureCount < 2;
    }
  });

  const saveInteraction = async (data: any) => {
    // Implementation remains the same, but we'll invalidate queries instead of refetching
    const result = await import('@/services/user-interaction-service').then(service => 
      service.storeUserInteraction({
        ...data,
        user_id: user?.id
      })
    );
    
    if (result.success) {
      // Invalidate and refetch the query
      queryClient.invalidateQueries({ 
        queryKey: ['user-interactions', user?.id, interactionType] 
      });
    }
    
    return result;
  };

  const refreshInteractions = async (): Promise<void> => {
    await refetch();
  };

  const createTestInteraction = async (type?: 'learn' | 'earn' | 'connect') => {
    if (!user) return;
    
    const testType = type || interactionType || 'learn';
    console.log(`Creating test ${testType} interaction`);
    
    const result = await saveInteraction({
      query: `Test ${testType} query from profile page`,
      response: `This is a test ${testType} response to verify database functionality`,
      interactionType: testType,
    });
    
    if (result.success) {
      toast.success('Test interaction created successfully');
    } else {
      toast.error('Failed to create test interaction');
    }
    
    return result;
  };

  return {
    interactions,
    loading,
    error,
    saveInteraction,
    refreshInteractions,
    createTestInteraction
  };
};
