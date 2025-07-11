
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { asyncConnectionProcessor } from '@/services/blakqube/async-connection-processor';
import { connectionStateManager } from '@/services/connection-state-manager';
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
      console.log('🚀 OAuth callback handler started');
      
      try {
        const service = searchParams.get('service');
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        const connectionDataParam = searchParams.get('connection_data');
        
        console.log('OAuth callback params:', { service, success, error, hasConnectionData: !!connectionDataParam });
        
        // Handle OAuth errors first
        if (error) {
          console.error('OAuth error:', error);
          if (service) {
            connectionStateManager.setConnectionState(service, 'error');
            connectionStateManager.cleanupOAuthState(service);
          }
          setStatus('error');
          setMessage(`Connection failed: ${error}`);
          toast.error(`Failed to connect to ${service}: ${error}`);
          setTimeout(() => navigate('/settings?tab=connections'), 2000);
          return;
        }
        
        // Validate required parameters
        if (success !== 'true' || !service || !connectionDataParam) {
          console.error('Missing required OAuth parameters');
          setStatus('error');
          setMessage('Invalid callback parameters.');
          toast.error('Invalid OAuth callback.');
          setTimeout(() => navigate('/settings?tab=connections'), 2000);
          return;
        }
        
        // Parse connection data
        let connectionData;
        try {
          connectionData = JSON.parse(decodeURIComponent(connectionDataParam));
          console.log('✅ Connection data parsed successfully');
        } catch (parseError) {
          console.error('❌ Failed to parse connection data:', parseError);
          setStatus('error');
          setMessage('Invalid connection data received.');
          toast.error('Invalid connection data received.');
          setTimeout(() => navigate('/settings?tab=connections'), 2000);
          return;
        }
        
        // Verify user authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          console.error('❌ User not authenticated:', authError);
          setStatus('error');
          setMessage('Authentication required. Please log in.');
          toast.error('You must be logged in to connect services.');
          setTimeout(() => navigate('/'), 2000);
          return;
        }
        
        console.log('✅ User authenticated, saving connection...');
        
        // CRITICAL: Save connection to database FIRST (keep it simple and fast)
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
          console.error('❌ Failed to save connection:', saveError);
          setStatus('error');
          setMessage('Failed to save connection data.');
          toast.error(`Failed to save ${service} connection.`);
          setTimeout(() => navigate('/settings?tab=connections'), 2000);
          return;
        }
        
        console.log(`✅ ${service} connection saved to database`);
        
        // Update connection state and cleanup OAuth data
        connectionStateManager.setConnectionState(service, 'connected');
        connectionStateManager.cleanupOAuthState(service);
        
        // Clean up localStorage OAuth state
        const keysToClean = ['oauth_state', 'oauth_service', 'oauth_linkedin', 'linkedin_connection_attempt'];
        keysToClean.forEach(key => {
          localStorage.removeItem(key);
          try {
            sessionStorage.removeItem(key);
          } catch (e) {
            // Ignore sessionStorage errors
          }
        });
        
        // Show success immediately
        setStatus('success');
        setMessage(`${service} connected successfully!`);
        toast.success(`${service} connected successfully`);
        
        // Trigger UI refresh
        const connectionEvent = new CustomEvent('connectionsUpdated');
        window.dispatchEvent(connectionEvent);
        
        // Start background processing (completely separate from OAuth success)
        asyncConnectionProcessor.processConnectionAsync(user.id, service, connectionData)
          .catch(error => {
            console.warn('Background processing failed (OAuth still successful):', error);
          });
        
        // Quick redirect back to settings
        setTimeout(() => {
          navigate('/settings?tab=connections');
        }, 1500);
        
      } catch (error) {
        console.error('❌ Unexpected error in OAuth callback:', error);
        setStatus('error');
        setMessage('An unexpected error occurred.');
        toast.error('An unexpected error occurred.');
        setTimeout(() => navigate('/settings?tab=connections'), 2000);
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
