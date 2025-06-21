
import { supabase } from '@/integrations/supabase/client';
import { ReconciliationResult } from './types';

export class PersonaReconciler {
  async reconcileOrphanedPersonas(result: ReconciliationResult): Promise<void> {
    try {
      // Step 1: Find users who have persona data but no invitation record
      const { data: orphanedPersonas, error: personasError } = await supabase
        .from('knyt_personas')
        .select('user_id, "Email"')
        .not('"Email"', 'is', null);

      if (personasError) {
        result.errors.push(`Error fetching personas: ${personasError.message}`);
        return;
      }

      // Step 2: Find users who have signed up but invitation not marked complete
      for (const persona of orphanedPersonas || []) {
        if (!persona.Email) continue;

        const { data: invitation, error: invError } = await supabase
          .from('invited_users')
          .select('*')
          .eq('email', persona.Email.toLowerCase())
          .single();

        if (invError && invError.code !== 'PGRST116') {
          result.errors.push(`Error checking invitation for ${persona.Email}: ${invError.message}`);
          continue;
        }

        if (invitation && !invitation.signup_completed) {
          // Mark as completed
          const { error: updateError } = await supabase
            .from('invited_users')
            .update({
              signup_completed: true,
              completed_at: new Date().toISOString()
            })
            .eq('id', invitation.id);

          if (updateError) {
            result.errors.push(`Failed to update signup status for ${persona.Email}: ${updateError.message}`);
          } else {
            result.signupsReconciled++;
          }
        }
      }
    } catch (error: any) {
      result.errors.push(`Error in persona reconciliation: ${error.message}`);
    }
  }
}
