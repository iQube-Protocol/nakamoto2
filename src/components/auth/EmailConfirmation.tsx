
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check, X } from 'lucide-react';

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your email...');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the token and type from URL params
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        
        console.log('Email confirmation params:', { token: !!token, type });

        if (type === 'signup' && token) {
          // This handles the email confirmation
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });

          if (error) {
            console.error('Email confirmation error:', error);
            setStatus('error');
            setMessage('Email confirmation failed. The link may be expired or invalid.');
            toast.error('Email confirmation failed. Please try signing up again.');
          } else {
            console.log('Email confirmed successfully:', data);
            setStatus('success');
            setMessage('Email confirmed successfully! Redirecting to sign in...');
            toast.success('Email confirmed! You can now sign in.');
            
            // Redirect to signin page after a delay
            setTimeout(() => {
              navigate('/signin?confirmed=true');
            }, 2000);
          }
        } else {
          setStatus('error');
          setMessage('Invalid confirmation link.');
          toast.error('Invalid confirmation link.');
          
          setTimeout(() => {
            navigate('/signin');
          }, 3000);
        }
      } catch (error) {
        console.error('Unexpected error during email confirmation:', error);
        setStatus('error');
        setMessage('An unexpected error occurred.');
        toast.error('An unexpected error occurred. Please try again.');
        
        setTimeout(() => {
          navigate('/signin');
        }, 3000);
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-iqube-primary/10 via-background to-iqube-accent/5">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Email Confirmation</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Processing your email confirmation...'}
            {status === 'success' && 'Email confirmed successfully!'}
            {status === 'error' && 'Confirmation failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          {status === 'loading' && (
            <Loader2 className="h-16 w-16 text-iqube-primary animate-spin" />
          )}
          {status === 'success' && (
            <Check className="h-16 w-16 text-green-500" />
          )}
          {status === 'error' && (
            <X className="h-16 w-16 text-red-500" />
          )}
          <p className="mt-4 text-muted-foreground text-center">
            {message}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmation;
