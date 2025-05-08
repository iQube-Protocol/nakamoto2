
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FolderGit2 } from 'lucide-react';

const ToolQube = () => {
  return (
    <div className="container py-6 max-w-7xl mx-auto">
      <div className="flex items-center mb-6">
        <FolderGit2 className="h-8 w-8 text-iqube-primary mr-3" />
        <div>
          <h1 className="text-2xl font-bold">GDrive ToolQube</h1>
          <p className="text-muted-foreground">Connect and manage your external tools and resources</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Google Drive Connection</CardTitle>
            <CardDescription>Link your documents and files</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Connect your Google Drive to access and analyze your documents with MonDAI.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Document Management</CardTitle>
            <CardDescription>Organize your learning materials</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Browse, search, and organize documents that you've shared with MonDAI for analysis.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ToolQube;
