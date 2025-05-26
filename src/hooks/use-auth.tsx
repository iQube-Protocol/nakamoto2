
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    success: boolean;
  }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{
    error: Error | null;
    success: boolean;
  }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("Auth provider initialized");
    let mounted = true;
    
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.email);
        if (mounted) {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setLoading(false);
          
          // Handle specific auth events
          if (event === 'SIGNED_IN') {
            console.log("User signed in, session established");
            // Redirect to dashboard after sign in
            navigate('/mondai');
          } else if (event === 'SIGNED_OUT') {
            console.log("User signed out, session cleared");
            navigate('/signin');
          } else if (event === 'TOKEN_REFRESHED') {
            console.log("Token refreshed successfully");
          } else if (event === 'USER_UPDATED') {
            console.log("User updated");
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
        }
      }
    });
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

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

  const signOut = async () => {
    console.log("Signing out");
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      navigate('/signin', { replace: true });
    } catch (error) {
      console.error("Error during sign out:", error);
      toast.error("Error signing out. Please try again.");
    }
  };

  const value = {
    session,
    user,
    signIn,
    signUp,
    signOut,
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
