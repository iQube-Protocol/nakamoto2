
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { blakQubeService } from '@/services/blakqube-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(true);
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your connection...');
  
  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Detect Brave browser for enhanced debugging
        const isBrave = (navigator as any).brave && typeof (navigator as any).brave.isBrave === 'function';
        if (isBrave) {
          console.log('🛡️ Brave: OAuth callback handler started');
          console.log('🛡️ Brave: Current URL:', window.location.href);
          console.log('🛡️ Brave: Search params:', searchParams.toString());
          console.log('🛡️ Brave: localStorage available:', typeof localStorage !== 'undefined');
          
          // Check localStorage state
          const oauthState = localStorage.getItem('oauth_state');
          const oauthService = localStorage.getItem('oauth_service');
          console.log('🛡️ Brave: OAuth state in localStorage:', { oauthState, oauthService });
        }
        
        const service = searchParams.get('service');
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        const connectionDataParam = searchParams.get('connection_data');
        
        console.log('OAuth callback received:', { service, success, error, hasConnectionData: !!connectionDataParam });
        
        if (isBrave) {
          console.log('🛡️ Brave: Processing OAuth callback for service:', service);
        }
        
        if (error) {
          console.error('OAuth error:', error);
          setStatus('error');
          setMessage(`Connection failed: ${error}`);
          toast.error(`Failed to connect to ${service}: ${error}`);
          setTimeout(() => navigate('/settings?tab=connections'), 3000);
          return;
        }
        
        if (success === 'true' && service && connectionDataParam) {
          try {
            const connectionData = JSON.parse(decodeURIComponent(connectionDataParam));
            console.log('Parsed connection data:', connectionData);
            
            // Get the current user
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
              console.error('User not authenticated:', authError);
              setStatus('error');
              setMessage('Authentication required. Please log in.');
              toast.error('You must be logged in to connect services.');
              setTimeout(() => navigate('/'), 3000);
              return;
            }
            
            // Enhanced cleanup for Brave
            const isBrave = (navigator as any).brave && typeof (navigator as any).brave.isBrave === 'function';
            if (isBrave) {
              console.log('🛡️ Brave: Enhanced OAuth cleanup starting');
              // Clean up both localStorage and sessionStorage for Brave
              const keysToClean = ['oauth_state', 'oauth_service', 'oauth_linkedin'];
              keysToClean.forEach(key => {
                localStorage.removeItem(key);
                try {
                  sessionStorage.removeItem(key);
                } catch (e) {
                  console.log('🛡️ Brave: sessionStorage cleanup failed for', key);
                }
              });
              console.log('🛡️ Brave: OAuth cleanup completed');
            } else {
              // Clean up any existing OAuth state
              localStorage.removeItem('oauth_state');
              localStorage.removeItem('oauth_service');
            }
            
            // Save the connection to the database with proper error handling
            console.log('Saving connection to database...');
            const { error: saveError } = await supabase
              .from('user_connections')
              .upsert({
                user_id: user.id,
                service: service,
                connected_at: new Date().toISOString(),
                connection_data: connectionData
              }, {
                onConflict: 'user_id,service'
              });
            
            if (saveError) {
              console.error('Error saving connection:', saveError);
              setStatus('error');
              setMessage('Failed to save connection data.');
              toast.error(`Failed to save ${service} connection: ${saveError.message}`);
              setTimeout(() => navigate('/settings?tab=connections'), 3000);
              return;
            }
            
            console.log(`${service} connection saved successfully`);
            
            // Update BlakQube with connection data - use the correct persona type
            console.log('Updating BlakQube with connection data...');
            setMessage(`Importing your ${service} profile data...`);
            
            // Add a small delay to ensure the database has been updated
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // For now, update both persona types to maintain compatibility
            const qryptoUpdateSuccess = await blakQubeService.updatePersonaFromConnections('qrypto');
            const knytUpdateSuccess = await blakQubeService.updatePersonaFromConnections('knyt');
            
            const updateSuccess = qryptoUpdateSuccess || knytUpdateSuccess;
            
            if (updateSuccess) {
              console.log('BlakQube updated successfully with connection data');
              setStatus('success');
              
              if (service === 'linkedin') {
                setMessage('LinkedIn connected and profile data imported successfully!');
                toast.success('LinkedIn connected and profile data imported to your BlakQube');
              } else {
                setMessage(`${service} connected and data imported successfully!`);
                toast.success(`${service} connected and data imported to your BlakQube`);
              }
              
              // Trigger private data update event for immediate UI refresh
              const event = new CustomEvent('privateDataUpdated');
              window.dispatchEvent(event);
              
              // Trigger connection refresh event for settings UI
              const connectionEvent = new CustomEvent('connectionsUpdated');
              window.dispatchEvent(connectionEvent);
            } else {
              console.warn('BlakQube update failed, but connection was successful');
              setStatus('success');
              setMessage(`${service} connected successfully, but profile import failed.`);
              toast.success(`${service} connected successfully`);
            }
            
            // Redirect back to settings after a short delay
            setTimeout(() => {
              navigate('/settings?tab=connections');
            }, 2500);
            
          } catch (parseError) {
            console.error('Error parsing connection data:', parseError);
            setStatus('error');
            setMessage('Invalid connection data received.');
            toast.error('Invalid connection data received.');
            setTimeout(() => navigate('/settings?tab=connections'), 3000);
          }
        } else {
          console.error('Missing required parameters:', { service, success, connectionDataParam });
          setStatus('error');
          setMessage('Invalid callback parameters.');
          toast.error('Invalid callback parameters.');
          setTimeout(() => navigate('/settings?tab=connections'), 3000);
        }
      } catch (error) {
        console.error('Unexpected error in OAuth callback:', error);
        setStatus('error');
        setMessage('An unexpected error occurred.');
        toast.error('An unexpected error occurred during connection.');
        setTimeout(() => navigate('/settings?tab=connections'), 3000);
      } finally {
        setProcessing(false);
      }
    };
    
    handleOAuthCallback();
  }, [searchParams, navigate]);
  
  const getIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />;
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle>
            {status === 'processing' && 'Connecting...'}
            {status === 'success' && 'Connection Successful!'}
            {status === 'error' && 'Connection Failed'}
          </CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            {status === 'processing' && 'Please wait while we process your connection...'}
            {status === 'success' && 'Redirecting you back to settings...'}
            {status === 'error' && 'Redirecting you back to settings...'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;
