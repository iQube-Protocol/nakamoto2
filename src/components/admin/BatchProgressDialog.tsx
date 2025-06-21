
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { BatchProgress } from '@/services/invitation-service-types';

interface BatchProgressDialogProps {
  open: boolean;
  progress: BatchProgress | null;
  onCancel?: () => void;
  canCancel?: boolean;
}

const BatchProgressDialog = ({ open, progress, onCancel, canCancel = true }: BatchProgressDialogProps) => {
  if (!progress) return null;

  const progressPercentage = (progress.emailsProcessed / progress.totalEmails) * 100;
  const isComplete = progress.isComplete;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {isComplete ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            )}
            {isComplete ? 'Processing Complete' : 'Processing Invitations'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span>Successful: {progress.emailsSuccessful}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-red-500 mr-1" />
                <span>Failed: {progress.emailsFailed}</span>
              </div>
            </div>
            <div className="col-span-2">
              <span>Processed: {progress.emailsProcessed} / {progress.totalEmails}</span>
            </div>
          </div>

          {/* Errors */}
          {progress.errors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center text-red-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span className="font-medium">Errors ({progress.errors.length})</span>
              </div>
              <div className="max-h-20 overflow-y-auto text-xs space-y-1">
                {progress.errors.slice(0, 5).map((error, index) => (
                  <div key={index} className="text-red-600 bg-red-50 p-1 rounded">
                    {error}
                  </div>
                ))}
                {progress.errors.length > 5 && (
                  <div className="text-gray-500">...and {progress.errors.length - 5} more</div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            {canCancel && !isComplete && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            {isComplete && (
              <Button onClick={onCancel}>
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BatchProgressDialog;
