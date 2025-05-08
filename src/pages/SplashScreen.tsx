
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const SplashScreen = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Auto-navigate to sign in after 3 seconds
    const timer = setTimeout(() => {
      navigate('/signin');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20">
      <div className="container max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-iqube-primary to-iqube-accent">
          Aigent MonDAI
        </h1>
        <p className="text-xl text-muted-foreground">
          Your personal AI assistant for Web3 education and insights
        </p>
        <div className="flex flex-col space-y-4 mt-8">
          <Button 
            onClick={() => navigate('/signin')}
            className="w-full"
          >
            Sign In
          </Button>
          <Button
            onClick={() => navigate('/signup')}
            variant="outline"
            className="w-full"
          >
            Create Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
