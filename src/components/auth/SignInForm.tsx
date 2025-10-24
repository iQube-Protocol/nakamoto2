
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Mail, Key, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import PasswordResetDialog from './PasswordResetDialog';
import { validateEmail, checkRateLimit } from '@/utils/inputValidation';

const SignInForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const navigate = useNavigate();
  const { signIn, signInAsGuest } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      toast.error(emailValidation.error || "Invalid email format");
      return;
    }

    // Rate limiting check
    const rateLimit = checkRateLimit(`signin_${email}`, 5, 300000);
    if (!rateLimit.allowed) {
      toast.error("Too many sign-in attempts. Please try again later.");
      return;
    }

    setIsLoading(true);
    try {
      const { error, success } = await signIn(email, password);
      if (success) {
        toast.success('Signed in successfully');
        navigate('/aigent');
      } else if (error) {
        toast.error(`Sign in failed: ${error.message}`);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const guestSignIn = async () => {
    setIsLoading(true);
    try {
      toast.success('Signed in as guest');
      signInAsGuest();
    } catch (err) {
      console.error('Guest sign in error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              onClick={() => setShowResetDialog(true)}
              className="text-xs text-iqube-accent hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
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
        <div className="flex items-center space-x-2">
          <Checkbox id="remember" />
          <Label htmlFor="remember" className="text-sm font-normal">
            Remember me for 30 days
          </Label>
        </div>
        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </div>
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={guestSignIn}
          disabled={isLoading}
          className="w-full"
        >
          Sign in as guest
        </Button>
      </form>

      <PasswordResetDialog 
        open={showResetDialog} 
        onOpenChange={setShowResetDialog}
      />
    </>
  );
};

export default SignInForm;
