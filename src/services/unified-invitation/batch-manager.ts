
import { supabase } from '@/integrations/supabase/client';
import type { BatchStatus } from './types';

export class BatchManager {
  static async getBatchStatuses(): Promise<BatchStatus[]> {
    try {
      const { data: batches, error } = await supabase
        .from('email_batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('BatchManager: Error fetching batches:', error);
        throw error;
      }

      console.log('BatchManager: Raw batch data:', batches);

      const batchStatuses: BatchStatus[] = (batches || []).map(batch => {
        // Calculate if batch is stuck (pending for more than 5 minutes)
        const isStuck = batch.status === 'pending' && 
          new Date(batch.created_at).getTime() < Date.now() - 300000;

        return {
          batchId: batch.batch_id,
          status: isStuck ? 'failed' as const : batch.status as 'pending' | 'in_progress' | 'completed' | 'failed',
          totalEmails: batch.total_emails,
          emailsSent: batch.emails_sent,
          emailsFailed: batch.emails_failed,
          errors: isStuck ? ['Batch stuck in pending status for >5 minutes'] : [],
          createdAt: batch.created_at,
          startedAt: batch.started_at,
          completedAt: batch.completed_at
        };
      });

      console.log('BatchManager: Processed batch statuses:', batchStatuses);
      return batchStatuses;
    } catch (error) {
      console.error('BatchManager: Failed to get batch statuses:', error);
      throw new Error(`Failed to get batch statuses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async retryStuckBatch(batchId: string): Promise<{ success: boolean; message: string }> {
    console.log(`BatchManager: Attempting to retry stuck batch: ${batchId}`);
    
    try {
      // Get the batch details
      const { data: batch, error: batchError } = await supabase
        .from('email_batches')
        .select('*')
        .eq('batch_id', batchId)
        .single();

      if (batchError || !batch) {
        throw new Error(`Batch not found: ${batchId}`);
      }

      // Get emails associated with this batch that haven't been sent
      const { data: pendingEmails, error: emailError } = await supabase
        .from('invited_users')
        .select('email')
        .eq('batch_id', batchId)
        .eq('email_sent', false);

      if (emailError) {
        throw new Error(`Failed to get pending emails for batch: ${emailError.message}`);
      }

      if (!pendingEmails || pendingEmails.length === 0) {
        return { success: false, message: 'No pending emails found for this batch' };
      }

      console.log(`BatchManager: Found ${pendingEmails.length} pending emails for retry`);

      // Reset batch status and retry with smaller chunks
      await supabase
        .from('email_batches')
        .update({ 
          status: 'pending',
          started_at: null,
          completed_at: null,
          emails_sent: 0,
          emails_failed: 0
        })
        .eq('batch_id', batchId);

      // Send emails in smaller chunks
      const emails = pendingEmails.map(e => e.email);
      const result = await this.sendEmailBatch(emails, 50); // Use smaller chunks for retry

      return {
        success: result.success,
        message: result.success ? 
          `Batch retry initiated for ${emails.length} emails` : 
          `Retry failed: ${result.errors.join(', ')}`
      };
    } catch (error: any) {
      console.error('BatchManager: Retry failed:', error);
      return {
        success: false,
        message: `Retry failed: ${error.message}`
      };
    }
  }

  static async sendEmailBatch(emails: string[], batchSize: number = 100): Promise<{ success: boolean; batchId?: string; errors: string[] }> {
    console.log(`BatchManager: Starting email batch send for ${emails.length} emails with batch size ${batchSize}`);
    
    try {
      // For large batches, split into smaller chunks with better error handling
      if (emails.length > batchSize) {
        console.log(`BatchManager: Splitting large batch of ${emails.length} into chunks of ${batchSize}`);
        
        const chunks = [];
        for (let i = 0; i < emails.length; i += batchSize) {
          chunks.push(emails.slice(i, i + batchSize));
        }

        const results = [];
        const errors: string[] = [];
        let totalSent = 0;

        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const chunkBatchId = `chunk_${Date.now()}_${i + 1}`;
          
          console.log(`BatchManager: Processing chunk ${i + 1}/${chunks.length} with ${chunk.length} emails (ID: ${chunkBatchId})`);
          
          try {
            const { data, error } = await supabase.functions.invoke('send-invitations', {
              body: { 
                emails: chunk, 
                testMode: false,
                batchId: chunkBatchId
              }
            });

            if (error) {
              console.error(`BatchManager: Chunk ${i + 1} failed:`, error);
              errors.push(`Chunk ${i + 1} (${chunkBatchId}) failed: ${error.message}`);
            } else {
              console.log(`BatchManager: Chunk ${i + 1} succeeded:`, data);
              results.push(data);
              totalSent += data?.sent || 0;
            }

            // Add delay between chunks to prevent overwhelming
            if (i < chunks.length - 1) {
              console.log(`BatchManager: Waiting 3 seconds before next chunk...`);
              await new Promise(resolve => setTimeout(resolve, 3000));
            }
          } catch (chunkError: any) {
            console.error(`BatchManager: Chunk ${i + 1} error:`, chunkError);
            errors.push(`Chunk ${i + 1} (${chunkBatchId}) error: ${chunkError.message}`);
          }
        }

        console.log(`BatchManager: Chunked batch complete. Total sent: ${totalSent}, Errors: ${errors.length}`);

        return {
          success: totalSent > 0,
          errors: errors.length > 0 ? errors : [`Successfully sent ${totalSent} emails in ${chunks.length} chunks`]
        };
      } else {
        // Send small batch directly with enhanced logging
        const directBatchId = `direct_${Date.now()}`;
        console.log(`BatchManager: Sending small batch of ${emails.length} emails directly (ID: ${directBatchId})`);
        
        const { data, error } = await supabase.functions.invoke('send-invitations', {
          body: { 
            emails, 
            testMode: false,
            batchId: directBatchId
          }
        });

        if (error) {
          console.error('BatchManager: Direct batch failed:', error);
          throw error;
        }

        console.log('BatchManager: Direct batch succeeded:', data);

        return {
          success: data.success,
          batchId: data.batchId || directBatchId,
          errors: data.errors || []
        };
      }
    } catch (error: any) {
      console.error('BatchManager: Batch send failed:', error);
      return {
        success: false,
        errors: [`Batch send failed: ${error.message}`]
      };
    }
  }

  static async cleanupStuckBatches(): Promise<{ cleaned: number; errors: string[] }> {
    console.log('BatchManager: Cleaning up stuck batches...');
    
    try {
      const { data: stuckBatches, error } = await supabase
        .from('email_batches')
        .select('*')
        .eq('status', 'pending')
        .lt('created_at', new Date(Date.now() - 300000).toISOString()); // 5 minutes old

      if (error) {
        throw error;
      }

      if (!stuckBatches || stuckBatches.length === 0) {
        console.log('BatchManager: No stuck batches found');
        return { cleaned: 0, errors: [] };
      }

      console.log(`BatchManager: Found ${stuckBatches.length} stuck batches to clean up`);

      const { error: updateError } = await supabase
        .from('email_batches')
        .update({ status: 'failed', completed_at: new Date().toISOString() })
        .in('batch_id', stuckBatches.map(b => b.batch_id));

      if (updateError) {
        throw updateError;
      }

      console.log(`BatchManager: Successfully marked ${stuckBatches.length} stuck batches as failed`);
      
      return {
        cleaned: stuckBatches.length,
        errors: []
      };
    } catch (error: any) {
      console.error('BatchManager: Cleanup failed:', error);
      return {
        cleaned: 0,
        errors: [error.message]
      };
    }
  }
}
