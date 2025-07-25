
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { validateEmail, checkRateLimit } from '@/utils/inputValidation';

interface PasswordResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PasswordResetDialog = ({ open, onOpenChange }: PasswordResetDialogProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = email.trim();
    
    // Validate email format
    const emailValidation = validateEmail(trimmedEmail);
    if (!emailValidation.isValid) {
      toast.error(emailValidation.error || 'Please enter a valid email address');
      return;
    }

    // Check rate limiting
    const rateLimit = checkRateLimit(`password-reset-${trimmedEmail}`, 3, 300000); // 3 attempts per 5 minutes
    if (!rateLimit.allowed) {
      const resetTime = new Date(rateLimit.resetTime).toLocaleTimeString();
      toast.error(`Too many attempts. Try again at ${resetTime}`);
      return;
    }

    setIsLoading(true);
    
    try {
      // Use the secure password reset function
      const { data, error } = await supabase.functions.invoke('send-password-reset-secure', {
        body: { email: trimmedEmail }
      });
      
      if (error) {
        console.error('Password reset failed:', error);
        toast.error('Failed to send reset email. Please try again.');
      } else {
        // Always show success message to prevent email enumeration
        toast.success('If your email is registered, you will receive a password reset link.');
        onOpenChange(false);
        setEmail('');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter your email address and we'll send you a link to reset your password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="reset-email"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordResetDialog;
