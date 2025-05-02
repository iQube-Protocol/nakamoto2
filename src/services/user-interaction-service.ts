
import { supabase } from '@/integrations/supabase/client';

export interface InteractionData {
  query: string;
  response: string;
  interactionType: 'learn' | 'earn' | 'connect';
  metadata?: any;
  user_id?: string; // Make user_id optional in the interface as we'll handle it internally
}

export const storeUserInteraction = async (data: InteractionData) => {
  try {
    // Get current user from auth context or session if not provided explicitly
    if (!data.user_id) {
      const { data: { session } } = await supabase.auth.getSession();
      data.user_id = session?.user.id;
    }
    
    if (!data.user_id) {
      console.error('No user ID available for storing interaction');
      return { success: false, error: new Error('User not authenticated') };
    }

    console.log('Storing interaction for user:', data.user_id, 'type:', data.interactionType);

    // Add more detailed log
    console.log('Full interaction data being stored:', { 
      query: data.query,
      response_length: data.response?.length || 0,
      interaction_type: data.interactionType,
      user_id: data.user_id,
      has_metadata: !!data.metadata
    });

    const { error, data: insertedData } = await supabase.from('user_interactions').insert({
      query: data.query,
      response: data.response,
      interaction_type: data.interactionType,
      metadata: data.metadata,
      user_id: data.user_id // Include the user_id in the insert
    }).select();

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
  interactionType?: 'learn' | 'earn' | 'connect',
  limit = 10,
  offset = 0
) => {
  try {
    // Get current user from auth context or session
    const { data: { session } } = await supabase.auth.getSession();
    const user_id = session?.user?.id;
    
    if (!user_id) {
      console.error('No user ID available for fetching interactions');
      return { data: null, error: new Error('User not authenticated') };
    }

    console.log('Fetching interactions for user:', user_id, 'type:', interactionType);

    let queryBuilder = supabase
      .from('user_interactions')
      .select('*')
      .eq('user_id', user_id) // Filter by the user's ID
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (interactionType) {
      queryBuilder = queryBuilder.eq('interaction_type', interactionType);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Error fetching user interactions:', error);
      return { data: null, error };
    }

    console.log('Fetched interactions:', data?.length || 0, 'for type:', interactionType || 'all');
    if (data?.length) {
      console.log('Sample interaction:', {
        id: data[0].id,
        type: data[0].interaction_type,
        created_at: data[0].created_at,
        query_length: data[0].query?.length || 0,
        response_length: data[0].response?.length || 0
      });
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching user interactions:', error);
    return { data: null, error };
  }
};

export const startUserSession = async () => {
  try {
    // Get current user from auth context or session
    const { data: { session } } = await supabase.auth.getSession();
    const user_id = session?.user.id;
    
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

    const { error } = await supabase.from('user_sessions').insert({
      device_info: deviceInfo,
      active: true,
      user_id // Include the user_id in the insert
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
    // Get current user from auth context or session
    const { data: { session } } = await supabase.auth.getSession();
    const user_id = session?.user.id;
    
    if (!user_id) {
      console.error('No user ID available for ending session');
      return { success: false, error: new Error('User not authenticated') };
    }
    
    const { error } = await supabase
      .from('user_sessions')
      .update({
        active: false,
        session_end: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .eq('user_id', user_id); // Also filter by user_id for extra security

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
