import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pencil, User, Users, Camera } from 'lucide-react';
import { NamePreferenceService, NamePreference, NameConflictData } from '@/services/name-preference-service';
import { NameConflictDialog } from './NameConflictDialog';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PersonaNameInfo {
  personaType: 'knyt' | 'qrypto';
  currentName: { firstName: string; lastName: string };
  source: 'invitation' | 'linkedin' | 'custom' | 'default';
  preference?: NamePreference;
  profileImageUrl?: string;
}

export const NameManagementSection: React.FC = () => {
  const [personaNames, setPersonaNames] = useState<PersonaNameInfo[]>([]);
  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean;
    data?: any;
  }>({ open: false, data: undefined });
  const [uploading, setUploading] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadPersonaNames();
  }, [user]);

  const loadPersonaNames = async () => {
    if (!user) return;

    const personas: PersonaNameInfo[] = [];

    // Load KNYT persona
    const { data: knytData } = await supabase
      .from('knyt_personas')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (knytData) {
      const knytPreference = await NamePreferenceService.getNamePreference('knyt');
      personas.push({
        personaType: 'knyt',
        currentName: {
          firstName: knytData['First-Name'] || '',
          lastName: knytData['Last-Name'] || '',
        },
        source: knytPreference?.name_source || 'default',
        preference: knytPreference || undefined,
        profileImageUrl: knytData.profile_image_url || '',
      });
    }

    // Load Qrypto persona
    const { data: qryptoData } = await supabase
      .from('qrypto_personas')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (qryptoData) {
      const qryptoPreference = await NamePreferenceService.getNamePreference('qrypto');
      personas.push({
        personaType: 'qrypto',
        currentName: {
          firstName: qryptoData['First-Name'] || '',
          lastName: qryptoData['Last-Name'] || '',
        },
        source: qryptoPreference?.name_source || 'default',
        preference: qryptoPreference || undefined,
        profileImageUrl: qryptoData.profile_image_url || '',
      });
    }

    setPersonaNames(personas);
  };

  const getSourceBadgeVariant = (source: string) => {
    switch (source) {
      case 'invitation': return 'default';
      case 'linkedin': return 'secondary';
      case 'custom': return 'outline';
      default: return 'secondary';
    }
  };

  const getSourceIcon = (personaType: string) => {
    return personaType === 'knyt' ? <User className="h-4 w-4" /> : <Users className="h-4 w-4" />;
  };

  const handleImageUpload = async (persona: PersonaNameInfo, file: File) => {
    if (!user) return;

    setUploading(persona.personaType);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${persona.personaType}_${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('persona-profile-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('persona-profile-images')
        .getPublicUrl(fileName);

      // Update persona table with new image URL
      const tableName = persona.personaType === 'knyt' ? 'knyt_personas' : 'qrypto_personas';
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ profile_image_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Refresh the persona names to show updated image
      await loadPersonaNames();
      toast.success('Profile image updated successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload profile image');
    } finally {
      setUploading(null);
    }
  };

  const handleEdit = async (persona: PersonaNameInfo) => {
    if (!user) return;

    // Get invitation data if available
    const invitationData = await NamePreferenceService.getInvitationData(user.email || '');
    
    // Get LinkedIn data from user connections
    const { data: linkedinConnection } = await supabase
      .from('user_connections')
      .select('connection_data')
      .eq('user_id', user.id)
      .eq('service', 'linkedin')
      .maybeSingle();

    const linkedinData = linkedinConnection?.connection_data as any;

    const conflictData: NameConflictData = {
      personaType: persona.personaType,
      invitationName: invitationData ? { firstName: invitationData.firstName, lastName: invitationData.lastName } : undefined,
      linkedinName: linkedinData ? { firstName: linkedinData.firstName, lastName: linkedinData.lastName } : undefined,
      currentName: { firstName: persona.currentName.firstName, lastName: persona.currentName.lastName }
    };

    setConflictDialog({ open: true, data: conflictData });
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Name Management
          </CardTitle>
          <CardDescription>
            Manage how your name appears across different persona profiles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {personaNames.map((persona) => (
            <div key={persona.personaType} className="p-4 border rounded-lg">
              {/* Desktop Layout */}
              <div className="hidden md:flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getSourceIcon(persona.personaType)}
                  <div className="relative group">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={persona.profileImageUrl} />
                      <AvatarFallback>
                        {persona.personaType === 'knyt' ? 'K' : 'Q'}
                      </AvatarFallback>
                    </Avatar>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id={`upload-${persona.personaType}`}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(persona, file);
                      }}
                    />
                    <label
                      htmlFor={`upload-${persona.personaType}`}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      {uploading === persona.personaType ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Camera className="h-4 w-4 text-white" />
                      )}
                    </label>
                  </div>
                  <div>
                    <div className="font-medium">
                      {persona.personaType.toUpperCase()} Profile
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {persona.currentName.firstName} {persona.currentName.lastName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {persona.source === 'default' ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant={getSourceBadgeVariant(persona.source)}>
                          System
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>No name preference set. Using default persona data.</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Badge variant={getSourceBadgeVariant(persona.source)}>
                      {persona.source}
                    </Badge>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(persona)}
                  >
                    Edit
                  </Button>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="md:hidden space-y-3">
                {/* Row 1: Icon, Avatar, and Profile Label */}
                <div className="flex items-center gap-3">
                  {getSourceIcon(persona.personaType)}
                  <div className="relative group">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={persona.profileImageUrl} />
                      <AvatarFallback>
                        {persona.personaType === 'knyt' ? 'K' : 'Q'}
                      </AvatarFallback>
                    </Avatar>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id={`upload-mobile-${persona.personaType}`}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(persona, file);
                      }}
                    />
                    <label
                      htmlFor={`upload-mobile-${persona.personaType}`}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      {uploading === persona.personaType ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Camera className="h-4 w-4 text-white" />
                      )}
                    </label>
                  </div>
                  <div className="font-medium">
                    {persona.personaType.toUpperCase()} Profile
                  </div>
                </div>

                {/* Row 2: First and Last Name */}
                <div className="text-sm text-muted-foreground pl-16">
                  {persona.currentName.firstName} {persona.currentName.lastName}
                </div>

                {/* Row 3: Badge and Edit Button */}
                <div className="flex items-center gap-2 pl-16">
                  {persona.source === 'default' ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant={getSourceBadgeVariant(persona.source)}>
                          System
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>No name preference set. Using default persona data.</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Badge variant={getSourceBadgeVariant(persona.source)}>
                      {persona.source}
                    </Badge>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(persona)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {personaNames.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No persona profiles found. Complete your profile setup first.
            </div>
          )}
        </CardContent>
      </Card>

      <NameConflictDialog
        open={conflictDialog.open}
        onOpenChange={(open) => setConflictDialog({ open, data: conflictDialog.data })}
        conflictData={conflictDialog.data}
        onResolved={() => {
          setConflictDialog({ open: false, data: undefined });
          loadPersonaNames();
        }}
      />
    </TooltipProvider>
  );
};