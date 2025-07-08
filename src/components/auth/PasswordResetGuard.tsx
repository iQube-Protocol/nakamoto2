
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
    
    console.log("Password Reset Guard - Checking tokens:", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      type,
      currentPath: window.location.pathname
    });
    
    // If we're on the reset-password route but don't have valid tokens, redirect to signin
    if (window.location.pathname === '/reset-password') {
      if (!accessToken || !refreshToken || type !== 'recovery') {
        console.log("Password Reset Guard - Invalid tokens, redirecting to signin");
        navigate('/signin', { replace: true });
        return;
      }
    }
    
    // If we have valid recovery tokens but aren't on the reset page, redirect there
    if (accessToken && refreshToken && type === 'recovery' && window.location.pathname !== '/reset-password') {
      console.log("Password Reset Guard - Valid tokens found, redirecting to reset page");
      const newUrl = `/reset-password?${searchParams.toString()}`;
      navigate(newUrl, { replace: true });
      return;
    }
  }, [searchParams, navigate]);

  return <>{children}</>;
};

export default PasswordResetGuard;
