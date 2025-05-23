
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AuthLayout from '@/components/auth/AuthLayout';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';

const SignIn = () => {
  console.log("Rendering SignIn component");
  
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Check if user is already logged in - redirect to dashboard specifically
  useEffect(() => {
    if (user) {
      console.log("User already logged in, redirecting to dashboard");
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSuccessfulSignUp = (email: string) => {
    // Switch to sign in tab
    document.getElementById('sign-in-tab')?.click();
  };

  return (
    <AuthLayout 
      title="Welcome to MonDAI" 
      subtitle="Sign in to your MonDAI account or create a new one"
    >
      <Tabs defaultValue="sign-in" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger id="sign-in-tab" value="sign-in">Sign In</TabsTrigger>
          <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sign-in">
          <SignInForm />
        </TabsContent>
        
        <TabsContent value="sign-up">
          <SignUpForm onSuccessfulSignUp={handleSuccessfulSignUp} />
        </TabsContent>
      </Tabs>
    </AuthLayout>
  );
};

export default SignIn;
