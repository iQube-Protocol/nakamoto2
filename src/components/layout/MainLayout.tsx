
import React from 'react';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 w-full p-4 md:p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
