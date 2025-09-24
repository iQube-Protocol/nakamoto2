import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Database, Settings, RefreshCw, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { personaDataSync } from '@/services/persona-data-sync';

interface PersonaData {
  knyt_persona?: any;
  qrypto_persona?: any;
  user_id?: string;
}

interface UserPersonaDisplayProps {
  userEmail: string;
  personaType: string;
  originalData: Record<string, any>;
  onDataUpdate?: () => void;
}

const UserPersonaDisplay: React.FC<UserPersonaDisplayProps> = ({
  userEmail,
  personaType,
  originalData,
  onDataUpdate
}) => {
  const [personaData, setPersonaData] = useState<PersonaData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadPersonaData = async () => {
    setIsLoading(true);
    try {
      console.log('UserPersonaDisplay: Loading persona data for', userEmail);
      
      // Load both KNYT and Qrypto personas
      const [knytResult, qryptoResult] = await Promise.all([
        supabase
          .from('knyt_personas')
          .select('*')
          .eq('Email', userEmail)
          .maybeSingle(),
        supabase
          .from('qripto_personas')
          .select('*')
          .eq('Email', userEmail)
          .maybeSingle()
      ]);

      const newPersonaData: PersonaData = {};
      
      if (knytResult.data) {
        newPersonaData.knyt_persona = knytResult.data;
        newPersonaData.user_id = knytResult.data.user_id;
      }
      
      if (qryptoResult.data) {
        newPersonaData.qrypto_persona = qryptoResult.data;
        newPersonaData.user_id = newPersonaData.user_id || qryptoResult.data.user_id;
      }

      setPersonaData(newPersonaData);
      setLastUpdated(new Date());
      console.log('UserPersonaDisplay: Loaded persona data:', newPersonaData);
    } catch (error: any) {
      console.error('UserPersonaDisplay: Error loading persona data:', error);
      toast.error(`Failed to load persona data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPersonaData();
  }, [userEmail]);

  // Subscribe to persona data updates for real-time sync
  useEffect(() => {
    const unsubscribe = personaDataSync.subscribe(() => {
      console.log('UserPersonaDisplay: Received persona data update notification, refreshing...');
      loadPersonaData();
      onDataUpdate?.();
    });

    return unsubscribe;
  }, [onDataUpdate]);

  const renderPersonaSection = (title: string, data: Record<string, any> | undefined, icon: React.ReactNode, emptyMessage: string) => {
    const filteredData = data ? Object.entries(data).filter(([key, value]) => {
      if (key === 'id' || key === 'user_id' || key === 'created_at' || key === 'updated_at') return false;
      return value !== null && value !== undefined && value !== '' && 
             (Array.isArray(value) ? value.length > 0 : true);
    }) : [];

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {icon}
              <span>{title}</span>
            </div>
            {data && (
              <Badge variant="outline" className="text-xs">
                {filteredData.length} fields
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!data ? (
            <p className="text-gray-500">{emptyMessage}</p>
          ) : filteredData.length === 0 ? (
            <p className="text-gray-500">No data available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredData.map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">
                    {key.replace(/-/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <div className="text-sm">
                    {Array.isArray(value) ? (
                      <div className="flex flex-wrap gap-1">
                        {value.map((item, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    ) : key === 'Total-Invested' && typeof value === 'string' && value ? (
                      <span className="break-words">
                        {(() => {
                          const numericValue = value.replace(/[$,]/g, '');
                          if (!isNaN(Number(numericValue)) && numericValue !== '') {
                            return `$${Number(numericValue).toLocaleString()}`;
                          }
                          return String(value);
                        })()}
                      </span>
                    ) : (
                      <span className="break-words">{String(value)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Persona Data for {userEmail}</h3>
          {lastUpdated && (
            <Badge variant="outline" className="text-xs">
              Updated: {lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadPersonaData}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      <Tabs defaultValue="current-data" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="original">Original Invitation Data</TabsTrigger>
          <TabsTrigger value="knyt">KNYT Persona</TabsTrigger>
          <TabsTrigger value="qrypto">Qrypto Persona</TabsTrigger>
        </TabsList>

        <TabsContent value="original" className="space-y-4">
          {renderPersonaSection(
            'Original Data from Invitation',
            originalData,
            <Database className="h-4 w-4" />,
            'No original invitation data available'
          )}
        </TabsContent>

        <TabsContent value="knyt" className="space-y-4">
          {renderPersonaSection(
            'Current KNYT Persona Data',
            personaData.knyt_persona,
            <Settings className="h-4 w-4 text-blue-600" />,
            'User does not have a KNYT persona or has not updated their data yet'
          )}
        </TabsContent>

        <TabsContent value="qrypto" className="space-y-4">
          {renderPersonaSection(
            'Current Qrypto Persona Data',
            personaData.qrypto_persona,
            <Settings className="h-4 w-4 text-green-600" />,
            'User does not have a Qrypto persona or has not updated their data yet'
          )}
        </TabsContent>
      </Tabs>

      {personaData.user_id && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>User ID: {personaData.user_id}</span>
              <span>
                Active Personas: {[
                  personaData.knyt_persona && 'KNYT',
                  personaData.qrypto_persona && 'Qrypto'
                ].filter(Boolean).join(', ') || 'None'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserPersonaDisplay;