
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { sessionManager } from '@/services/session-manager';
import { detectBrowser, getBraveCompatibilityInstructions } from '@/utils/browserDetection';
import { toast } from 'sonner';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

export const SessionStatusIndicator: React.FC = () => {
  const { user, session, refreshSession } = useAuth();
  const [isValidating, setIsValidating] = useState(false);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  const browserInfo = detectBrowser();

  // Validate session periodically
  useEffect(() => {
    const validateCurrentSession = async () => {
      if (user && session) {
        const { isValid } = await sessionManager.validateSession();
        setSessionValid(isValid);
      }
    };

    validateCurrentSession();

    // Set up periodic validation
    const interval = setInterval(validateCurrentSession, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [user, session]);

  const handleRefreshSession = async () => {
    setIsValidating(true);
    try {
      const success = await refreshSession();
      if (success) {
        toast.success('Session refreshed successfully');
        setSessionValid(true);
      } else {
        toast.error('Failed to refresh session');
        setSessionValid(false);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      toast.error('Error refreshing session');
      setSessionValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const showBraveInstructions = () => {
    const instructions = getBraveCompatibilityInstructions();
    toast.info('Brave Browser Setup', {
      description: instructions.join('\n• '),
      duration: 15000
    });
  };

  // Don't show for guest users
  if (!user || !session) {
    return null;
  }

  // Show warning for Brave users with session issues
  if (browserInfo.isBrave && sessionValid === false) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <span className="text-sm text-amber-800">Brave Shield may be blocking sessions</span>
        <Button
          size="sm"
          variant="outline"
          onClick={showBraveInstructions}
          className="h-6 px-2 text-xs"
        >
          Fix
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={sessionValid === true ? "default" : sessionValid === false ? "destructive" : "secondary"}
        className="flex items-center gap-1"
      >
        {sessionValid === true ? (
          <Wifi className="h-3 w-3" />
        ) : sessionValid === false ? (
          <WifiOff className="h-3 w-3" />
        ) : null}
        {sessionValid === true ? 'Connected' : sessionValid === false ? 'Session Issue' : 'Checking...'}
      </Badge>

      {sessionValid === false && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefreshSession}
          disabled={isValidating}
          className="h-6 px-2 text-xs"
        >
          {isValidating ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            'Refresh'
          )}
        </Button>
      )}
    </div>
  );
};
