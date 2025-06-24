
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
        console.log('InvitedUserSignup: No token provided');
        setLoading(false);
        return;
      }

      console.log('InvitedUserSignup: Loading invitation for token:', token.substring(0, 8) + '...');

      try {
        const invitationData = await invitationService.getInvitationByToken(token);
        if (invitationData) {
          console.log('InvitedUserSignup: Invitation loaded successfully:', {
            email: invitationData.email,
            personaType: invitationData.persona_type,
            expired: invitationData.expires_at ? new Date(invitationData.expires_at) < new Date() : false
          });
          setInvitation(invitationData);
        } else {
          console.log('InvitedUserSignup: No invitation found for token');
        }
      } catch (error) {
        console.error('InvitedUserSignup: Error loading invitation:', error);
        toast.error('Failed to load invitation. Please check your invitation link.');
      } finally {
        setLoading(false);
      }
    };

    loadInvitation();
  }, [token]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitation) {
      toast.error('No valid invitation found');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSigningUp(true);
    console.log('InvitedUserSignup: Starting signup process for:', invitation.email);
    
    try {
      const result = await signUp(
        invitation.email, 
        password,
        invitation.persona_data['First-Name'] || '',
        invitation.persona_data['Last-Name'] || ''
      );

      if (result.success) {
        console.log('InvitedUserSignup: Signup successful for:', invitation.email);
        toast.success('Account created successfully! Please check your email for confirmation.');
        navigate('/signin?confirmed=true');
      } else {
        console.error('InvitedUserSignup: Signup failed:', result.error);
        toast.error(result.error?.message || 'Failed to create account');
      }
    } catch (error: any) {
      console.error('InvitedUserSignup: Unexpected signup error:', error);
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
            <div className="space-y-4">
              <p>This invitation is invalid, expired, or has already been used.</p>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-700">
                  <strong>Note:</strong> If you received this link recently, please try refreshing the page. 
                  The system may be updating invitation URLs.
                </p>
              </div>
              <Button className="w-full" onClick={() => navigate('/signin')}>
                Go to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if invitation has expired
  const isExpired = invitation.expires_at && new Date(invitation.expires_at) < new Date();
  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Invitation Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>This invitation has expired. Please contact support for a new invitation.</p>
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
