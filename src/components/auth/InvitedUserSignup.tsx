
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { invitationService } from '@/services/invitation-service';
import { toast } from 'sonner';

const InvitedUserSignup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp } = useAuth();
  
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    const loadInvitation = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const invitationData = await invitationService.getInvitationByToken(token);
        if (invitationData) {
          setInvitation(invitationData);
        }
      } catch (error) {
        console.error('Error loading invitation:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInvitation();
  }, [token]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitation) return;
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSigningUp(true);
    try {
      const result = await signUp(
        invitation.email, 
        password,
        invitation.persona_data['First-Name'] || '',
        invitation.persona_data['Last-Name'] || ''
      );

      if (result.success) {
        toast.success('Account created successfully! Please check your email for confirmation.');
        navigate('/signin?confirmed=true');
      } else {
        toast.error(result.error?.message || 'Failed to create account');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSigningUp(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Invalid Invitation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>No invitation token provided. Please check your invitation email for the correct link.</p>
            <Button className="w-full mt-4" onClick={() => navigate('/signin')}>
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Invitation Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>This invitation is invalid, expired, or has already been used.</p>
            <Button className="w-full mt-4" onClick={() => navigate('/signin')}>
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            Complete Your Signup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              You've been invited to create a <strong>{invitation.persona_type.toUpperCase()}</strong> persona account for:
            </p>
            <p className="font-medium text-blue-900 mt-1">{invitation.email}</p>
            {invitation.persona_data['First-Name'] && (
              <p className="text-sm text-blue-700 mt-1">
                Welcome, {invitation.persona_data['First-Name']} {invitation.persona_data['Last-Name']}!
              </p>
            )}
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={invitation.email}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Enter your password"
              />
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isSigningUp || !password || !confirmPassword}
            >
              {isSigningUp ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Your persona data will be automatically populated after account creation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitedUserSignup;
