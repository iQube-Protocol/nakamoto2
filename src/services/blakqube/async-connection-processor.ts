import { blakQubeService } from '@/services/blakqube-service';
import { NamePreferenceService } from '@/services/name-preference-service';

class AsyncConnectionProcessor {
  private processingQueue: Map<string, Promise<void>> = new Map();

  async processConnectionAsync(userId: string, service: string, connectionData: any): Promise<void> {
    const key = `${userId}-${service}`;
    
    // Prevent duplicate processing
    if (this.processingQueue.has(key)) {
      console.log(`Already processing connection for ${service}, skipping...`);
      return this.processingQueue.get(key)!;
    }

    const processingPromise = this.doProcessConnection(userId, service, connectionData);
    this.processingQueue.set(key, processingPromise);

    try {
      await processingPromise;
    } finally {
      this.processingQueue.delete(key);
    }
  }

  private async doProcessConnection(userId: string, service: string, connectionData: any): Promise<void> {
    console.log(`🔄 Async processing ${service} connection for user ${userId}...`);

    try {
      // Process BlakQube updates (lightweight first)
      await this.processBlakQubeData(service, connectionData);

      // Process name preferences (can be complex)
      if (service === 'linkedin') {
        await this.processLinkedInNamePreferences(userId, connectionData);
      }

      console.log(`✅ Async processing complete for ${service}`);
    } catch (error) {
      console.error(`❌ Error in async processing for ${service}:`, error);
      // Don't throw - this is background processing
    }
  }

  private async processBlakQubeData(service: string, connectionData: any): Promise<void> {
    try {
      console.log('🔄 Updating BlakQube data...');
      
      // Update both persona types for compatibility
      const qriptoUpdateSuccess = await blakQubeService.updatePersonaFromConnections('qripto');
      const knytUpdateSuccess = await blakQubeService.updatePersonaFromConnections('knyt');
      
      if (qriptoUpdateSuccess || knytUpdateSuccess) {
        console.log('✅ BlakQube data updated successfully');
        
        // Dispatch update event
        const event = new CustomEvent('privateDataUpdated');
        window.dispatchEvent(event);
      } else {
        console.warn('⚠️ BlakQube update failed');
      }
    } catch (error) {
      console.error('❌ Error updating BlakQube data:', error);
    }
  }

  private async processLinkedInNamePreferences(userId: string, connectionData: any): Promise<void> {
    try {
      console.log('🔄 Processing LinkedIn name preferences...');
      
      const profile = connectionData?.profile;
      if (!profile?.firstName || !profile?.lastName) {
        console.log('No name data in LinkedIn profile, skipping name processing');
        return;
      }

      // Process name preferences with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Name processing timeout')), 10000)
      );

      const nameProcessingPromise = NamePreferenceService.processLinkedInNames(
        userId,
        profile.firstName,
        profile.lastName
      );

      await Promise.race([nameProcessingPromise, timeoutPromise]);
      
      console.log('✅ LinkedIn name preferences processed successfully');
    } catch (error) {
      console.error('❌ Error processing LinkedIn name preferences:', error);
    }
  }
}

export const asyncConnectionProcessor = new AsyncConnectionProcessor();