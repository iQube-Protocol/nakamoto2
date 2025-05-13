
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy, CheckCircle } from 'lucide-react';

interface DeploymentHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeploymentHelpDialog: React.FC<DeploymentHelpDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy:', err));
  };

  const projectId = 'odzaacarlkmxqrpmggwe';
  const deploymentCommand = `supabase functions deploy kbai-connector --project-ref ${projectId}`;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Deploy Edge Function</DialogTitle>
          <DialogDescription>
            To enable the knowledge base integration, you need to deploy the "kbai-connector" edge function to your Supabase project.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="bg-muted p-4 rounded text-sm">
            <h3 className="font-medium mb-2">Deployment Options</h3>
            <ol className="list-decimal ml-5 space-y-4">
              <li>
                <span className="font-medium">Supabase Dashboard Method:</span>
                <ol className="list-disc ml-5 mt-1 space-y-1 text-muted-foreground">
                  <li>Go to the <a href={`https://supabase.com/dashboard/project/${projectId}/functions`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Dashboard Edge Functions page</a></li>
                  <li>Click "Create a new function"</li>
                  <li>Name it "kbai-connector"</li>
                  <li>Copy the code from your project file supabase/functions/kbai-connector/index.ts</li>
                  <li>Also create a folder and file for _shared/cors.ts with the CORS helper code</li>
                  <li>Set the function to not verify JWT and enable CORS</li>
                </ol>
              </li>
              
              <li className="pt-2">
                <span className="font-medium">Supabase CLI Method:</span>
                <div className="mt-1">
                  <p className="mb-1 text-muted-foreground">Run this command in your terminal after installing and logging in to the Supabase CLI:</p>
                  <div className="bg-background flex items-center justify-between p-2 rounded border mt-1">
                    <code className="font-mono text-xs">{deploymentCommand}</code>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => copyToClipboard(deploymentCommand)}
                      className="h-7 px-2 ml-2"
                    >
                      {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                    </Button>
                  </div>
                </div>
              </li>
            </ol>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
            <h4 className="font-medium">Verify Deployment</h4>
            <p className="mt-1 text-blue-600">
              After deployment, test the function by clicking "Run Diagnostics" in the alert panel.
              If successful, the knowledge base will connect and start using real data instead of fallbacks.
            </p>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Until the function is deployed, MonDAI will operate using local fallback data instead of live knowledge base data.
          </p>
          
          <Button className="w-full" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeploymentHelpDialog;
