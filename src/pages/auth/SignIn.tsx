
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

const SignIn = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Get form data
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
      const { error, success } = await signIn(email, password);
      
      if (success) {
        toast.success("Successfully signed in!");
        navigate('/dashboard', { replace: true });
      } else if (error) {
        toast.error(`Sign in failed: ${error.message}`);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      toast.error('An unexpected error occurred');
    }
  };
  
  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Sign in to your account to continue"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" placeholder="you@example.com" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" placeholder="••••••••" type="password" required />
        </div>
        <Button type="submit" className="w-full">Sign In</Button>
        <p className="text-sm text-center text-muted-foreground">
          Don't have an account? <a href="/signup" className="text-blue-600 hover:underline">Sign up</a>
        </p>
      </form>
    </AuthLayout>
  );
};

export default SignIn;
