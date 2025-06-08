
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Extract parameters from URL
  const service = searchParams.get('service');
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const state = searchParams.get('state');
  
  useEffect(() => {
    const completeOAuth = async () => {
      console.log('OAuth callback received:', { service, code: !!code, error, errorDescription });
      
      // Handle errors from OAuth provider
      if (error) {
        console.error('OAuth error:', error, errorDescription);
        setStatus('error');
        const message = errorDescription || error;
        setErrorMessage(message);
        toast.error(`Authentication failed: ${message}`);
        setTimeout(() => navigate('/settings?tab=connections'), 3000);
        return;
      }
      
      // Check if we have the necessary parameters
      if (!service || !code) {
        console.error('Missing required parameters:', { service, code: !!code });
        setStatus('error');
        setErrorMessage('Invalid callback parameters');
        toast.error('Invalid callback parameters');
        setTimeout(() => navigate('/settings?tab=connections'), 3000);
        return;
      }
      
      try {
        console.log(`Exchanging code for token with ${service} service...`);
        
        // Call Supabase Edge Function to exchange code for token
        const { data, error: exchangeError } = await supabase.functions.invoke(`oauth-callback-${service}`, {
          body: { 
            code, 
            redirectUri: window.location.origin + window.location.pathname + '?service=' + service,
            state 
          }
        });
        
        if (exchangeError) {
          console.error('Token exchange error:', exchangeError);
          setStatus('error');
          setErrorMessage(exchangeError.message || 'Token exchange failed');
          toast.error(`Failed to complete authentication: ${exchangeError.message}`);
          setTimeout(() => navigate('/settings?tab=connections'), 3000);
          return;
        }
        
        console.log('OAuth completion successful:', data);
        setStatus('success');
        toast.success(`Successfully connected to ${service}!`);
        
        // Redirect back to settings
        setTimeout(() => navigate('/settings?tab=connections'), 1500);
      } catch (err) {
        console.error('Error completing OAuth flow:', err);
        setStatus('error');
        setErrorMessage('An unexpected error occurred');
        toast.error('An unexpected error occurred');
        setTimeout(() => navigate('/settings?tab=connections'), 3000);
      }
    };
    
    completeOAuth();
  }, [code, error, navigate, service, state, errorDescription]);
  
  const getServiceName = (serviceCode: string | null) => {
    if (!serviceCode) return 'this service';
    
    const services: Record<string, string> = {
      linkedin: 'LinkedIn',
      twitter: 'Twitter',
      discord: 'Discord',
      telegram: 'Telegram',
      luma: 'Luma'
    };
    
    return services[serviceCode.toLowerCase()] || serviceCode;
  };
  
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Service Connection</CardTitle>
          <CardDescription>
            {status === 'processing' && 'Completing authentication...'}
            {status === 'success' && 'Authentication successful!'}
            {status === 'error' && 'Authentication failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          {status === 'processing' && (
            <Loader2 className="h-16 w-16 text-iqube-primary animate-spin" />
          )}
          {status === 'success' && (
            <Check className="h-16 w-16 text-green-500" />
          )}
          {status === 'error' && (
            <X className="h-16 w-16 text-red-500" />
          )}
          <p className="mt-4 text-muted-foreground text-center">
            {status === 'processing' && 'Please wait while we complete your authentication...'}
            {status === 'success' && `Successfully connected to ${getServiceName(service)}! Redirecting...`}
            {status === 'error' && (
              <>
                There was a problem connecting your account: {errorMessage}
                <br />
                Redirecting...
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;
