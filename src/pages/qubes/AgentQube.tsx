
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Database } from 'lucide-react'; // Changed from Cube to Database

const AgentQube = () => {
  return (
    <div className="container py-6 max-w-7xl mx-auto">
      <div className="flex items-center mb-6">
        <Database className="h-8 w-8 text-iqube-primary mr-3" /> {/* Changed from Cube to Database */}
        <div>
          <h1 className="text-2xl font-bold">Metis AgentQube</h1>
          <p className="text-muted-foreground">Your AI assistant for learning and guidance</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Agent Settings</CardTitle>
            <CardDescription>Configure your Metis AI assistant</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Adjust how Metis interacts with you and customize your learning experience.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Learning Preferences</CardTitle>
            <CardDescription>Personalize your education path</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Set your learning goals, difficulty preferences, and areas of interest.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentQube;
