
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationId, agentType, userId } = await req.json();
    
    if (!conversationId) {
      throw new Error('Missing conversationId parameter');
    }
    
    if (!agentType) {
      throw new Error('Missing agentType parameter');
    }
    
    if (!userId) {
      throw new Error('Missing userId parameter');
    }
    
    console.log(`Summarizing ${agentType} conversation ${conversationId} for user ${userId}`);
    
    // Get all unsummarized interactions for this conversation
    const { data: interactions, error: fetchError } = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/user_interactions?user_id=eq.${userId}&interaction_type=eq.${agentType}&summarized=eq.false&select=id,query,response,created_at&order=created_at.asc`, {
      headers: {
        Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        apikey: Deno.env.get('SUPABASE_ANON_KEY') || '',
      },
    }).then(res => res.json());
    
    if (fetchError) {
      throw new Error(`Failed to fetch interactions: ${fetchError.message}`);
    }
    
    if (!interactions || interactions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No unsummarized interactions found', 
          conversationId 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Found ${interactions.length} interactions to summarize`);
    
    // Prepare conversation history for summarization
    const conversationContent = interactions.map(interaction => 
      `User: ${interaction.query}\nAssistant: ${interaction.response}`
    ).join('\n\n');
    
    // Generate a summary using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI that summarizes conversations. Create a concise summary (maximum 250 words) of the following conversation between a user and an AI assistant about ${agentType}-related topics. Focus on the key questions, insights, and takeaways. This summary will be used as context for future conversations.`
          },
          {
            role: 'user',
            content: conversationContent
          }
        ],
        max_tokens: 500,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const summaryText = data.choices[0].message.content;
    
    // Store the summary in the database
    const interactionIds = interactions.map(i => i.id);
    
    // Insert the summary
    const { data: summaryData, error: summaryError } = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/conversation_summaries`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        apikey: Deno.env.get('SUPABASE_ANON_KEY') || '',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        user_id: userId,
        conversation_type: agentType,
        conversation_id: conversationId,
        summary_text: summaryText,
        included_interaction_ids: interactionIds
      })
    }).then(res => res.json());
    
    if (summaryError) {
      throw new Error(`Failed to store summary: ${summaryError.message}`);
    }
    
    // Mark the interactions as summarized
    for (const id of interactionIds) {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/user_interactions?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          apikey: Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summarized: true
        })
      });
    }
    
    console.log(`Successfully created summary for ${interactionIds.length} interactions`);
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        summaryId: summaryData?.[0]?.id,
        interactionsCount: interactionIds.length,
        conversationId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in summarize-history function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
