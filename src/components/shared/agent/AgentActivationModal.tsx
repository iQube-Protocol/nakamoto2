
import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  Cpu, 
  Wallet, 
  Loader2, 
  BadgeDollarSign 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AgentActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  fee: number;
  onConfirmPayment: () => Promise<boolean>;
  onComplete: () => void;
}

const AgentActivationModal = ({
  isOpen,
  onClose,
  agentName,
  fee,
  onConfirmPayment,
  onComplete
}: AgentActivationModalProps) => {
  const [currentStep, setCurrentStep] = useState<'verification' | 'fee' | 'processing' | 'complete' | 'error'>('verification');
  const [errorMessage, setErrorMessage] = useState('');
  const [processingMessage, setProcessingMessage] = useState('');

  const handleVerificationComplete = () => {
    setCurrentStep('fee');
  };

  const handleConfirmPayment = async () => {
    setCurrentStep('processing');
    setProcessingMessage('Initiating transaction...');
    
    try {
      setTimeout(() => setProcessingMessage('Verifying wallet balance...'), 1000);
      setTimeout(() => setProcessingMessage('Processing payment...'), 2500);
      
      const result = await onConfirmPayment();
      
      if (result) {
        setTimeout(() => {
          setCurrentStep('complete');
          if (agentName === 'Metis') {
            localStorage.setItem('metisActive', 'true');
            const activationEvent = new Event('metisActivated');
            window.dispatchEvent(activationEvent);
            console.log('Dispatched metisActivated event');
          }
        }, 3500);
      } else {
        setErrorMessage('Payment could not be processed. Please try again.');
        setCurrentStep('error');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      setCurrentStep('error');
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Cpu className="h-5 w-5 mr-2 text-iqube-accent" />
            Activate {agentName} Agent
          </DialogTitle>
          <DialogDescription>
            Follow the steps below to activate this specialized AI capability.
          </DialogDescription>
        </DialogHeader>

        {currentStep === 'verification' && (
          <div className="py-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-100 p-3 rounded-full">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-medium">Access Token Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Verifying that you have the necessary tokens to access this agent.
                </p>
              </div>
            </div>

            <div className="rounded-md bg-blue-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Access token verified</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    You have the necessary tokens to access the {agentName} agent.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleVerificationComplete}
              className="w-full bg-iqube-primary hover:bg-iqube-primary/90"
            >
              Continue
            </Button>
          </div>
        )}

        {currentStep === 'fee' && (
          <div className="py-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-amber-100 p-3 rounded-full">
                <BadgeDollarSign className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-medium">Micro Fee Required</h3>
                <p className="text-sm text-muted-foreground">
                  This agent requires a small fee to activate its services.
                </p>
              </div>
            </div>

            <div className="border rounded-md p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Service Fee</span>
                <span className="font-medium">{fee} $QOYN</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="font-semibold">{fee} $QOYN</span>
              </div>
              
              <div className="mt-4 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Payment will be made from your connected wallet
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmPayment}
                className="flex-1 bg-iqube-primary hover:bg-iqube-primary/90"
              >
                Confirm Payment
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'processing' && (
          <div className="py-6 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-iqube-primary mb-4" />
            <p className="text-center font-medium">{processingMessage}</p>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Please don't close this window while the transaction is processing.
            </p>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="py-6">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="bg-green-100 p-3 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium">Payment Successful</h3>
              <p className="text-center text-sm text-muted-foreground mt-2">
                You now have access to the {agentName} agent capabilities.
              </p>
            </div>

            <Button 
              onClick={handleComplete}
              className="w-full bg-iqube-primary hover:bg-iqube-primary/90"
            >
              Start Using {agentName}
            </Button>
          </div>
        )}

        {currentStep === 'error' && (
          <div className="py-6">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium">Payment Failed</h3>
              <p className="text-center text-sm text-red-600 mt-2">
                {errorMessage}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => setCurrentStep('fee')}
                className="flex-1 bg-iqube-primary hover:bg-iqube-primary/90"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AgentActivationModal;
