import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
import {
  exportNakamotoRootKB,
  exportNakamotoRootPrompt,
  getMigrationStats as getKBExportStats
} from '@/services/qubebase-kb-export';
import {
  getUserMigrationStats,
  exportUsersForMigration,
  type UserMigrationStats
} from '@/services/user-export-service';
import { Upload, Database, FileText, CheckCircle, AlertCircle, Loader2, Users } from 'lucide-react';

const QubeBaseMigration = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<MigrationStats | null>(null);
  const [userStats, setUserStats] = useState<UserMigrationStats | null>(null);
  const [coreHubConnected, setCoreHubConnected] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('kb');

  useEffect(() => {
    // Auto-check Core Hub connection on mount and load user stats
    if (coreHubConnected === null) {
      checkHealth();
    }
    loadUserStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserStats = async () => {
    const stats = await getUserMigrationStats();
    setUserStats(stats);
  };

  const checkHealth = async () => {
    setLoading(true);
    const health = await checkCoreHubHealth();
    setCoreHubConnected(health.connected);
    
    console.log('Health check result:', health);
    
    if (health.connected) {
      if (health.error) {
        // Connected but schema not ready
        toast({
          title: "Core Hub Connected ⚠️",
          description: health.error,
          duration: 8000
        });
      } else {
        // Fully connected and ready
        toast({
          title: "Core Hub Connected ✓",
          description: "Successfully connected to QubeBase Core Hub"
        });
        
        // Fetch current stats
        const currentStats = await getMigrationStats();
        setStats(currentStats);
      }
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
      // Step 1: Export KB from code files
      toast({
        title: "Exporting KB from code",
        description: "Reading knowledge base from source files..."
      });
      
      const kbDocs = exportNakamotoRootKB();
      const kbPrompt = exportNakamotoRootPrompt();
      const kbStats = getKBExportStats();
      
      setProgress(20);
      
      toast({
        title: "KB Export Complete",
        description: `Found ${kbStats.totalDocuments} documents (COYN: ${kbStats.byDomain.qryptocoyn}, KNYT: ${kbStats.byDomain.knyt}, iQubes: ${kbStats.byDomain.iqubes})`,
        duration: 4000
      });

      // Step 2: Test user migration (dry run)
      setProgress(40);
      const testUsers: UserMigrationRecord[] = [
        {
          source_user_id: 'test-1',
          email: 'test1@example.com',
          tenant_id: '00000000-0000-0000-0000-000000000000',
          status: 'completed',
          persona_type: 'knyt',
          invitation_status: {
            invited_at: new Date().toISOString(),
            invited_by: null,
            batch_id: null,
            email_sent: true,
            email_sent_at: new Date().toISOString(),
            send_attempts: 1,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            signup_completed: true,
            completed_at: new Date().toISOString(),
            invitation_token: 'test-token'
          },
          persona_data: {},
          connection_data: [],
          name_preferences: null,
          profile: null,
          auth_user_id: null,
          auth_created_at: null,
          meta: {}
        }
      ];

      const userResult = await migrateUsers(testUsers, true);
      
      if (userResult.success) {
        toast({
          title: "User Migration Test Passed",
          description: `Would migrate ${userResult.data?.inserted || 0} users`
        });
      } else {
        throw new Error(userResult.error);
      }

      setProgress(70);

      // Step 3: Test KB import (dry run with first 5 docs)
      const testDocs = kbDocs.slice(0, 5);
      const kbResult = await importKBDocuments(testDocs, true);
      
      if (kbResult.success) {
        toast({
          title: "KB Import Test Passed",
          description: `Would import ${kbDocs.length} documents (tested ${testDocs.length})`
        });
      } else {
        throw new Error(kbResult.error);
      }

      setProgress(100);

      toast({
        title: "Test Migration Complete ✅",
        description: `Ready to migrate ${kbStats.totalDocuments} KB docs, system prompt, and users`,
        duration: 6000
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
    const kbStats = getKBExportStats();
    
    const confirmed = window.confirm(
      '⚠️ WARNING: This will perform the FULL migration to QubeBase Core Hub.\n\n' +
      'This will migrate:\n' +
      `• ${kbStats.totalDocuments} KB documents (COYN + KNYT + iQubes)\n` +
      '• Root system prompt\n' +
      '• Set up ROOT corpus for Nakamoto\n\n' +
      'Please ensure:\n' +
      '1. Test migration passed\n' +
      '2. You have reviewed the migration guide\n' +
      '3. You are ready for cutover\n\n' +
      'Proceed with full migration?'
    );

    if (!confirmed) return;

    setLoading(true);
    setProgress(0);

    try {
      // Step 1: Export KB from code
      toast({
        title: "Starting Full Migration",
        description: "Exporting knowledge base from source files..."
      });
      
      const kbDocs = exportNakamotoRootKB();
      const kbPrompt = exportNakamotoRootPrompt();
      
      setProgress(10);

      // Step 2: Set root system prompt
      toast({
        title: "Migrating System Prompt",
        description: "Setting root system prompt in QubeBase..."
      });
      
      const promptResult = await setRootPrompt(kbPrompt.prompt_text, kbPrompt.metadata);
      
      if (!promptResult.success) {
        throw new Error(`Prompt migration failed: ${promptResult.error}`);
      }
      
      toast({
        title: "System Prompt Migrated",
        description: "Root prompt active in QubeBase"
      });
      
      setProgress(30);

      // Step 3: Import all KB documents
      toast({
        title: "Importing KB Documents",
        description: `Importing ${kbDocs.length} documents to ROOT corpus...`
      });
      
      const kbResult = await importKBDocuments(kbDocs, false);
      
      if (!kbResult.success) {
        throw new Error(`KB import failed: ${kbResult.error}`);
      }
      
      setProgress(90);
      
      toast({
        title: "KB Documents Imported",
        description: `${kbDocs.length} documents migrated to ROOT corpus`
      });

      // Refresh stats
      const newStats = await getMigrationStats();
      setStats(newStats);
      
      setProgress(100);

      toast({
        title: "Migration Complete! 🎉",
        description: `Successfully migrated ${kbDocs.length} KB documents and root system prompt to QubeBase`,
        duration: 8000
      });

    } catch (error: any) {
      toast({
        title: "Migration Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserMigration = async (statusFilter?: 'completed' | 'pending' | 'expired') => {
    if (!userStats) return;

    const filterLabel = statusFilter ? ` (${statusFilter})` : '';
    const count = statusFilter 
      ? statusFilter === 'completed' ? userStats.completed 
        : statusFilter === 'pending' ? userStats.pending 
        : userStats.expired
      : userStats.total;

    const confirmed = window.confirm(
      `⚠️ Migrate ${count} users${filterLabel}?\n\n` +
      'This will migrate:\n' +
      '• User accounts and authentication\n' +
      '• Persona data (KNYT/Qrypto)\n' +
      '• Connection data (LinkedIn, wallets)\n' +
      '• Name preferences\n' +
      '• Profile information\n' +
      '• Invitation status and metadata\n\n' +
      'Proceed?'
    );

    if (!confirmed) return;

    setLoading(true);
    setProgress(0);

    try {
      toast({
        title: "Starting User Migration",
        description: `Exporting ${count} user records${filterLabel}...`
      });

      const { data: migrationRecords, error: exportError } = await exportUsersForMigration(statusFilter);
      
      if (exportError || !migrationRecords) {
        throw new Error(exportError || 'Failed to export users');
      }

      setProgress(20);

      // Migrate in batches of 100
      const batchSize = 100;
      let totalMigrated = 0;
      let totalErrors = 0;

      for (let i = 0; i < migrationRecords.length; i += batchSize) {
        const batch = migrationRecords.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(migrationRecords.length / batchSize);

        toast({
          title: `Migrating Batch ${batchNum}/${totalBatches}`,
          description: `Processing ${batch.length} users...`
        });

        const result = await migrateUsers(batch, false);
        
        if (result.success && result.data) {
          totalMigrated += result.data.inserted || 0;
          totalErrors += result.data.errors?.length || 0;
        }

        const batchProgress = 20 + (70 * (i + batch.length) / migrationRecords.length);
        setProgress(batchProgress);
      }

      setProgress(100);

      // Persist summary for status card fallback
      try {
        localStorage.setItem(
          'last_user_migration_summary',
          JSON.stringify({ migrated: totalMigrated, errors: totalErrors, at: new Date().toISOString() })
        );
      } catch {}

      // Refresh stats
      await loadUserStats();
      const newStats = await getMigrationStats();
      setStats(newStats);

      toast({
        title: "User Migration Complete! 🎉",
        description: `Successfully migrated ${totalMigrated} users${filterLabel} (${totalErrors} errors)`,
        duration: 8000
      });

    } catch (error: any) {
      toast({
        title: "Migration Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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

      {/* Migration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="kb">KB & Prompts</TabsTrigger>
          <TabsTrigger value="users">Users & Personas</TabsTrigger>
        </TabsList>

        <TabsContent value="kb" className="space-y-6">
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
              disabled={loading || !coreHubConnected}
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
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* User Migration Stats */}
          {userStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Migration Overview
                </CardTitle>
                <CardDescription>
                  Comprehensive view of all users, invitations, and personas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Total Users</div>
                    <div className="text-3xl font-bold">{userStats.total}</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Completed</div>
                    <div className="text-3xl font-bold text-green-600">{userStats.completed}</div>
                    <div className="text-xs text-muted-foreground">Active accounts</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Pending</div>
                    <div className="text-3xl font-bold text-blue-600">{userStats.pending}</div>
                    <div className="text-xs text-muted-foreground">Valid invitations</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Expired</div>
                    <div className="text-3xl font-bold text-orange-600">{userStats.expired}</div>
                    <div className="text-xs text-muted-foreground">Needs renewal</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">KNYT Personas</div>
                    <div className="text-xl font-bold">{userStats.by_persona_type.knyt}</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Qrypto Personas</div>
                    <div className="text-xl font-bold">{userStats.by_persona_type.qrypto}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Migration Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Migrate Completed Users */}
            <Card>
              <CardHeader>
                <CardTitle>Migrate Completed Users</CardTitle>
                <CardDescription>
                  Migrate {userStats?.completed || 0} active users with full persona data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription className="text-xs">
                    Includes auth accounts, persona data, connections, and profiles
                  </AlertDescription>
                </Alert>

                {progress > 0 && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-muted-foreground text-center">
                      Migrating users... {Math.round(progress)}%
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => handleUserMigration('completed')}
                  disabled={loading || !coreHubConnected || !userStats?.completed}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Migrating...
                    </>
                  ) : (
                    `Migrate ${userStats?.completed || 0} Completed Users`
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Migrate Pending Invitations */}
            <Card>
              <CardHeader>
                <CardTitle>Migrate Pending Invitations</CardTitle>
                <CardDescription>
                  Migrate {userStats?.pending || 0} valid invitations awaiting signup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="text-xs">
                    Preserves invitation tokens and expiration dates for future redemption
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={() => handleUserMigration('pending')}
                  disabled={loading || !coreHubConnected || !userStats?.pending}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Migrating...
                    </>
                  ) : (
                    `Migrate ${userStats?.pending || 0} Pending Invitations`
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Handle Expired Invitations */}
            <Card>
              <CardHeader>
                <CardTitle>Handle Expired Invitations</CardTitle>
                <CardDescription>
                  {userStats?.expired || 0} expired invitations need review
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="text-xs">
                    These invitations are past their expiration date. Consider renewal before migration.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={async () => {
                    try {
                      const { data, error } = await supabase.rpc('extend_invitation_expiration', {
                        email_list: null,
                        extend_days: 30
                      });
                      if (error) throw error;
                      const result = data as { updated_count: number; success: boolean };
                      toast({
                        title: "Invitations Extended",
                        description: `Extended ${result.updated_count} expired invitations by 30 days`
                      });
                      await loadUserStats();
                    } catch (error: any) {
                      toast({
                        title: "Extension Failed",
                        description: error.message,
                        variant: "destructive"
                      });
                    }
                  }}
                  disabled={!userStats?.expired}
                  className="w-full"
                  variant="outline"
                >
                  Extend Expired Invitations (30 days)
                </Button>

                <Button
                  onClick={() => handleUserMigration('expired')}
                  disabled={loading || !coreHubConnected || !userStats?.expired}
                  className="w-full"
                  variant="destructive"
                >
                  Migrate {userStats?.expired || 0} Expired Invitations
                </Button>
              </CardContent>
            </Card>

            {/* Migrate All Users */}
            <Card>
              <CardHeader>
                <CardTitle>Migrate All Users</CardTitle>
                <CardDescription>
                  Complete migration of all {userStats?.total || 0} users and invitations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="text-xs">
                    Migrates completed users, pending invitations, and expired records
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={() => handleUserMigration()}
                  disabled={loading || !coreHubConnected || !userStats?.total}
                  className="w-full"
                  variant="default"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Migrating All...
                    </>
                  ) : (
                    `Migrate All ${userStats?.total || 0} Users`
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

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
