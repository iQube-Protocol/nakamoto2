
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Key, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AuthLayout from '@/components/auth/AuthLayout';
import PasswordResetGuard from '@/components/auth/PasswordResetGuard';

const PasswordReset = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [tokenValidationError, setTokenValidationError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    console.log("PasswordReset page loaded with URL:", window.location.href);
    console.log("Search params:", Object.fromEntries(searchParams.entries()));
    
    // Enhanced token validation with better error handling
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');
    
    console.log("Token validation details:", { 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken, 
      type,
      tokenLength: accessToken ? accessToken.length : 0,
      refreshTokenLength: refreshToken ? refreshToken.length : 0
    });
    
    // Check if we have the required tokens
    if (accessToken && refreshToken && type === 'recovery') {
      console.log("Valid password reset tokens found, setting session");
      
      // Set session with the tokens from URL
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      }).then(({ data, error }) => {
        if (error) {
          console.error("Error setting session:", error);
          setTokenValidationError(`Invalid password reset link: ${error.message}`);
          toast.error('Invalid password reset link. Please request a new one.');
          setTimeout(() => {
            navigate('/signin');
          }, 3000);
        } else {
          console.log("Session set successfully for password reset");
          setIsValidToken(true);
          setTokenValidationError(null);
          toast.success('Password reset link validated successfully!');
        }
        setIsValidating(false);
      }).catch((err) => {
        console.error("Unexpected error setting session:", err);
        setTokenValidationError(`Unexpected error: ${err.message}`);
        setIsValidating(false);
      });
    } else {
      // More lenient handling - maybe tokens come in a different way
      console.log("Tokens not found in URL, checking for existing session...");
      
      // Check if we already have a valid session for password reset
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error("Error getting session:", error);
        }
        
        if (session) {
          console.log("Found existing session, allowing password reset");
          setIsValidToken(true);
          setTokenValidationError(null);
          toast.success('Session found, you can reset your password');
        } else {
          console.log("No session found, this might be an invalid reset link");
          setTokenValidationError('Invalid or expired password reset link');
          toast.error('Invalid password reset link. Please request a new one.');
          setTimeout(() => {
            navigate('/signin');
          }, 3000);
        }
        setIsValidating(false);
      });
    }
  }, [searchParams, navigate]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("Attempting to update password...");
      
      // Get current session to ensure we're authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('No valid session for password update:', sessionError);
        toast.error('Your password reset session has expired. Please request a new reset link.');
        navigate('/signin');
        return;
      }
      
      console.log("Current session valid, updating password...");
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Error updating password:', error.message);
        toast.error(`Failed to update password: ${error.message}`);
      } else {
        console.log("Password updated successfully");
        toast.success('Password updated successfully! You can now sign in with your new password.');
        
        // Clear the session and redirect to sign in
        await supabase.auth.signOut();
        
        setTimeout(() => {
          navigate('/signin', { replace: true });
        }, 1500);
      }
    } catch (err) {
      console.error('Unexpected error during password reset:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while validating the token
  if (isValidating) {
    return (
      <PasswordResetGuard>
        <AuthLayout 
          title="Validating Reset Link" 
          subtitle="Please wait while we validate your password reset link..."
        >
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </AuthLayout>
      </PasswordResetGuard>
    );
  }

  // Show error state if token validation failed
  if (tokenValidationError || !isValidToken) {
    return (
      <PasswordResetGuard>
        <AuthLayout 
          title="Invalid Reset Link" 
          subtitle="This password reset link is invalid or has expired"
        >
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">
              {tokenValidationError || 'The password reset link is invalid or has expired.'}
            </p>
            <p className="text-muted-foreground mb-4">
              Please request a new password reset from the sign-in page.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Debug info:</p>
              <p>URL: {window.location.href}</p>
              <p>Has tokens: {searchParams.get('access_token') ? 'Yes' : 'No'}</p>
              <p>Type: {searchParams.get('type') || 'None'}</p>
            </div>
            <Button 
              onClick={() => navigate('/signin')} 
              className="mt-4"
              variant="outline"
            >
              Back to Sign In
            </Button>
          </div>
        </AuthLayout>
      </PasswordResetGuard>
    );
  }

  return (
    <PasswordResetGuard>
      <AuthLayout 
        title="Reset Your Password" 
        subtitle="Enter your new password below"
      >
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                placeholder="Enter new password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                placeholder="Confirm new password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Updating Password...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </AuthLayout>
    </PasswordResetGuard>
  );
};

export default PasswordReset;
