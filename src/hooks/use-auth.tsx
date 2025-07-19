import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { sessionManager } from '@/services/session-manager';
import { detectBrowser, shouldShowBraveWarning, getBraveCompatibilityInstructions } from '@/utils/browserDetection';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    success: boolean;
  }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{
    error: Error | null;
    success: boolean;
  }>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    error: Error | null;
    success: boolean;
  }>;
  loading: boolean;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Debouncing refs to prevent rapid successive auth state changes
  const authStateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAuthEventRef = useRef<{ event: string; timestamp: number } | null>(null);
  const isProcessingAuthChange = useRef(false);

  // Enhanced helper function to detect password reset flow
  const isPasswordResetFlow = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasRecoveryTokens = urlParams.get('type') === 'recovery' && 
                             (urlParams.get('access_token') || urlParams.get('refresh_token'));
    const isResetPath = window.location.pathname === '/reset-password';
    
    console.log("Password reset flow check:", {
      isResetPath,
      hasRecoveryTokens,
      currentPath: window.location.pathname,
      searchParams: Object.fromEntries(urlParams.entries())
    });
    
    return Boolean(isResetPath || hasRecoveryTokens);
  };

  // Show Brave browser warning if needed
  const showBraveWarningIfNeeded = useCallback(() => {
    if (shouldShowBraveWarning()) {
      const instructions = getBraveCompatibilityInstructions();
      toast.info('Brave Browser Detected', {
        description: 'For best experience, consider adjusting Brave Shield settings if you encounter issues.',
        duration: 8000,
        action: {
          label: 'Show Instructions',
          onClick: () => {
            toast.info('Brave Setup Instructions', {
              description: instructions.join('\n• '),
              duration: 15000
            });
          }
        }
      });
    }
  }, []);

  // Debounced auth state change handler
  const handleAuthStateChange = useCallback((event: string, newSession: Session | null) => {
    // Prevent processing if already processing
    if (isProcessingAuthChange.current) {
      console.log('🔄 Auth: Skipping auth state change - already processing');
      return;
    }

    // Debounce rapid successive changes
    const now = Date.now();
    if (lastAuthEventRef.current && 
        lastAuthEventRef.current.event === event && 
        (now - lastAuthEventRef.current.timestamp) < 1000) {
      console.log('🔄 Auth: Debouncing rapid auth state change:', event);
      return;
    }

    lastAuthEventRef.current = { event, timestamp: now };

    // Clear any pending timeout
    if (authStateTimeoutRef.current) {
      clearTimeout(authStateTimeoutRef.current);
    }

    // Process the auth state change with a small delay to batch rapid changes
    authStateTimeoutRef.current = setTimeout(() => {
      isProcessingAuthChange.current = true;
      
      try {
        console.log("Auth state changed:", event, newSession?.user?.email);
        
        // ABSOLUTE PRIORITY: Block ALL redirects if password reset is active
        const currentPasswordReset = isPasswordResetFlow();
        console.log("Auth state change - password reset active:", currentPasswordReset);
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsGuest(false);
        setLoading(false);
        
        // Handle session monitoring lifecycle with debouncing
        if (event === 'SIGNED_IN' && newSession) {
          // Debounce session monitoring start
          setTimeout(() => {
            sessionManager.startSessionMonitoring();
          }, 500);
        }
        
        if (event === 'SIGNED_OUT') {
          sessionManager.stopSessionMonitoring();
          sessionManager.clearCache(); // Clear session cache
        }
        
        // Handle specific auth events with password reset taking ABSOLUTE priority
        if (event === 'SIGNED_IN') {
          console.log("User signed in, checking if redirect needed");
          
          // CRITICAL: Absolute priority for password reset flow - NO EXCEPTIONS
          if (currentPasswordReset) {
            console.log("PASSWORD RESET FLOW ACTIVE - BLOCKING ALL REDIRECTS");
            return; // Exit immediately, no further processing
          }
          
          // Only redirect if this is a fresh sign-in (not session restoration)
          // and user is on an unprotected route
          const protectedRoutes = ['/mondai', '/settings', '/learn', '/earn', '/connect', '/profile', '/qubes'];
          const isOnProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));
          
          // Only redirect if:
          // 1. Not initial load (session restoration)
          // 2. User is on root path or sign-in related pages
          // 3. Not already on a protected route
          const unprotectedPaths = ['/', '/signin', '/signup', '/splash'];
          const isOnUnprotectedPath = unprotectedPaths.includes(location.pathname);
          
          if (!isInitialLoad && 
              isOnUnprotectedPath &&
              !isOnProtectedRoute) {
            console.log("Redirecting to MonDAI after fresh sign-in");
            setTimeout(() => navigate('/mondai'), 100); // Small delay to ensure state is settled
          } else {
            console.log("Skipping redirect - user already on valid route:", location.pathname);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out, session cleared");
          localStorage.removeItem('guestMode');
          setIsGuest(false);
          
          // Don't redirect if we're in password reset flow
          if (!currentPasswordReset) {
            setTimeout(() => navigate('/signin'), 100); // Small delay
          } else {
            console.log("Password reset flow active - not redirecting on sign out");
          }
        } else if (event === 'TOKEN_REFRESHED') {
          console.log("Token refreshed successfully");
        } else if (event === 'USER_UPDATED') {
          console.log("User updated");
        }
        
        // Mark that initial load is complete
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      } finally {
        isProcessingAuthChange.current = false;
      }
    }, 100); // 100ms debounce delay
  }, [navigate, location.pathname, isInitialLoad]);

  useEffect(() => {
    console.log("Auth provider initialized");
    let mounted = true;
    
    // Check for guest mode from localStorage
    const guestMode = localStorage.getItem('guestMode') === 'true';
    if (guestMode) {
      setIsGuest(true);
      setLoading(false);
      setIsInitialLoad(false);
      return;
    }
    
    // Show Brave warning if needed
    showBraveWarningIfNeeded();
    
    // CRITICAL: Check for password reset flow IMMEDIATELY
    const isPasswordReset = isPasswordResetFlow();
    console.log("Initial password reset check:", isPasswordReset);
    
    // First set up the auth state listener with debouncing
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Then check for existing session
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Error getting session:", error);
        // Handle session errors with browser-specific guidance
        if (detectBrowser().isBrave) {
          toast.error('Session Error in Brave Browser', {
            description: 'Try disabling Brave Shield for this site.',
            duration: 8000
          });
        }
      } else {
        console.log("Got session:", data.session ? `Yes for ${data.session.user.email}` : "No");
        if (mounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          setLoading(false);
          
          // Start session monitoring if user is already signed in (with delay)
          if (data.session) {
            setTimeout(() => {
              sessionManager.startSessionMonitoring();
            }, 1000);
          }
          
          // Mark initial load as complete after session check
          setTimeout(() => {
            setIsInitialLoad(false);
          }, 200);
        }
      }
    });
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
      sessionManager.stopSessionMonitoring();
      
      // Clear debounce timeout
      if (authStateTimeoutRef.current) {
        clearTimeout(authStateTimeoutRef.current);
      }
    };
  }, [handleAuthStateChange, showBraveWarningIfNeeded]);

  const signIn = async (email: string, password: string) => {
    console.log("Attempting sign in for:", email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Error signing in:', error.message);
        
        // Show browser-specific error messages
        if (detectBrowser().isBrave && error.message.includes('session')) {
          toast.error('Brave Browser Authentication Issue', {
            description: 'Please check your Brave Shield settings and try again.',
            action: {
              label: 'Instructions',
              onClick: () => {
                const instructions = getBraveCompatibilityInstructions();
                toast.info('Brave Setup Instructions', {
                  description: instructions.join('\n• '),
                  duration: 15000
                });
              }
            }
          });
        }
        
        return { error, success: false };
      }

      console.log("Sign in successful:", data.user?.email);
      setUser(data.user);
      setSession(data.session);
      setIsGuest(false);
      localStorage.removeItem('guestMode');
      
      // Start session monitoring with delay
      setTimeout(() => {
        sessionManager.startSessionMonitoring();
      }, 500);
      
      return { error: null, success: true };
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      return { error: error as Error, success: false };
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      // Get the current site URL for redirection - use the current origin
      const redirectTo = `${window.location.origin}/signin?confirmed=true`;
      
      console.log("Attempting sign up for:", email, "with redirect to:", redirectTo);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName || '',
            last_name: lastName || '',
          },
          emailRedirectTo: redirectTo
        }
      });

      if (error) {
        console.error('Error signing up:', error.message);
        return { error, success: false };
      }

      console.log("Sign up successful:", data.user?.email);
      
      // Show success message
      if (data.user && !data.session) {
        toast.success("Please check your email and click the confirmation link to complete your registration.");
      }
      
      return { error: null, success: true };
    } catch (error) {
      console.error('Unexpected error during sign up:', error);
      return { error: error as Error, success: false };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Use the current origin to construct the redirect URL
      const redirectTo = `${window.location.origin}/reset-password`;
      
      console.log("Attempting password reset for:", email, "with redirect to:", redirectTo);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo
      });

      if (error) {
        console.error('Error sending password reset email:', error.message);
        return { error, success: false };
      }

      console.log("Password reset email sent successfully");
      return { error: null, success: true };
    } catch (error) {
      console.error('Unexpected error during password reset:', error);
      return { error: error as Error, success: false };
    }
  };

  const signInAsGuest = () => {
    console.log("Signing in as guest");
    localStorage.setItem('guestMode', 'true');
    setIsGuest(true);
    setUser(null);
    setSession(null);
    navigate('/mondai', { replace: true });
  };

  const signOut = async () => {
    console.log("Signing out");
    try {
      // Stop session monitoring and clear cache
      sessionManager.stopSessionMonitoring();
      sessionManager.clearCache();
      
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsGuest(false);
      localStorage.removeItem('guestMode');
      
      // Small delay before redirect
      setTimeout(() => {
        navigate('/signin', { replace: true });
      }, 100);
    } catch (error) {
      console.error("Error during sign out:", error);
      toast.error("Error signing out. Please try again.");
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    console.log("🔄 Auth: Manual session refresh requested");
    return await sessionManager.forceRefreshSession();
  };

  const value = {
    session,
    user,
    isGuest,
    signIn,
    signUp,
    signInAsGuest,
    signOut,
    resetPassword,
    loading,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
