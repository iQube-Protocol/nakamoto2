import { useEffect, useState, useMemo } from 'react';
import { useAuth } from './use-auth';

// Debounced version of useAuth to prevent infinite loops
export const useAuthOptimized = () => {
  const auth = useAuth();
  const [debouncedUser, setDebouncedUser] = useState(auth.user);
  const [lastUserId, setLastUserId] = useState<string | null>(null);

  // Only update when the user ID actually changes
  useEffect(() => {
    if (auth.user?.id !== lastUserId) {
      setLastUserId(auth.user?.id || null);
      setDebouncedUser(auth.user);
    }
  }, [auth.user?.id, lastUserId]);

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    ...auth,
    user: debouncedUser
  }), [auth, debouncedUser]);
};