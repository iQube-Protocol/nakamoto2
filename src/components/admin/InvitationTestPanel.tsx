
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TestTube, ExternalLink, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const InvitationTestPanel = () => {
  const [testToken, setTestToken] = useState('');
  const [testResults, setTestResults] = useState<{
    edgeFunctionUrl?: string;
    directTestResult?: string;
    error?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TestTube className="h-5 w-5 mr-2" />
          Invitation Redirect Testing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="test-token">Test Token</Label>
          <div className="flex space-x-2">
            <Input
              id="test-token"
              value={testToken}
              onChange={(e) => setTestToken(e.target.value)}
              placeholder="Enter a test invitation token"
              className="flex-1"
            />
            <Button 
              onClick={testEdgeFunction}
              disabled={isLoading}
            >
              {isLoading ? 'Testing...' : 'Test'}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Enter any test token to verify the edge function is working
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
                  <strong>Test Results:</strong>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
                    {testResults.directTestResult}
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

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Testing Instructions:</h4>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Enter any test token (doesn't need to be real for basic testing)</li>
            <li>Click "Test" to check if the edge function responds</li>
            <li>A successful test should return a 302 redirect status</li>
            <li>Use "Open in New Tab" to see the actual redirect behavior</li>
            <li>Check the browser network tab for detailed request/response info</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvitationTestPanel;
