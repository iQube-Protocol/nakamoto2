
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Loader2, Globe, Server } from 'lucide-react';
import { DiagnosticResult } from '@/integrations/kbai/types';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface KBAIDiagnosticsProps {
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  onRunDiagnostics: () => Promise<DiagnosticResult>;
}

const KBAIDiagnostics: React.FC<KBAIDiagnosticsProps> = ({
  connectionStatus,
  onRunDiagnostics
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<DiagnosticResult | null>(null);

  const handleRunDiagnostics = async () => {
    setIsLoading(true);
    try {
      const diagnosticResults = await onRunDiagnostics();
      setResults(diagnosticResults);
    } catch (error) {
      console.error('Error running diagnostics:', error);
      setResults({
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-muted-foreground hover:text-foreground flex items-center"
      >
        <AlertCircle className="w-4 h-4 mr-1" />
        Diagnostics
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>KBAI Connection Diagnostics</DialogTitle>
            <DialogDescription>
              Run diagnostics to identify issues with the knowledge base connection
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <span>Connection Status</span>
              <span className={`px-2 py-1 rounded text-xs ${
                connectionStatus === 'connected' ? 'bg-green-100 text-green-800' : 
                connectionStatus === 'connecting' ? 'bg-blue-100 text-blue-800' : 
                'bg-amber-100 text-amber-800'
              }`}>
                {connectionStatus}
              </span>
            </div>
            
            {results && (
              <div className="space-y-3 bg-muted p-3 rounded-md">
                <h3 className="font-medium">Diagnostic Results:</h3>
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between bg-background p-2 rounded-md">
                    <span className="flex items-center">
                      <Server className="w-4 h-4 mr-2 text-muted-foreground" />
                      Edge Function Health:
                    </span>
                    <span className="flex items-center">
                      {results.edgeFunctionHealthy ? 
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-1" /> : 
                        <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                      }
                      {results.edgeFunctionHealthy ? 'Healthy' : 'Issue Detected'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-background p-2 rounded-md">
                    <span className="flex items-center">
                      <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                      CORS Configuration:
                    </span>
                    <span className="flex items-center">
                      {results.corsConfigured ? 
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-1" /> : 
                        <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                      }
                      {results.corsConfigured ? 'Configured' : 'Not Verified'}
                    </span>
                  </div>
                </div>
                
                {results.details?.edgeFunctionUrl && (
                  <div className="text-xs text-muted-foreground mt-2">
                    Edge Function URL: {results.details.edgeFunctionUrl}
                  </div>
                )}
                
                {results.error && (
                  <div className="text-red-500 text-xs mt-1 bg-red-50 p-2 rounded">
                    Error: {results.error}
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground mt-2">
                  Timestamp: {new Date(results.timestamp).toLocaleString()}
                </div>
              </div>
            )}
            
            <Button 
              onClick={handleRunDiagnostics}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Diagnostics...
                </>
              ) : 'Run Diagnostics'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KBAIDiagnostics;
