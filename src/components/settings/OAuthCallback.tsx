
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
      console.log('OAuth callback started:', { service, hasCode: !!code, error, errorDescription });
      
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
        console.error('Missing required parameters:', { service, hasCode: !!code });
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
        
        // Call the OAuth callback edge function using GET with URL parameters
        const callbackUrl = `${window.location.origin.replace('preview--', '')}/functions/v1/oauth-callback-linkedin?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state || '')}&service=${encodeURIComponent(service)}`;
        console.log('Calling callback URL:', callbackUrl);
        
        const response = await fetch(callbackUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'apikey': supabase.supabaseKey
          }
        });
        
        console.log('OAuth callback response status:', response.status);
        
        if (!response.ok) {
          console.error('OAuth callback request failed:', response.status, response.statusText);
          setStatus('error');
          setErrorMessage(`OAuth callback failed: ${response.status} ${response.statusText}`);
          toast.error(`Failed to complete LinkedIn connection: ${response.status} ${response.statusText}`);
          setTimeout(() => navigate('/settings?tab=connections'), 3000);
          return;
        }
        
        const responseData = await response.json();
        console.log('OAuth callback response data:', responseData);
        
        if (!responseData?.success) {
          console.error('OAuth callback returned error:', responseData);
          setStatus('error');
          const errorMsg = responseData?.error || 'OAuth callback failed';
          setErrorMessage(errorMsg);
          toast.error(`LinkedIn connection failed: ${errorMsg}`);
          setTimeout(() => navigate('/settings?tab=connections'), 3000);
          return;
        }
        
        console.log('OAuth callback completed successfully');
        setStatus('success');
        toast.success('Successfully connected to LinkedIn!');
        
        // Trigger BlakQube update and refresh private data
        try {
          console.log('Updating BlakQube with LinkedIn data...');
          const { blakQubeService } = await import('@/services/blakqube-service');
          await blakQubeService.updateBlakQubeFromConnections();
          console.log('BlakQube updated with LinkedIn data');
          
          // Dispatch custom event to refresh private data
          const updateEvent = new CustomEvent('privateDataUpdated');
          window.dispatchEvent(updateEvent);
          console.log('Private data update event dispatched');
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
