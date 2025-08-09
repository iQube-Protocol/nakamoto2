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
            <Link to="/" className="flex items-center justify-center">
              <img 
                src="/aigent-nakamoto-logo.png" 
                alt="Aigent Nakamoto" 
                className="h-32 sm:h-40 md:h-48 lg:h-56 xl:h-64 w-auto max-w-full"
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
            src="/aigent-nakamoto-logo.png" 
            alt="Aigent Nakamoto" 
            className="h-40 sm:h-48 md:h-56 lg:h-64 xl:h-72 w-auto max-w-full mb-6"
          />
          <p className="text-xl opacity-80 max-w-lg text-center">
            Your private, personalized and censorship-resistant AI.
          </p>
        </div>
      </div>
    </div>;
};
export default AuthLayout;