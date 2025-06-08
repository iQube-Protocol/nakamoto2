
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
      console.log('OAuth callback started:', { 
        service, 
        hasCode: !!code, 
        error, 
        errorDescription,
        state
      });
      
      // Handle OAuth provider errors
      if (error) {
        console.error('OAuth provider error:', { error, errorDescription });
        setStatus('error');
        const message = errorDescription || error;
        setErrorMessage(message);
        toast.error(`LinkedIn authorization failed: ${message}`);
        setTimeout(() => navigate('/settings?tab=connections'), 3000);
        return;
      }
      
      // Validate required parameters
      if (!service || !code) {
        console.error('Missing required OAuth parameters:', { service, hasCode: !!code });
        setStatus('error');
        setErrorMessage('Invalid OAuth callback - missing required parameters');
        toast.error('OAuth callback error: Missing required parameters');
        setTimeout(() => navigate('/settings?tab=connections'), 3000);
        return;
      }
      
      if (service !== 'linkedin') {
        console.error('Unsupported service:', service);
        setStatus('error');
        setErrorMessage(`Unsupported service: ${service}`);
        toast.error(`Unsupported OAuth service: ${service}`);
        setTimeout(() => navigate('/settings?tab=connections'), 3000);
        return;
      }
      
      try {
        console.log('Getting current session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setStatus('error');
          setErrorMessage('Session error occurred');
          toast.error('Authentication session error');
          setTimeout(() => navigate('/signin'), 3000);
          return;
        }
        
        if (!session?.access_token) {
          console.error('No valid session found');
          setStatus('error');
          setErrorMessage('No valid session - please sign in');
          toast.error('Please sign in and try connecting again');
          setTimeout(() => navigate('/signin'), 3000);
          return;
        }
        
        console.log('Session validated, calling OAuth callback function...');
        
        // Build redirect URI that matches what was sent to LinkedIn
        const redirectUri = `${window.location.origin}/oauth-callback?service=linkedin`;
        console.log('Using redirect URI:', redirectUri);
        
        // Call the OAuth callback edge function
        const { data, error: callbackError } = await supabase.functions.invoke('oauth-callback-linkedin', {
          body: { 
            code, 
            redirectUri,
            state 
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('OAuth callback response:', { data, error: callbackError });
        
        if (callbackError) {
          console.error('OAuth callback function error:', callbackError);
          setStatus('error');
          setErrorMessage(callbackError.message || 'OAuth callback failed');
          toast.error(`Failed to complete LinkedIn connection: ${callbackError.message}`);
          setTimeout(() => navigate('/settings?tab=connections'), 3000);
          return;
        }
        
        if (!data?.success) {
          console.error('OAuth callback returned error:', data);
          setStatus('error');
          setErrorMessage(data?.error || 'OAuth callback failed');
          toast.error(`LinkedIn connection failed: ${data?.error || 'Unknown error'}`);
          setTimeout(() => navigate('/settings?tab=connections'), 3000);
          return;
        }
        
        console.log('OAuth callback completed successfully');
        setStatus('success');
        toast.success('Successfully connected to LinkedIn!');
        
        // Redirect back to settings after a short delay
        setTimeout(() => navigate('/settings?tab=connections'), 1500);
        
      } catch (err) {
        console.error('Unexpected error in OAuth callback:', err);
        setStatus('error');
        setErrorMessage('An unexpected error occurred');
        toast.error('An unexpected error occurred during LinkedIn connection');
        setTimeout(() => navigate('/settings?tab=connections'), 3000);
      }
    };
    
    completeOAuth();
  }, [code, error, navigate, service, state, errorDescription]);
  
  const getServiceName = (serviceCode: string | null) => {
    if (!serviceCode) return 'service';
    return serviceCode === 'linkedin' ? 'LinkedIn' : serviceCode;
  };
  
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>LinkedIn Connection</CardTitle>
          <CardDescription>
            {status === 'processing' && 'Completing LinkedIn authorization...'}
            {status === 'success' && 'LinkedIn connected successfully!'}
            {status === 'error' && 'LinkedIn connection failed'}
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
            {status === 'processing' && 'Please wait while we complete your LinkedIn authorization...'}
            {status === 'success' && `Successfully connected to ${getServiceName(service)}! Redirecting to settings...`}
            {status === 'error' && (
              <>
                Connection failed: {errorMessage}
                <br />
                <span className="text-sm">Redirecting to settings...</span>
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;
