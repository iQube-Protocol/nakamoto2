
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy, CheckCircle, Trash2, Wrench, ExternalLink } from 'lucide-react';

interface DeploymentHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeploymentHelpDialog: React.FC<DeploymentHelpDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedCommand(id);
        setTimeout(() => setCopiedCommand(null), 2000);
      })
      .catch(err => console.error('Failed to copy:', err));
  };

  const projectId = 'odzaacarlkmxqrpmggwe';
  const deleteCommand = `supabase functions delete kbai-connector --project-ref ${projectId}`;
  const deploymentCommand = `supabase functions deploy kbai-connector --project-ref ${projectId}`;
  const dashboardUrl = `https://supabase.com/dashboard/project/${projectId}/functions`;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Fix Edge Function Deployment</DialogTitle>
          <DialogDescription>
            Follow these steps carefully to fix the "kbai-connector" edge function deployment issues.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm">
            <h4 className="font-medium text-amber-800">Common Issues</h4>
            <ol className="list-decimal ml-5 mt-2 space-y-2 text-amber-700">
              <li>Multiple versions of the same function causing conflicts</li>
              <li>Incorrect CORS configuration preventing browser access</li>
              <li>Function not deployed after project creation or changes</li>
              <li>JWT verification settings misconfigured</li>
            </ol>
          </div>
          
          <div className="bg-muted p-4 rounded text-sm">
            <h3 className="font-medium mb-2 flex items-center gap-1">
              <span>Step 1: Access Supabase Dashboard</span>
            </h3>
            <div className="flex justify-between items-center mb-3">
              <p className="text-muted-foreground">Open your Supabase project dashboard to manage edge functions:</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-1"
                onClick={() => window.open(dashboardUrl, '_blank')}
              >
                <ExternalLink size={14} />
                Open Dashboard
              </Button>
            </div>
            
            <h3 className="font-medium mb-2 mt-4 flex items-center gap-1">
              <Trash2 size={16} className="text-red-500" />
              <span>Step 2: Remove Existing Functions</span>
            </h3>
            <p className="text-muted-foreground mb-2">Delete any existing "kbai-connector" functions:</p>
            <div className="bg-background flex items-center justify-between p-2 rounded border mt-1">
              <code className="font-mono text-xs">{deleteCommand}</code>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => copyToClipboard(deleteCommand, 'delete')}
                className="h-7 px-2 ml-2"
              >
                {copiedCommand === 'delete' ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
              </Button>
            </div>
            
            <h3 className="font-medium mb-2 mt-4">
              <span>Step 3: Deploy Fresh Function</span>
            </h3>
            <div className="bg-background flex items-center justify-between p-2 rounded border mt-1">
              <code className="font-mono text-xs">{deploymentCommand}</code>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => copyToClipboard(deploymentCommand, 'deploy')}
                className="h-7 px-2 ml-2"
              >
                {copiedCommand === 'deploy' ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
              </Button>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
            <h4 className="font-medium flex items-center"><Wrench size={16} className="mr-1" /> Important Settings</h4>
            <ul className="mt-2 space-y-2 list-disc pl-5">
              <li>Set <strong>JWT verification = OFF</strong> for the kbai-connector function</li>
              <li>Enable CORS with the following headers: "Content-Type", "Authorization", "x-client-info", "apikey", "x-request-id"</li>
              <li>Make sure you've deleted any duplicate functions before deploying a new one</li>
            </ul>
          </div>
          
          <p className="text-sm text-muted-foreground">
            After deployment, use the "Run Diagnostics" tool to verify your connection is working. If successful, 
            MonDAI will connect to the knowledge base and start using real data instead of fallbacks.
          </p>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.open(dashboardUrl, '_blank')}
              className="flex items-center gap-1"
            >
              <ExternalLink size={14} />
              Supabase Dashboard
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeploymentHelpDialog;
