
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TestTube, ExternalLink, Copy, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { invitationService } from '@/services/invitation-service';
import { useAuth } from '@/hooks/use-auth';

const InvitationTestPanel = () => {
  const [testToken, setTestToken] = useState('');
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testResults, setTestResults] = useState<{
    edgeFunctionUrl?: string;
    directTestResult?: string;
    invitationData?: any;
    error?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { signOut } = useAuth();

  const generateTestUrl = () => {
    const supabaseUrl = 'https://ysykvckvggaqykhhntyo.supabase.co';
    return `${supabaseUrl}/functions/v1/invitation-redirect?token=${testToken}`;
  };

  const testEdgeFunction = async () => {
    if (!testToken.trim()) {
      toast.error('Please enter a test token');
      return;
    }

    setIsLoading(true);
    setTestResults({});

    try {
      const testUrl = generateTestUrl();
      console.log('🧪 Testing edge function with URL:', testUrl);

      // Test the edge function directly
      const response = await fetch(testUrl, {
        method: 'GET',
        redirect: 'manual' // Don't follow redirects so we can see the response
      });

      console.log('🔍 Edge function response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      const locationHeader = response.headers.get('Location');
      
      setTestResults({
        edgeFunctionUrl: testUrl,
        directTestResult: `Status: ${response.status}\nLocation Header: ${locationHeader || 'None'}\nResponse: ${response.statusText}`
      });

      if (response.status === 302 && locationHeader) {
        toast.success('✅ Edge function is working! It returned a redirect.');
      } else {
        toast.warning(`⚠️ Edge function responded with status ${response.status}. Expected 302 redirect.`);
      }

    } catch (error: any) {
      console.error('❌ Test failed:', error);
      setTestResults({
        error: `Test failed: ${error.message}`
      });
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testInvitationLookup = async () => {
    if (!testToken.trim()) {
      toast.error('Please enter a test token');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔍 Looking up invitation with token:', testToken.substring(0, 12) + '...');
      const invitation = await invitationService.getInvitationByToken(testToken);
      
      setTestResults(prev => ({
        ...prev,
        invitationData: invitation
      }));

      if (invitation) {
        toast.success('✅ Found invitation in database');
      } else {
        toast.warning('⚠️ No invitation found with this token');
      }
    } catch (error: any) {
      console.error('❌ Invitation lookup failed:', error);
      toast.error(`Invitation lookup failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createTestInvitation = async () => {
    if (!testEmail.trim()) {
      toast.error('Please enter a test email');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🆕 Creating test invitation for:', testEmail);
      const result = await invitationService.createInvitations([{
        email: testEmail,
        personaType: 'knyt',
        personaData: { 'First-Name': 'Test', 'Last-Name': 'User' }
      }]);

      if (result.success) {
        toast.success('✅ Test invitation created successfully');
        // Get the created invitation to extract the token
        const invitations = await invitationService.getPendingEmailSend(1);
        if (invitations.length > 0) {
          const invitation = invitations.find(inv => inv.email === testEmail);
          if (invitation) {
            // We need to get the full invitation data with token
            console.log('📧 Test invitation created, you can now test with this email');
          }
        }
      } else {
        toast.error(`Failed to create test invitation: ${result.errors.join(', ')}`);
      }
    } catch (error: any) {
      console.error('❌ Failed to create test invitation:', error);
      toast.error(`Failed to create test invitation: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  const signOutAndTest = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully. You can now test invitation flows.');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TestTube className="h-5 w-5 mr-2" />
            Invitation System Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Current Status:</strong> You are signed in as a user. To test invitation flows properly, you may need to sign out or use an incognito window.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end">
            <Button 
              onClick={signOutAndTest}
              variant="outline"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out for Testing
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>1. Create Test Invitation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="test-email">Test Email</Label>
            <div className="flex space-x-2">
              <Input
                id="test-email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter test email address"
                className="flex-1"
              />
              <Button 
                onClick={createTestInvitation}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Test Edge Function Redirect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="test-token">Test Token</Label>
            <div className="flex space-x-2">
              <Input
                id="test-token"
                value={testToken}
                onChange={(e) => setTestToken(e.target.value)}
                placeholder="Enter invitation token for testing"
                className="flex-1"
              />
              <Button 
                onClick={testEdgeFunction}
                disabled={isLoading}
              >
                {isLoading ? 'Testing...' : 'Test Redirect'}
              </Button>
              <Button 
                onClick={testInvitationLookup}
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? 'Looking up...' : 'Lookup'}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Enter any test token to verify the edge function redirect is working
            </p>
          </div>

          {testResults.edgeFunctionUrl && (
            <div className="space-y-3">
              <div>
                <Label>Generated Edge Function URL</Label>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                  <code className="text-sm flex-1 break-all">{testResults.edgeFunctionUrl}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(testResults.edgeFunctionUrl!)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openInNewTab(testResults.edgeFunctionUrl!)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {testResults.directTestResult && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Edge Function Test Results:</strong>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
                      {testResults.directTestResult}
                    </pre>
                  </AlertDescription>
                </Alert>
              )}

              {testResults.invitationData && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Database Lookup Results:</strong>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
                      {JSON.stringify(testResults.invitationData, null, 2)}
                    </pre>
                  </AlertDescription>
                </Alert>
              )}

              {testResults.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Error:</strong> {testResults.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
            <li><strong>Create a test invitation</strong> using the form above</li>
            <li><strong>Check the admin dashboard</strong> to find the invitation token</li>
            <li><strong>Test the edge function</strong> by entering the token and clicking "Test Redirect"</li>
            <li><strong>Sign out</strong> and test the full invitation flow in an incognito window</li>
            <li><strong>Check browser network tab</strong> for detailed request/response information</li>
          </ol>
          
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> To properly test invitation flows, you should be signed out or use an incognito window, as the system behaves differently for authenticated users.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationTestPanel;
