
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy, CheckCircle, Trash2, Wrench } from 'lucide-react';

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
  const deleteCommand = `supabase functions delete kbai-connector --project-ref ${projectId}`;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Fix Edge Function Deployment</DialogTitle>
          <DialogDescription>
            There appears to be an issue with the "kbai-connector" edge function. Follow these steps to fix the deployment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm">
            <h4 className="font-medium text-amber-800">Troubleshooting Steps</h4>
            <ol className="list-decimal ml-5 mt-2 space-y-2 text-amber-700">
              <li>First, check if there are multiple versions of the same function</li>
              <li>Delete any incorrect or redundant versions of the function</li>
              <li>Deploy a fresh version following the instructions below</li>
            </ol>
          </div>
          
          <div className="bg-muted p-4 rounded text-sm">
            <h3 className="font-medium mb-2">Step 1: Remove Existing Function</h3>
            <p className="text-muted-foreground mb-2">If you have issues with duplicate functions, delete the existing one first:</p>
            <div className="bg-background flex items-center justify-between p-2 rounded border mt-1">
              <code className="font-mono text-xs">{deleteCommand}</code>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => copyToClipboard(deleteCommand)}
                className="h-7 px-2 ml-2"
              >
                {copied ? <CheckCircle size={14} className="text-green-500" /> : <Trash2 size={14} />}
              </Button>
            </div>
            
            <h3 className="font-medium mb-2 mt-4">Step 2: Deploy Fresh Function</h3>
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
          
          <div className="bg-muted p-4 rounded text-sm">
            <h3 className="font-medium mb-2">Alternative: Supabase Dashboard Method</h3>
            <ol className="list-disc ml-5 space-y-2 text-muted-foreground">
              <li>Go to the <a href={`https://supabase.com/dashboard/project/${projectId}/functions`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Dashboard Edge Functions page</a></li>
              <li>Delete any existing "kbai-connector" functions</li>
              <li>Click "Create a new function"</li>
              <li>Name it "kbai-connector"</li>
              <li>Copy the code from your project file supabase/functions/kbai-connector/index.ts</li>
              <li>Also create a folder and file for _shared/cors.ts with the CORS helper code</li>
              <li>Set the function to not verify JWT and enable CORS with proper headers</li>
            </ol>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
            <h4 className="font-medium flex items-center"><Wrench size={16} className="mr-1" /> Important CORS Settings</h4>
            <p className="mt-1 text-blue-600">
              Make sure your CORS settings allow these headers: "Content-Type", "Authorization", "x-client-info", "apikey", "x-request-id" to fix connection issues.
            </p>
          </div>
          
          <p className="text-sm text-muted-foreground">
            After deployment, test the function by clicking "Run Diagnostics" in the alert panel.
            If successful, the knowledge base will connect and start using real data instead of fallbacks.
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
