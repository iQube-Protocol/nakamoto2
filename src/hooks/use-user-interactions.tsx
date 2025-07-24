
import { useState, useEffect } from 'react';
import { getUserInteractions } from '@/services/user-interaction-service';
import { useAuth } from '@/hooks/use-auth';

export interface UserInteraction {
  id: string;
  query: string;
  response: string;
  interaction_type: 'learn' | 'earn' | 'connect' | 'mondai';
  metadata?: any;
  created_at: string;
}

export const useUserInteractions = (interactionType?: 'learn' | 'earn' | 'connect' | 'mondai') => {
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchInteractions = async () => {
    if (!user) {
      setInteractions([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching interactions for user: ${user.id}, type: ${interactionType || 'all'}`);
      const result = await getUserInteractions(interactionType);
      
      if (result.error) {
        setError(result.error.message);
        setInteractions([]);
      } else {
        console.log(`Found ${result.data?.length || 0} interactions`);
        setInteractions(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching interactions:', err);
      setError('Failed to fetch interactions');
      setInteractions([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshInteractions = async () => {
    await fetchInteractions();
  };

  useEffect(() => {
    fetchInteractions();
  }, [user, interactionType]);

  return {
    interactions,
    loading,
    error,
    refreshInteractions
  };
};
