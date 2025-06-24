
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const InvitedUserSignup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const currentUrl = window.location.href;
    const currentHost = window.location.host;
    
    const debug = {
      url: currentUrl,
      host: currentHost,
      pathname: window.location.pathname,
      searchParams: window.location.search,
      token: tokenParam ? tokenParam.substring(0, 12) + '...' : 'NO_TOKEN',
      fullToken: tokenParam,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    
    console.log('🎯 InvitedUserSignup: Component mounted with debug info:', debug);
    
    setToken(tokenParam);
    setDebugInfo(debug);
    
    if (!tokenParam) {
      console.log('⚠️ No invitation token found in URL');
      toast.error('No invitation token found. Please check your invitation link.');
    } else {
      console.log('✅ Invitation token found:', tokenParam.substring(0, 12) + '...');
      toast.success('Invitation link loaded successfully!');
    }
  }, [searchParams]);

  const handleSignupClick = () => {
    if (token) {
      // Redirect to signup with the token
      navigate(`/signup?invitation_token=${token}`);
    } else {
      navigate('/signup');
    }
  };

  const handleSigninClick = () => {
    navigate('/signin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            You're Invited! 🎉
          </CardTitle>
          <CardDescription>
            Welcome to Nakamoto - Complete your registration to get started
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {token ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                You have a valid invitation token. Click below to complete your registration.
              </p>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleSignupClick} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Complete Registration
                </Button>
                
                <Button 
                  onClick={handleSigninClick} 
                  variant="outline"
                  className="w-full"
                >
                  Already have an account? Sign In
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-red-600">
                No invitation token found. Please check your invitation link or contact support.
              </p>
              
              <Button 
                onClick={() => navigate('/')} 
                variant="outline"
                className="w-full"
              >
                Go to Home Page
              </Button>
            </div>
          )}
          
          {/* Debug information (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 p-3 bg-gray-100 rounded text-xs">
              <summary className="cursor-pointer font-medium">Debug Info (Development Only)</summary>
              <pre className="mt-2 whitespace-pre-wrap">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitedUserSignup;
