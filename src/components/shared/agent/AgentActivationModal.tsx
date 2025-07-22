import React, { useState, useEffect } from 'react';
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

  // Reset to verification step when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('🎯 AgentActivationModal: Modal opened, resetting to verification step');
      setCurrentStep('verification');
      setErrorMessage('');
      setProcessingMessage('');
    }
  }, [isOpen]);

  // Calculate USD equivalent (1 cent = 10 satoshi)
  const usdEquivalent = (fee / 10 / 100).toFixed(2);
  
  // Determine if it's a monthly subscription or one-time payment
  const isMonthly = fee >= 500;
  const isFree = fee === 0;
  const paymentType = isFree ? "Free Activation" : isMonthly ? "Monthly Subscription" : "One-Time Payment";
  const billingText = isFree ? "No payment required" : isMonthly ? "Billed monthly" : "One-time purchase";

  const getAgentTitle = () => {
    switch (agentName) {
      case 'Venice':
        return 'Venice ModelQube';
      case 'Metis':
        return 'Metis AgentQube';
      case 'Qrypto Persona':
        return 'Qrypto Persona DataQube';
      case 'KNYT Persona':
        return 'KNYT Persona DataQube';
      default:
        return `${agentName} Agent`;
    }
  };

  const handleVerificationComplete = () => {
    console.log('🎯 AgentActivationModal: Verification complete, moving to fee step');
    setCurrentStep('fee');
  };

  const handleConfirmPayment = async () => {
    console.log('🎯 AgentActivationModal: Starting payment process');
    setCurrentStep('processing');
    setProcessingMessage('Initiating transaction...');
    
    try {
      if (isFree) {
        // For free activations, simulate quick processing
        setTimeout(() => setProcessingMessage('Activating agent...'), 500);
        setTimeout(() => {
          setCurrentStep('complete');
          console.log('🎯 AgentActivationModal: Free activation complete');
        }, 1500);
      } else {
        // For paid activations, show full payment flow
        setTimeout(() => setProcessingMessage('Verifying wallet balance...'), 1000);
        setTimeout(() => setProcessingMessage('Processing payment...'), 2500);
        
        const result = await onConfirmPayment();
        
        if (result) {
          setTimeout(() => {
            setCurrentStep('complete');
            console.log('🎯 AgentActivationModal: Paid activation complete');
          }, 3500);
        } else {
          setErrorMessage('Payment could not be processed. Please try again.');
          setCurrentStep('error');
        }
      }
    } catch (error) {
      console.error('🎯 AgentActivationModal: Payment error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      setCurrentStep('error');
    }
  };

  const handleComplete = () => {
    console.log('🎯 AgentActivationModal: Completing activation for:', agentName);
    
    // Handle activation for different agents using consistent localStorage keys
    if (agentName === 'Metis') {
      localStorage.setItem('metisActive', 'true');
      window.dispatchEvent(new CustomEvent('metisActivated'));
    } else if (agentName === 'Venice') {
      localStorage.setItem('venice_activated', 'true');
      window.dispatchEvent(new CustomEvent('veniceStateChanged', { 
        detail: { activated: true, visible: true } 
      }));
    } else if (agentName === 'Qrypto Persona') {
      localStorage.setItem('qrypto-persona-activated', 'true');
      window.dispatchEvent(new CustomEvent('qryptoPersonaActivated'));
    } else if (agentName === 'KNYT Persona') {
      localStorage.setItem('knyt-persona-activated', 'true');
      window.dispatchEvent(new CustomEvent('knytPersonaActivated'));
    }
    
    onComplete();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Cpu className="h-5 w-5 mr-2 text-iqube-accent" />
            Activate {getAgentTitle()}
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
                    You have the necessary tokens to access the {getAgentTitle()}.
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
              <div className={`p-3 rounded-full ${isFree ? 'bg-green-100' : 'bg-amber-100'}`}>
                <BadgeDollarSign className={`h-5 w-5 ${isFree ? 'text-green-600' : 'text-amber-600'}`} />
              </div>
              <div>
                <h3 className="text-base font-medium">{paymentType}</h3>
                <p className="text-sm text-muted-foreground">
                  {isFree 
                    ? 'This agent is free to activate and includes a reward!'
                    : `This agent requires a ${isMonthly ? 'monthly subscription' : 'one-time payment'} to activate its services.`
                  }
                </p>
              </div>
            </div>

            <div className="border rounded-md p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">{paymentType}</span>
                <div className="text-right">
                  {isFree ? (
                    <span className="font-medium text-green-600">Free + 2,800 Satoshi reward!</span>
                  ) : (
                    <>
                      <span className="font-medium">{fee} Satoshi</span>
                      <span className="text-sm text-muted-foreground ml-2">(≈ ${usdEquivalent})</span>
                    </>
                  )}
                </div>
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="text-sm font-medium">Total {isFree ? '' : isMonthly ? 'per month' : ''}</span>
                <div className="text-right">
                  {isFree ? (
                    <span className="font-semibold text-green-600">Free Activation</span>
                  ) : (
                    <>
                      <span className="font-semibold">{fee} Satoshi</span>
                      <span className="text-sm text-muted-foreground ml-2">(≈ ${usdEquivalent})</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {isFree 
                    ? 'No payment required • Includes 2,800 Satoshi reward for completing requirements'
                    : `Payment will be made from your connected wallet in Satoshi or US¢ • ${fee} Satoshi ≈ ${(fee/10).toFixed(0)}¢ • ${billingText}`
                  }
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
                className={`flex-1 ${isFree ? 'bg-green-600 hover:bg-green-700' : 'bg-iqube-primary hover:bg-iqube-primary/90'}`}
              >
                {isFree ? 'Activate Free' : isMonthly ? 'Subscribe Now' : 'Purchase Now'}
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
              <h3 className="text-lg font-medium">{isFree ? 'Activation' : isMonthly ? 'Subscription' : 'Purchase'} Complete</h3>
              <p className="text-center text-sm text-muted-foreground mt-2">
                You now have access to the {getAgentTitle()} capabilities.
                {isFree && <><br />Your 2,800 Satoshi reward will be credited after completing the requirements.</>}
              </p>
            </div>

            <Button 
              onClick={handleComplete}
              className="w-full bg-iqube-primary hover:bg-iqube-primary/90"
            >
              Start Using {getAgentTitle()}
            </Button>
          </div>
        )}

        {currentStep === 'error' && (
          <div className="py-6">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium">Activation Failed</h3>
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
