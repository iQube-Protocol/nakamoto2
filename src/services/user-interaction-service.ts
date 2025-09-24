import { supabase } from '@/integrations/supabase/client';

export interface InteractionData {
  query: string;
  response: string;
  interactionType: 'learn' | 'earn' | 'connect' | 'mondai';
  metadata?: any;
  user_id?: string;
}

export const storeUserInteraction = async (data: InteractionData) => {
  try {
    if (!data.user_id) {
      const { data: { session } } = await supabase.auth.getSession();
      data.user_id = session?.user?.id;
    }
    
    if (!data.user_id) {
      console.error('No user ID available for storing interaction');
      return { success: false, error: new Error('User not authenticated') };
    }

    // Enhance metadata with current persona context
    const selectedPersona = localStorage.getItem('selected-iqube');
    const enhancedMetadata = {
      ...data.metadata,
      activePersona: selectedPersona || 'Anon',
      timestamp: new Date().toISOString()
    };

    console.log('STORING USER INTERACTION:', {
      userId: data.user_id,
      type: data.interactionType,
      hasMetadata: !!enhancedMetadata,
      metadata: enhancedMetadata,
      metadataKeys: enhancedMetadata ? Object.keys(enhancedMetadata) : []
    });

    const { error, data: insertedData } = await (supabase as any)
      .from('user_interactions')
      .insert({
        query: data.query,
        response: data.response,
        interaction_type: data.interactionType,
        metadata: enhancedMetadata,
        user_id: data.user_id
      })
      .select();

    if (error) {
      console.error('Error storing user interaction:', error);
      return { success: false, error };
    }

    console.log('Successfully stored user interaction with ID:', insertedData?.[0]?.id);
    return { success: true, error: null, data: insertedData?.[0] };
  } catch (error) {
    console.error('Unexpected error storing user interaction:', error);
    return { success: false, error };
  }
};

export const getUserInteractions = async (
  interactionType?: 'learn' | 'earn' | 'connect' | 'mondai' | 'all' | 'qripto' | 'knyt',
  limit = 50, 
  offset = 0
) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user_id = session?.user?.id;
    
    if (!user_id) {
      console.error('No user ID available for fetching interactions');
      return { data: null, error: new Error('User not authenticated') };
    }

    console.log('DB QUERY: Fetching interactions for user:', user_id, 'type:', interactionType || 'all');

    let query = (supabase as any)
      .from('user_interactions')
      .select('*')
      .eq('user_id', user_id);
    
    // Only filter by interaction_type for the original types (mondai, learn, earn, connect)
    // For 'all', 'qripto', 'knyt' we fetch everything and let the UI do persona-based filtering
    if (interactionType && !['all', 'qripto', 'knyt'].includes(interactionType)) {
      query = query.eq('interaction_type', interactionType);
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching user interactions:', error);
      return { data: null, error };
    }
    
    console.log(`DB QUERY: Retrieved ${data?.length || 0} interactions for ${interactionType || 'all'} type`);
    
    if (data && data.length > 0) {
      console.log('Sample interaction with metadata:', {
        id: data[0].id,
        type: data[0].interaction_type, 
        created_at: data[0].created_at,
        hasMetadata: !!data[0].metadata,
        metadata: data[0].metadata,
        metadataKeys: data[0].metadata ? Object.keys(data[0].metadata) : []
      });
    } else {
      console.log('No interactions found for the user');
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Unexpected error fetching user interactions:', error);
    return { data: null, error };
  }
};

export const startUserSession = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user_id = session?.user?.id;
    
    if (!user_id) {
      console.error('No user ID available for starting session');
      return { success: false, error: new Error('User not authenticated') };
    }

    const deviceInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
    };

    const { error } = await (supabase as any).from('user_sessions').insert({
      device_info: deviceInfo,
      active: true,
      user_id
    });

    if (error) {
      console.error('Error starting user session:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error starting user session:', error);
    return { success: false, error };
  }
};

export const endUserSession = async (sessionId: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user_id = session?.user?.id;
    
    if (!user_id) {
      console.error('No user ID available for ending session');
      return { success: false, error: new Error('User not authenticated') };
    }
    
    const { error } = await (supabase as any)
      .from('user_sessions')
      .update({
        active: false,
        session_end: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .eq('user_id', user_id);

    if (error) {
      console.error('Error ending user session:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error ending user session:', error);
    return { success: false, error };
  }
};
