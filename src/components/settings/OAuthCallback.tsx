
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
  
  const service = searchParams.get('service');
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const state = searchParams.get('state');
  
  useEffect(() => {
    const completeOAuth = async () => {
      console.log('OAuth callback started:', { service, hasCode: !!code, error });
      
      // Handle OAuth provider errors
      if (error) {
        console.error('OAuth provider error:', { error, errorDescription });
        setStatus('error');
        setErrorMessage(errorDescription || error);
        toast.error(`LinkedIn authorization failed: ${errorDescription || error}`);
        setTimeout(() => navigate('/settings?tab=connections'), 3000);
        return;
      }
      
      // Validate required parameters
      if (!service || !code) {
        console.error('Missing required parameters');
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
        
        if (sessionError || !session?.access_token) {
          console.error('Session error:', sessionError);
          setStatus('error');
          setErrorMessage('Authentication session error');
          toast.error('Please sign in and try connecting again');
          setTimeout(() => navigate('/signin'), 3000);
          return;
        }
        
        console.log('Session validated, calling OAuth callback function...');
        
        const redirectUri = `${window.location.origin}/oauth-callback?service=linkedin`;
        
        // Call the OAuth callback edge function
        const response = await supabase.functions.invoke('oauth-callback-linkedin', {
          body: { code, redirectUri, state },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('OAuth callback response:', response);
        
        if (response.error) {
          console.error('OAuth callback function error:', response.error);
          setStatus('error');
          setErrorMessage(response.error.message || 'OAuth callback failed');
          toast.error(`Failed to complete LinkedIn connection: ${response.error.message || 'Unknown error'}`);
          setTimeout(() => navigate('/settings?tab=connections'), 3000);
          return;
        }
        
        if (!response.data?.success) {
          console.error('OAuth callback returned error:', response.data);
          setStatus('error');
          const errorMsg = response.data?.error || 'OAuth callback failed';
          setErrorMessage(errorMsg);
          toast.error(`LinkedIn connection failed: ${errorMsg}`);
          setTimeout(() => navigate('/settings?tab=connections'), 3000);
          return;
        }
        
        console.log('OAuth callback completed successfully');
        setStatus('success');
        toast.success('Successfully connected to LinkedIn!');
        
        // Trigger BlakQube update
        try {
          const { blakQubeService } = await import('@/services/blakqube-service');
          await blakQubeService.updateBlakQubeFromConnections();
          console.log('BlakQube updated with LinkedIn data');
        } catch (updateError) {
          console.warn('Failed to update BlakQube:', updateError);
        }
        
        setTimeout(() => navigate('/settings?tab=connections'), 1500);
        
      } catch (err) {
        console.error('Unexpected error in OAuth callback:', err);
        setStatus('error');
        
        const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
        setErrorMessage(errorMsg);
        toast.error(`An error occurred during LinkedIn connection: ${errorMsg}`);
        setTimeout(() => navigate('/settings?tab=connections'), 3000);
      }
    };
    
    completeOAuth();
  }, [code, error, navigate, service, state, errorDescription]);
  
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
            <Loader2 className="h-16 w-16 text-qrypto-primary animate-spin" />
          )}
          {status === 'success' && (
            <Check className="h-16 w-16 text-green-500" />
          )}
          {status === 'error' && (
            <X className="h-16 w-16 text-red-500" />
          )}
          <p className="mt-4 text-muted-foreground text-center">
            {status === 'processing' && 'Please wait while we complete your LinkedIn authorization...'}
            {status === 'success' && 'Successfully connected to LinkedIn! Redirecting to settings...'}
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
