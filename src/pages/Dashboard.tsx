
import React from 'react';
import DashboardOverview from '@/components/dashboard/DashboardOverview';

const Dashboard = () => {
  return (
    <div className="container py-6 max-w-7xl mx-auto">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <DashboardOverview />
      </div>
    </div>
  );
};

export default Dashboard;
