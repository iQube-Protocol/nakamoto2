
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DeploymentHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeploymentHelpDialog: React.FC<DeploymentHelpDialogProps> = ({
  open,
  onOpenChange
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Deploy Edge Function</DialogTitle>
          <DialogDescription>
            To enable the knowledge base integration, you need to deploy the "kbai-connector" edge function to your Supabase project.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="bg-muted p-3 rounded text-sm">
            <h3 className="font-medium mb-2">Deployment Options</h3>
            <ol className="list-decimal ml-5 space-y-3">
              <li>
                <span className="font-medium">Supabase Dashboard:</span> Log in to Supabase, go to Edge Functions section, 
                create a new function named "kbai-connector" and copy the code from your project.
              </li>
              <li>
                <span className="font-medium">Supabase CLI:</span> Install the Supabase CLI, log in, and run 
                <pre className="bg-background p-2 rounded mt-1 font-mono text-xs">supabase functions deploy kbai-connector</pre>
              </li>
            </ol>
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
