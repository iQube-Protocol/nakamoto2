import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, User, Users } from 'lucide-react';
import { NamePreferenceService, NamePreference } from '@/services/name-preference-service';
import { NameConflictDialog } from './NameConflictDialog';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

interface PersonaNameInfo {
  personaType: 'knyt' | 'qrypto';
  currentName: { firstName: string; lastName: string };
  source: 'invitation' | 'linkedin' | 'custom' | 'default';
  preference?: NamePreference;
}

export const NameManagementSection: React.FC = () => {
  const [personaNames, setPersonaNames] = useState<PersonaNameInfo[]>([]);
  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean;
    data?: any;
  }>({ open: false, data: undefined });
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

  return (
    <>
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
            <div key={persona.personaType} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getSourceIcon(persona.personaType)}
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
                <Badge variant={getSourceBadgeVariant(persona.source)}>
                  {persona.source === 'default' ? 'System' : persona.source}
                </Badge>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
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
    </>
  );
};