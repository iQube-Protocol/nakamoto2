import React, { createContext, useContext, useEffect, ReactNode } from 'react';

interface SecurityContextProps {
  isSecureContext: boolean;
  reportSecurityViolation: (violation: string, details?: any) => void;
}

const SecurityContext = createContext<SecurityContextProps | undefined>(undefined);

export const SecurityProvider = ({ children }: { children: ReactNode }) => {
  const isSecureContext = window.location.protocol === 'https:' || window.location.hostname === 'localhost';

  const reportSecurityViolation = (violation: string, details?: any) => {
    console.warn('Security Violation:', violation, details);
    
    // In production, you might want to send this to a security monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to security monitoring endpoint
      // fetch('/api/security/violations', {
      //   method: 'POST',
      //   body: JSON.stringify({ violation, details, timestamp: new Date().toISOString() })
      // });
    }
  };

  useEffect(() => {
    // Content Security Policy violation handler
    const handleCSPViolation = (event: SecurityPolicyViolationEvent) => {
      reportSecurityViolation('CSP Violation', {
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        originalPolicy: event.originalPolicy
      });
    };

    // Add event listener for CSP violations
    document.addEventListener('securitypolicyviolation', handleCSPViolation);

    // Security headers check
    if (!isSecureContext) {
      reportSecurityViolation('Insecure Context', {
        protocol: window.location.protocol,
        hostname: window.location.hostname
      });
    }

    return () => {
      document.removeEventListener('securitypolicyviolation', handleCSPViolation);
    };
  }, [isSecureContext]);

  const value = {
    isSecureContext,
    reportSecurityViolation
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};