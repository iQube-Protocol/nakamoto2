
import { supabase } from '@/integrations/supabase/client';
import { ReconciliationResult } from './types';

export class PersonaReconciler {
  async reconcileDirectSignupByEmail(email: string, personaType?: 'knyt' | 'qripto'): Promise<void> {
    const lower = email.toLowerCase();
    // Check if invitation already exists
    const { data: existing, error: invErr } = await supabase
      .from('invited_users')
      .select('id')
      .eq('email', lower)
      .maybeSingle();

    if (invErr) {
      console.error('PersonaReconciler: Error checking invitation for', lower, invErr.message);
      return;
    }

    if (!existing) {
      const { error: insertError } = await supabase
        .from('invited_users')
        .insert({
          email: lower,
          persona_type: personaType || 'knyt',
          persona_data: {},
          batch_id: 'direct_signup',
          email_sent: false,
          signup_completed: true,
          completed_at: new Date().toISOString(),
          invited_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (insertError) {
        console.error('PersonaReconciler: Failed creating direct signup record for', lower, insertError.message);
      } else {
        console.log('PersonaReconciler: Created direct signup record for', lower);
      }
    }
  }

  async reconcileDirectSignups(result: ReconciliationResult): Promise<void> {
    try {
      console.log('PersonaReconciler: Reconciling direct signups...');
      
      // Find users with personas but no invitation records
      const { data: knotPersonas, error: knotError } = await supabase
        .from('knyt_personas')
        .select('user_id, "Email"')
        .not('"Email"', 'is', null);
        
        const { data: qryptoPersonas, error: qryptoError } = await supabase
        .from('qripto_personas')
        .select('user_id, "Email"')
        .not('"Email"', 'is', null);

      if (knotError || qryptoError) {
        result.errors.push(`Error fetching personas: ${knotError?.message || qryptoError?.message}`);
        return;
      }

      const allPersonas = [
        ...(knotPersonas || []).map(p => ({ ...p, persona_type: 'knyt' })),
        ...(qryptoPersonas || []).map(p => ({ ...p, persona_type: 'qrypto' }))
      ];

      console.log(`PersonaReconciler: Found ${allPersonas.length} personas to check`);

      for (const persona of allPersonas) {
        if (!persona.Email) continue;

        // Check if invitation record exists
        const { data: invitation, error: invError } = await supabase
          .from('invited_users')
          .select('*')
          .eq('email', persona.Email.toLowerCase())
          .maybeSingle();

        if (invError) {
          result.errors.push(`Error checking invitation for ${persona.Email}: ${invError.message}`);
          continue;
        }

        if (!invitation) {
          // This is a direct signup - create placeholder invitation record
          console.log(`PersonaReconciler: Creating direct signup record for ${persona.Email}`);
          
          const { error: insertError } = await supabase
            .from('invited_users')
            .insert({
              email: persona.Email.toLowerCase(),
              persona_type: persona.persona_type,
              persona_data: {},
              batch_id: 'direct_signup',
              email_sent: false,
              signup_completed: true,
              completed_at: new Date().toISOString(),
              invited_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
            });

          if (insertError) {
            result.errors.push(`Failed to create direct signup record for ${persona.Email}: ${insertError.message}`);
          } else {
            result.signupsReconciled++;
            console.log(`PersonaReconciler: Created direct signup record for ${persona.Email}`);
          }
        }
      }
    } catch (error: any) {
      result.errors.push(`Error in direct signup reconciliation: ${error.message}`);
    }
  }

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
