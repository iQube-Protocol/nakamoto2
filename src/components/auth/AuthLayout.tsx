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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-iqube-primary to-iqube-accent flex items-center justify-center text-white font-bold text-xl">M</div>
              <span className="ml-2 text-2xl font-bold\nThis should read Nakamoto.\n">MonDAI</span>
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
          <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-iqube-primary to-iqube-accent flex items-center justify-center">
              <span className="text-4xl font-bold">M</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-center">Aigent Nakamoto</h1>
          <p className="text-xl opacity-80 max-w-lg text-center">
            Your secure and privacy-focused gateway to Web3 communities
          </p>
        </div>
      </div>
    </div>;
};
export default AuthLayout;