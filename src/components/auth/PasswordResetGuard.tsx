
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface PasswordResetGuardProps {
  children: React.ReactNode;
}

const PasswordResetGuard: React.FC<PasswordResetGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const currentPath = window.location.pathname;
    
    // Only apply guard logic if we're on the reset-password page
    if (currentPath === '/reset-password') {
      console.log("Password Reset Guard - URL Analysis:", {
        currentPath,
        fullURL: window.location.href,
        searchParams: Object.fromEntries(searchParams.entries())
      });
      
      // For now, always allow access to the reset password page
      // The PasswordReset component itself will handle validation
      console.log("Password Reset Guard - Allowing access to reset password page");
      return;
    }
  }, [searchParams, navigate]);

  return <>{children}</>;
};

export default PasswordResetGuard;
