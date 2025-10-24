import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserInteractions } from '@/services/user-interaction-service';
import { useAuth } from '@/hooks/use-auth';
import NavigationGuard from '@/utils/NavigationGuard';

export interface UserInteraction {
  id: string;
  query: string;
  response: string;
  interaction_type: 'learn' | 'earn' | 'connect' | 'aigent';
  metadata?: any;
  created_at: string;
}

interface UseUserInteractionsOptimizedOptions {
  batchSize?: number;
  enableProgressiveLoading?: boolean;
  deferDuringNavigation?: boolean;
}

export const useUserInteractionsOptimized = (
  interactionType?: 'learn' | 'earn' | 'connect' | 'aigent' | 'all' | 'qripto' | 'knyt',
  options: UseUserInteractionsOptimizedOptions = {}
) => {
  const {
    batchSize = 10,
    enableProgressiveLoading = true,
    deferDuringNavigation = true
  } = options;

  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [displayedInteractions, setDisplayedInteractions] = useState<UserInteraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();
  const loadingRef = useRef(false);
  const navigationAwareTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize NavigationGuard
  useEffect(() => {
    NavigationGuard.init();
  }, []);

  const fetchInteractions = useCallback(async () => {
    if (!user || loadingRef.current) {
      setInteractions([]);
      setDisplayedInteractions([]);
      return;
    }

    // Defer loading during navigation if option is enabled
    if (deferDuringNavigation && NavigationGuard.isNavigationInProgress()) {
      console.log('NavigationGuard: Deferring interaction loading during navigation');
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching interactions for user: ${user.id}, type: ${interactionType || 'all'}`);
      const result = await getUserInteractions(interactionType);
      
      if (result.error) {
        setError(result.error.message);
        setInteractions([]);
        setDisplayedInteractions([]);
      } else {
        const fetchedInteractions = result.data || [];
        console.log(`Found ${fetchedInteractions.length} interactions`);
        setInteractions(fetchedInteractions);
        
        // Progressive loading: show first batch immediately
        if (enableProgressiveLoading) {
          setDisplayedInteractions(fetchedInteractions.slice(0, batchSize));
          setHasMore(fetchedInteractions.length > batchSize);
        } else {
          setDisplayedInteractions(fetchedInteractions);
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error('Error fetching interactions:', err);
      setError('Failed to fetch interactions');
      setInteractions([]);
      setDisplayedInteractions([]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [user, interactionType, batchSize, enableProgressiveLoading, deferDuringNavigation]);

  const loadMoreInteractions = useCallback(() => {
    if (!hasMore || loadingMore || NavigationGuard.isNavigationInProgress()) {
      return;
    }

    setLoadingMore(true);
    
    const currentCount = displayedInteractions.length;
    const nextBatch = interactions.slice(currentCount, currentCount + batchSize);
    
    // Stagger the loading to prevent UI blocking
    setTimeout(() => {
      setDisplayedInteractions(prev => [...prev, ...nextBatch]);
      setHasMore(currentCount + batchSize < interactions.length);
      setLoadingMore(false);
    }, 100);
  }, [interactions, displayedInteractions.length, batchSize, hasMore, loadingMore]);

  const refreshInteractions = useCallback(async () => {
    // Navigation-aware refresh with debouncing
    if (navigationAwareTimeoutRef.current) {
      clearTimeout(navigationAwareTimeoutRef.current);
    }

    navigationAwareTimeoutRef.current = setTimeout(() => {
      if (!NavigationGuard.isNavigationInProgress()) {
        fetchInteractions();
      }
    }, 150);
  }, [fetchInteractions]);

  useEffect(() => {
    // Initial fetch with navigation awareness
    const timeoutId = setTimeout(() => {
      if (!NavigationGuard.isNavigationInProgress()) {
        fetchInteractions();
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [fetchInteractions]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (navigationAwareTimeoutRef.current) {
        clearTimeout(navigationAwareTimeoutRef.current);
      }
    };
  }, []);

  return {
    interactions: displayedInteractions,
    allInteractions: interactions,
    loading,
    loadingMore,
    error,
    hasMore,
    refreshInteractions,
    loadMoreInteractions
  };
};