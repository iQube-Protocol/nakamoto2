
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const SplashPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-qrypto-dark via-qrypto-primary to-qrypto-secondary">
      <div className="container max-w-md text-center space-y-6 p-8">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            QryptoCOYN
          </h1>
          <div className="w-16 h-1 bg-qrypto-accent mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-qrypto-accent mb-2">
            Nakamoto
          </h2>
          <p className="text-lg text-white/80">
            Your intelligent cryptocurrency companion
          </p>
        </div>
        
        <p className="text-white/70 text-sm">
          Navigate the world of Web3, understand cryptocurrency concepts, and explore decentralized finance with your AI-powered assistant.
        </p>
        
        <div className="flex flex-col space-y-4 mt-8">
          <Button 
            onClick={() => navigate('/signin')}
            className="w-full bg-qrypto-accent hover:bg-qrypto-accent/90 text-white font-semibold py-3"
          >
            Get Started
          </Button>
          <Button
            onClick={() => navigate('/mondai')}
            variant="outline"
            className="w-full border-white/30 text-white hover:bg-white/10"
          >
            Try Nakamoto
          </Button>
        </div>
        
        <div className="text-xs text-white/50 mt-8">
          Powered by advanced AI technology
        </div>
      </div>
    </div>
  );
};

export default SplashPage;
