
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

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
    
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.email);
        if (mounted) {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setIsGuest(false);
          setLoading(false);
          
          // Handle specific auth events with more selective redirect logic
          if (event === 'SIGNED_IN') {
            console.log("User signed in, checking if redirect needed");
            
            // Only redirect if this is a fresh sign-in (not session restoration)
            // and user is on an unprotected route
            const protectedRoutes = ['/mondai', '/settings', '/learn', '/earn', '/connect', '/profile', '/qubes'];
            const isOnProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));
            
            // Only redirect if:
            // 1. Not initial load (session restoration)
            // 2. User is on root path or sign-in related pages
            // 3. Not already on a protected route
            // 4. Not on the password reset page (allow password reset flow to complete)
            const unprotectedPaths = ['/', '/signin', '/signup', '/splash'];
            const isOnUnprotectedPath = unprotectedPaths.includes(location.pathname);
            const isOnPasswordResetPage = location.pathname === '/reset-password';
            
            if (!isInitialLoad && 
                isOnUnprotectedPath &&
                !isOnProtectedRoute &&
                !isOnPasswordResetPage) {
              console.log("Redirecting to MonDAI after fresh sign-in");
              navigate('/mondai');
            } else {
              console.log("Skipping redirect - user already on valid route:", location.pathname);
            }
          } else if (event === 'SIGNED_OUT') {
            console.log("User signed out, session cleared");
            localStorage.removeItem('guestMode');
            setIsGuest(false);
            navigate('/signin');
          } else if (event === 'TOKEN_REFRESHED') {
            console.log("Token refreshed successfully");
          } else if (event === 'USER_UPDATED') {
            console.log("User updated");
          }
          
          // Mark that initial load is complete
          if (isInitialLoad) {
            setIsInitialLoad(false);
          }
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Error getting session:", error);
      } else {
        console.log("Got session:", data.session ? `Yes for ${data.session.user.email}` : "No");
        if (mounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          setLoading(false);
          
          // Mark initial load as complete after session check
          setTimeout(() => {
            setIsInitialLoad(false);
          }, 100);
        }
      }
    });
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const signIn = async (email: string, password: string) => {
    console.log("Attempting sign in for:", email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Error signing in:', error.message);
        return { error, success: false };
      }

      console.log("Sign in successful:", data.user?.email);
      setUser(data.user);
      setSession(data.session);
      setIsGuest(false);
      localStorage.removeItem('guestMode');
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
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsGuest(false);
      localStorage.removeItem('guestMode');
      navigate('/signin', { replace: true });
    } catch (error) {
      console.error("Error during sign out:", error);
      toast.error("Error signing out. Please try again.");
    }
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
