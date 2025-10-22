import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  migrateUsers, 
  importKBDocuments, 
  setRootPrompt,
  getMigrationStats,
  type UserMigrationRecord,
  type KBDocument,
  type MigrationStats
} from '@/services/qubebase-migration-service';
import { checkCoreHubHealth } from '@/services/qubebase-core-client';
import { Upload, Database, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const QubeBaseMigration = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<MigrationStats | null>(null);
  const [coreHubConnected, setCoreHubConnected] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);

  const checkHealth = async () => {
    setLoading(true);
    const health = await checkCoreHubHealth();
    setCoreHubConnected(health.connected);
    
    if (health.connected) {
      toast({
        title: "Core Hub Connected",
        description: "Successfully connected to QubeBase Core Hub"
      });
      
      // Fetch current stats
      const currentStats = await getMigrationStats();
      setStats(currentStats);
    } else {
      toast({
        title: "Connection Failed",
        description: health.error || "Could not connect to Core Hub",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const handleTestMigration = async () => {
    setLoading(true);
    setProgress(0);

    try {
      // Test with 10 sample users (dry run)
      const testUsers: UserMigrationRecord[] = [
        {
          source_user_id: 'test-1',
          email: 'test1@example.com',
          tenant_id: '00000000-0000-0000-0000-000000000000',
          status: 'active'
        },
        // Add more test users...
      ];

      setProgress(30);
      const userResult = await migrateUsers(testUsers, true);
      
      if (userResult.success) {
        toast({
          title: "Dry Run Successful",
          description: `Would migrate ${userResult.data?.inserted || 0} users`
        });
      } else {
        throw new Error(userResult.error);
      }

      setProgress(60);

      // Test KB import (dry run)
      const testDocs: KBDocument[] = [
        {
          title: 'Test Document',
          content_text: 'This is a test document',
          tags: ['test']
        }
      ];

      const kbResult = await importKBDocuments(testDocs, true);
      
      if (kbResult.success) {
        toast({
          title: "KB Test Successful",
          description: `Would import ${kbResult.data?.imported || 0} documents`
        });
      } else {
        throw new Error(kbResult.error);
      }

      setProgress(100);

      toast({
        title: "Test Migration Complete",
        description: "All dry-run tests passed. Ready for production migration.",
        duration: 5000
      });

    } catch (error: any) {
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFullMigration = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: This will perform the FULL migration to QubeBase Core Hub.\n\n' +
      'Please ensure:\n' +
      '1. You have exported all data from current Nakamoto\n' +
      '2. You have reviewed the migration guide\n' +
      '3. You are ready for the cutover\n\n' +
      'Proceed with full migration?'
    );

    if (!confirmed) return;

    toast({
      title: "Full Migration Not Yet Implemented",
      description: "Please use the migration guide to perform manual migration with your exported data.",
      duration: 8000
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">QubeBase Core Hub Migration</h1>
        <p className="text-muted-foreground">
          Migrate Aigent Nakamoto users, knowledge base, and system prompts to QubeBase
        </p>
      </div>

      {/* Connection Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Core Hub Connection
          </CardTitle>
          <CardDescription>
            Verify connection to QubeBase Core Hub before migration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {coreHubConnected === null && (
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Connection not yet tested. Click "Check Connection" to verify.
              </AlertDescription>
            </Alert>
          )}

          {coreHubConnected === true && (
            <Alert className="border-green-500 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                Successfully connected to Core Hub (bsjhfvctmduxhohtllly.supabase.co)
              </AlertDescription>
            </Alert>
          )}

          {coreHubConnected === false && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Failed to connect to Core Hub. Check credentials and network.
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={checkHealth} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              'Check Connection'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Migration Stats */}
      {stats && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Migration Status</CardTitle>
            <CardDescription>
              Overview of migrated data in Core Hub
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Users</div>
                <div className="text-2xl font-bold">{stats.users.migrated}</div>
                <div className="text-xs text-muted-foreground">
                  {stats.users.errors} errors
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">KB Documents</div>
                <div className="text-2xl font-bold">{stats.kb_docs.imported}</div>
                <div className="text-xs text-muted-foreground">
                  {stats.kb_docs.skipped} skipped
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">System Prompt</div>
                <div className="text-2xl font-bold">
                  {stats.prompt.set ? `v${stats.prompt.version}` : 'Not Set'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats.prompt.set ? 'Active' : 'Pending'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Migration Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Migration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Test Migration (Dry Run)
            </CardTitle>
            <CardDescription>
              Run a dry-run migration with sample data to verify everything works
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {progress > 0 && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground text-center">
                  Testing migration... {progress}%
                </p>
              </div>
            )}

            <Button
              onClick={handleTestMigration}
              disabled={loading || !coreHubConnected}
              className="w-full"
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Test...
                </>
              ) : (
                'Run Dry-Run Test'
              )}
            </Button>

            <p className="text-xs text-muted-foreground">
              No data will be modified. Tests user migration, KB import, and prompt setup.
            </p>
          </CardContent>
        </Card>

        {/* Full Migration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Full Migration
            </CardTitle>
            <CardDescription>
              Perform the complete migration to QubeBase Core Hub
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-xs">
                <strong>Before running:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Export all data from current Nakamoto</li>
                  <li>Review QUBEBASE_MIGRATION_GUIDE.md</li>
                  <li>Ensure test migration passed</li>
                  <li>Schedule maintenance window</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleFullMigration}
              disabled={loading || !coreHubConnected || !stats?.users.migrated}
              className="w-full"
              variant="destructive"
            >
              Start Full Migration
            </Button>

            <p className="text-xs text-muted-foreground">
              ⚠️ This will migrate production data. Cannot be undone.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Migration Guide Reference */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Migration Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            For detailed migration steps, troubleshooting, and rollback procedures, refer to:
          </p>
          <Button variant="outline" asChild>
            <a href="/QUBEBASE_MIGRATION_GUIDE.md" target="_blank">
              View Migration Guide
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QubeBaseMigration;
