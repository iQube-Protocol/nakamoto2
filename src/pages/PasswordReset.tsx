
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
  const [canResetPassword, setCanResetPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    console.log("PasswordReset page loaded with URL:", window.location.href);
    console.log("Search params:", Object.fromEntries(searchParams.entries()));
    
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
    
    // Check if we have recovery tokens in the URL
    if (accessToken && refreshToken && type === 'recovery') {
      console.log("Valid recovery tokens found in URL, setting session");
      
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      }).then(({ data, error }) => {
        if (error) {
          console.error("Error setting session:", error);
          setErrorMessage(`Failed to validate reset link: ${error.message}`);
          toast.error('Invalid password reset link. Please request a new one.');
        } else {
          console.log("Session set successfully for password reset");
          setCanResetPassword(true);
          toast.success('Password reset link validated successfully!');
        }
        setIsValidating(false);
      }).catch((err) => {
        console.error("Unexpected error setting session:", err);
        setErrorMessage(`Unexpected error: ${err.message}`);
        setIsValidating(false);
      });
    } else {
      // No tokens in URL - check if we already have a valid session
      console.log("No recovery tokens in URL, checking existing session...");
      
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error("Error getting session:", error);
          setErrorMessage(`Session error: ${error.message}`);
        }
        
        if (session) {
          console.log("Found existing valid session, allowing password reset");
          setCanResetPassword(true);
          toast.success('Session found, you can reset your password');
        } else {
          console.log("No valid session found");
          setErrorMessage('No valid password reset session found. This usually means the reset link is missing authentication tokens.');
          
          // Don't redirect immediately - let user see the error
          setTimeout(() => {
            toast.error('Please request a new password reset link.');
            navigate('/signin');
          }, 5000);
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

  if (!canResetPassword) {
    return (
      <PasswordResetGuard>
        <AuthLayout 
          title="Password Reset Issue" 
          subtitle="There's an issue with your password reset link"
        >
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">
              {errorMessage || 'Unable to validate password reset link'}
            </p>
            <div className="space-y-2 text-sm text-muted-foreground mb-6">
              <p><strong>Debug Information:</strong></p>
              <p>URL: {window.location.href}</p>
              <p>Has tokens: {searchParams.get('access_token') ? 'Yes' : 'No'}</p>
              <p>Type: {searchParams.get('type') || 'None'}</p>
              <p>Error: {errorMessage || 'Unknown'}</p>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground mb-6">
              <p><strong>Possible Solutions:</strong></p>
              <p>1. The reset link may have expired</p>
              <p>2. The link might be missing authentication tokens</p>
              <p>3. Check if the email redirect URL is configured correctly in Supabase</p>
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
