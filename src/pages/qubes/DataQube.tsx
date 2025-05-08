
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Database } from 'lucide-react';

const DataQube = () => {
  return (
    <div className="container py-6 max-w-7xl mx-auto">
      <div className="flex items-center mb-6">
        <Database className="h-8 w-8 text-iqube-primary mr-3" />
        <div>
          <h1 className="text-2xl font-bold">MonDAI DataQube</h1>
          <p className="text-muted-foreground">Explore and manage your personal data insights</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Data</CardTitle>
            <CardDescription>Your core identity information</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Your DataQube is your secure personal data vault. View and manage what information is stored about you.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>Control your data visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Configure how your data is shared and who can access different parts of your profile.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataQube;
