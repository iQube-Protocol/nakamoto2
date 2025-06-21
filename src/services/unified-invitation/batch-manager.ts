
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

      const batchStatuses: BatchStatus[] = (batches || []).map(batch => ({
        batchId: batch.batch_id,
        status: batch.status as 'pending' | 'in_progress' | 'completed' | 'failed',
        totalEmails: batch.total_emails,
        emailsSent: batch.emails_sent,
        emailsFailed: batch.emails_failed,
        errors: []
      }));

      return batchStatuses;
    } catch (error) {
      console.error('BatchManager: Failed to get batch statuses:', error);
      throw new Error(`Failed to get batch statuses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async sendEmailBatch(emails: string[], batchSize: number = 100): Promise<{ success: boolean; batchId?: string; errors: string[] }> {
    console.log(`BatchManager: Starting email batch send for ${emails.length} emails with batch size ${batchSize}`);
    
    try {
      // For large batches, split into smaller chunks
      if (emails.length > batchSize) {
        console.log(`BatchManager: Splitting large batch of ${emails.length} into chunks of ${batchSize}`);
        
        const chunks = [];
        for (let i = 0; i < emails.length; i += batchSize) {
          chunks.push(emails.slice(i, i + batchSize));
        }

        const results = [];
        const errors: string[] = [];

        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          console.log(`BatchManager: Processing chunk ${i + 1}/${chunks.length} with ${chunk.length} emails`);
          
          try {
            const { data, error } = await supabase.functions.invoke('send-invitations', {
              body: { 
                emails: chunk, 
                testMode: false,
                batchId: `chunk_${Date.now()}_${i + 1}`
              }
            });

            if (error) {
              console.error(`BatchManager: Chunk ${i + 1} failed:`, error);
              errors.push(`Chunk ${i + 1} failed: ${error.message}`);
            } else {
              console.log(`BatchManager: Chunk ${i + 1} succeeded:`, data);
              results.push(data);
            }

            // Add delay between chunks to prevent overwhelming the system
            if (i < chunks.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          } catch (chunkError: any) {
            console.error(`BatchManager: Chunk ${i + 1} error:`, chunkError);
            errors.push(`Chunk ${i + 1} error: ${chunkError.message}`);
          }
        }

        const totalSent = results.reduce((sum, result) => sum + (result?.sent || 0), 0);
        console.log(`BatchManager: Chunked batch complete. Total sent: ${totalSent}`);

        return {
          success: totalSent > 0,
          errors: errors.length > 0 ? errors : [`Successfully sent ${totalSent} emails in ${chunks.length} chunks`]
        };
      } else {
        // Send small batch directly
        console.log(`BatchManager: Sending small batch of ${emails.length} emails directly`);
        
        const { data, error } = await supabase.functions.invoke('send-invitations', {
          body: { 
            emails, 
            testMode: false,
            batchId: `direct_${Date.now()}`
          }
        });

        if (error) {
          console.error('BatchManager: Direct batch failed:', error);
          throw error;
        }

        console.log('BatchManager: Direct batch succeeded:', data);

        return {
          success: data.success,
          batchId: data.batchId,
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
}
