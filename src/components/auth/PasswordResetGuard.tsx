
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface PasswordResetGuardProps {
  children: React.ReactNode;
}

const PasswordResetGuard: React.FC<PasswordResetGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if this is a valid password reset URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');
    const currentPath = window.location.pathname;
    
    console.log("Password Reset Guard - URL Analysis:", {
      currentPath,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      type,
      fullURL: window.location.href,
      searchParamsString: searchParams.toString()
    });
    
    // RELAXED VALIDATION: Only redirect away if we're clearly NOT in a password reset flow
    if (currentPath === '/reset-password') {
      // If we have some recovery tokens, let it proceed
      if (accessToken && refreshToken && type === 'recovery') {
        console.log("Password Reset Guard - Valid recovery tokens found, proceeding");
        return;
      }
      
      // If we have any recovery-related parameters, let it proceed
      if (type === 'recovery' || accessToken || refreshToken) {
        console.log("Password Reset Guard - Partial recovery tokens found, allowing access");
        return;
      }
      
      // If we're on reset-password but have NO recovery indicators at all,
      // wait a moment for potential URL updates before redirecting
      console.log("Password Reset Guard - No recovery tokens, waiting for potential updates...");
      
      const timeoutId = setTimeout(() => {
        // Double-check after a brief delay
        const updatedParams = new URLSearchParams(window.location.search);
        const hasRecoveryType = updatedParams.get('type') === 'recovery';
        const hasAnyTokens = updatedParams.get('access_token') || updatedParams.get('refresh_token');
        
        if (!hasRecoveryType && !hasAnyTokens) {
          console.log("Password Reset Guard - Still no recovery tokens after delay, redirecting to signin");
          navigate('/signin', { replace: true });
        } else {
          console.log("Password Reset Guard - Recovery tokens appeared after delay, proceeding");
        }
      }, 1000); // Give 1 second for any URL updates
      
      return () => clearTimeout(timeoutId);
    }
    
    // If we have valid recovery tokens but aren't on the reset page, redirect there
    if (accessToken && refreshToken && type === 'recovery' && currentPath !== '/reset-password') {
      console.log("Password Reset Guard - Valid tokens found, redirecting to reset page");
      const newUrl = `/reset-password?${searchParams.toString()}`;
      navigate(newUrl, { replace: true });
      return;
    }
  }, [searchParams, navigate]);

  return <>{children}</>;
};

export default PasswordResetGuard;
