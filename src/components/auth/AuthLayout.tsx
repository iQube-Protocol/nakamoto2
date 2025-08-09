import React from 'react';
import { Link } from 'react-router-dom';
interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}
const AuthLayout = ({
  children,
  title,
  subtitle
}: AuthLayoutProps) => {
  return <div className="flex min-h-screen bg-gradient-to-br from-iqube-primary/10 via-background to-iqube-accent/5">
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/438c385c-d221-4fb4-b8b8-d6d8056933e2.png" 
                alt="Aigent Nakamoto" 
                className="h-20 w-auto"
              />
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold text-foreground">{title}</h2>
            {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-iqube-primary/30 to-iqube-accent/30">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        </div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12">
          <img 
            src="/lovable-uploads/438c385c-d221-4fb4-b8b8-d6d8056933e2.png" 
            alt="Aigent Nakamoto" 
            className="h-32 w-auto mb-6"
          />
          <p className="text-xl opacity-80 max-w-lg text-center">
            Your secure and privacy-focused gateway to Web3 communities
          </p>
        </div>
      </div>
    </div>;
};
export default AuthLayout;