
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
  const success = searchParams.get('success');
  const error = searchParams.get('error');
  const state = searchParams.get('state');
  const connectionDataParam = searchParams.get('connection_data');
  
  useEffect(() => {
    const completeOAuth = async () => {
      console.log('OAuth callback started:', { service, success, error, hasConnectionData: !!connectionDataParam });
      
      // Handle errors passed from the edge function
      if (error) {
        console.error('OAuth error from edge function:', error);
        setStatus('error');
        setErrorMessage(decodeURIComponent(error));
        toast.error(`LinkedIn authorization failed: ${decodeURIComponent(error)}`);
        setTimeout(() => navigate('/settings?tab=connections'), 3000);
        return;
      }
      
      // Validate required parameters
      if (!service || service !== 'linkedin') {
        console.error('Invalid or missing service:', service);
        setStatus('error');
        setErrorMessage('Invalid OAuth callback - unsupported service');
        toast.error('OAuth callback error: Unsupported service');
        setTimeout(() => navigate('/settings?tab=connections'), 3000);
        return;
      }

      if (!success || !connectionDataParam) {
        console.error('Missing success indicator or connection data');
        setStatus('error');
        setErrorMessage('OAuth callback incomplete - missing data');
        toast.error('OAuth callback error: Incomplete data');
        setTimeout(() => navigate('/settings?tab=connections'), 3000);
        return;
      }
      
      try {
        console.log('Getting current session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user) {
          console.error('Session error:', sessionError);
          setStatus('error');
          setErrorMessage('Authentication session error');
          toast.error('Please sign in and try connecting again');
          setTimeout(() => navigate('/signin'), 3000);
          return;
        }
        
        console.log('Session validated, saving connection data...');
        
        // Parse the connection data
        let connectionData;
        try {
          connectionData = JSON.parse(decodeURIComponent(connectionDataParam));
        } catch (parseError) {
          console.error('Failed to parse connection data:', parseError);
          setStatus('error');
          setErrorMessage('Invalid connection data received');
          toast.error('Failed to process LinkedIn connection data');
          setTimeout(() => navigate('/settings?tab=connections'), 3000);
          return;
        }
        
        console.log('Connection data parsed:', {
          connected: connectionData.connected,
          hasProfile: !!connectionData.profile,
          hasEmail: !!connectionData.email,
          profileId: connectionData.profile?.id
        });

        // Save connection to database
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
          setStatus('error');
          setErrorMessage('Failed to save connection to database');
          toast.error('Failed to save LinkedIn connection');
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
  }, [success, error, navigate, service, state, connectionDataParam]);
  
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
