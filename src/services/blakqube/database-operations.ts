
import { supabase } from '@/integrations/supabase/client';
import { BlakQube } from '@/lib/types';

export const fetchBlakQubeFromDB = async (userId: string): Promise<BlakQube | null> => {
  try {
    console.log('Fetching BlakQube data for user:', userId);
    
    const { data, error } = await (supabase as any)
      .from('blak_qubes')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching BlakQube data:', error);
      return null;
    }
    
    console.log('BlakQube data fetched:', data);
    return data as BlakQube;
  } catch (error) {
    console.error('Error in fetchBlakQubeFromDB:', error);
    return null;
  }
};

export const saveBlakQubeToDB = async (
  userId: string,
  blakQubeData: Partial<BlakQube>
): Promise<boolean> => {
  try {
    console.log('Saving BlakQube data for user:', userId, blakQubeData);
    
    // First try to update existing record
    const { data: updateResult, error: updateError } = await (supabase as any)
      .from('blak_qubes')
      .update({
        ...blakQubeData,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select();
    
    // If no rows were updated, insert a new one
    if (updateResult && updateResult.length === 0) {
      console.log('No existing BlakQube found, inserting new record');
      const { error: insertError } = await (supabase as any)
        .from('blak_qubes')
        .insert({
          user_id: userId,
          ...blakQubeData,
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error inserting new BlakQube data:', insertError);
        return false;
      }
    } else if (updateError) {
      console.error('Error updating BlakQube data:', updateError);
      return false;
    }
    
    console.log('BlakQube data saved successfully');
    return true;
  } catch (error) {
    console.error('Error in saveBlakQubeToDB:', error);
    return false;
  }
};

export const fetchUserConnections = async (userId: string) => {
  try {
    const { data: connections, error: connectionsError } = await (supabase as any)
      .from('user_connections')
      .select('service, connection_data')
      .eq('user_id', userId);
    
    if (connectionsError) {
      console.error('Error fetching connections:', connectionsError);
      return null;
    }
    
    console.log('User connections:', connections);
    return connections;
  } catch (error) {
    console.error('Error in fetchUserConnections:', error);
    return null;
  }
};
