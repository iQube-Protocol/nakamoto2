
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryAttempts, setRetryAttempts] = useState(0);
  
  const service = searchParams.get('service');
  const success = searchParams.get('success');
  const error = searchParams.get('error');
  const state = searchParams.get('state');
  const connectionDataParam = searchParams.get('connection_data');
  
  const maxRetryAttempts = 2;
  
  const handleRetry = () => {
    if (retryAttempts < maxRetryAttempts) {
      setRetryAttempts(prev => prev + 1);
      setStatus('processing');
      setErrorMessage('');
      // Trigger the OAuth completion again
      completeOAuth();
    } else {
      toast.error('Maximum retry attempts reached. Please try connecting again.');
      navigate('/settings?tab=connections');
    }
  };
  
  const completeOAuth = async () => {
    console.log('OAuth callback started:', { 
      service, 
      success, 
      error, 
      hasConnectionData: !!connectionDataParam,
      retryAttempt: retryAttempts 
    });
    
    // Clean up any stored OAuth attempts
    try {
      const storedAttempt = localStorage.getItem('oauth_attempt');
      if (storedAttempt) {
        const attempt = JSON.parse(storedAttempt);
        console.log('Found stored OAuth attempt:', attempt);
        localStorage.removeItem('oauth_attempt');
      }
    } catch (e) {
      console.warn('Failed to parse stored OAuth attempt:', e);
      localStorage.removeItem('oauth_attempt');
    }
    
    // Handle errors passed from the edge function
    if (error) {
      console.error('OAuth error from edge function:', error);
      setStatus('error');
      const decodedError = decodeURIComponent(error);
      setErrorMessage(decodedError);
      
      // Provide more specific error handling
      if (decodedError.includes('config')) {
        toast.error('Service configuration error. Please contact support.');
      } else if (decodedError.includes('token_exchange')) {
        toast.error('Authentication failed. Please try connecting again.');
      } else {
        toast.error(`LinkedIn authorization failed: ${decodedError}`);
      }
      
      setTimeout(() => navigate('/settings?tab=connections'), 5000);
      return;
    }
    
    // Validate required parameters
    if (!service) {
      console.error('Missing service parameter');
      setStatus('error');
      setErrorMessage('Invalid OAuth callback - missing service parameter');
      toast.error('OAuth callback error: Missing service information');
      setTimeout(() => navigate('/settings?tab=connections'), 3000);
      return;
    }
    
    if (service !== 'linkedin') {
      console.error('Unsupported service:', service);
      setStatus('error');
      setErrorMessage(`Unsupported service: ${service}`);
      toast.error(`OAuth callback error: ${service} is not yet supported`);
      setTimeout(() => navigate('/settings?tab=connections'), 3000);
      return;
    }

    if (!success || !connectionDataParam) {
      console.error('Missing success indicator or connection data');
      setStatus('error');
      setErrorMessage('OAuth callback incomplete - missing data');
      toast.error('OAuth callback error: Incomplete authorization data');
      setTimeout(() => navigate('/settings?tab=connections'), 3000);
      return;
    }
    
    try {
      console.log('Getting current session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error('Session error:', sessionError);
        setStatus('error');
        setErrorMessage('Authentication session error - please sign in again');
        toast.error('Please sign in and try connecting again');
        setTimeout(() => navigate('/signin'), 3000);
        return;
      }
      
      console.log('Session validated, saving connection data...');
      
      // Parse the connection data with error handling
      let connectionData;
      try {
        connectionData = JSON.parse(decodeURIComponent(connectionDataParam));
      } catch (parseError) {
        console.error('Failed to parse connection data:', parseError);
        setStatus('error');
        setErrorMessage('Invalid connection data received from LinkedIn');
        toast.error('Failed to process LinkedIn connection data');
        setTimeout(() => navigate('/settings?tab=connections'), 3000);
        return;
      }
      
      // Validate connection data structure
      if (!connectionData || typeof connectionData !== 'object') {
        console.error('Invalid connection data structure:', connectionData);
        setStatus('error');
        setErrorMessage('Invalid connection data structure');
        toast.error('Received invalid data from LinkedIn');
        setTimeout(() => navigate('/settings?tab=connections'), 3000);
        return;
      }
      
      console.log('Connection data parsed:', {
        connected: connectionData.connected,
        hasProfile: !!connectionData.profile,
        hasEmail: !!connectionData.email,
        profileId: connectionData.profile?.id
      });

      // Save connection to database with retry logic
      const { error: insertError } = await supabase
        .from("user_connections")
        .upsert({
          user_id: session.user.id,
          service: "linkedin",
          connected_at: new Date().toISOString(),
          connection_data: connectionData,
        });

      if (insertError) {
        console.error("Database insert error:", insertError);
        
        if (retryAttempts < maxRetryAttempts) {
          console.log(`Retrying database insert (attempt ${retryAttempts + 1})`);
          setTimeout(() => handleRetry(), 2000);
          return;
        }
        
        setStatus('error');
        setErrorMessage('Failed to save connection to database');
        toast.error('Failed to save LinkedIn connection. Please try again.');
        setTimeout(() => navigate('/settings?tab=connections'), 3000);
        return;
      }

      console.log('LinkedIn connection saved successfully');
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
        // Don't fail the connection for this
      }
      
      setTimeout(() => navigate('/settings?tab=connections'), 2000);
      
    } catch (err) {
      console.error('Unexpected error in OAuth callback:', err);
      
      if (retryAttempts < maxRetryAttempts) {
        console.log(`Retrying OAuth completion (attempt ${retryAttempts + 1})`);
        setTimeout(() => handleRetry(), 2000);
        return;
      }
      
      setStatus('error');
      
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrorMessage(errorMsg);
      toast.error(`An error occurred during LinkedIn connection: ${errorMsg}`);
      setTimeout(() => navigate('/settings?tab=connections'), 3000);
    }
  };
  
  useEffect(() => {
    completeOAuth();
  }, [success, error, service, state, connectionDataParam]);
  
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === 'processing' && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === 'success' && <Check className="h-5 w-5 text-green-500" />}
            {status === 'error' && <X className="h-5 w-5 text-red-500" />}
            LinkedIn Connection
          </CardTitle>
          <CardDescription>
            {status === 'processing' && 'Completing LinkedIn authorization...'}
            {status === 'success' && 'LinkedIn connected successfully!'}
            {status === 'error' && 'LinkedIn connection failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
          {status === 'processing' && (
            <div className="text-center">
              <Loader2 className="h-16 w-16 text-iqube-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                Please wait while we complete your LinkedIn authorization...
                {retryAttempts > 0 && ` (Retry attempt ${retryAttempts})`}
              </p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-center">
              <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Successfully connected to LinkedIn! Redirecting to settings...
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
              <div>
                <p className="text-muted-foreground mb-2">
                  Connection failed: {errorMessage}
                </p>
                {retryAttempts < maxRetryAttempts ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      You can try again or return to settings
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" size="sm" onClick={handleRetry}>
                        Try Again ({maxRetryAttempts - retryAttempts} attempts left)
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate('/settings?tab=connections')}>
                        Back to Settings
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Maximum retry attempts reached. Redirecting to settings...
                    </p>
                    <Button variant="outline" size="sm" onClick={() => navigate('/settings?tab=connections')}>
                      Back to Settings Now
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;
