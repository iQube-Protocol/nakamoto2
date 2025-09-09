import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ExpirationStats {
  total_active: number;
  total_expired: number;
  expiring_soon_7_days: number;
  expiring_soon_3_days: number;
  expiring_today: number;
}

export interface ExpiringInvitation {
  email: string;
  persona_type: string;
  expires_at: string;
  days_until_expiry: number;
}

export class InvitationExpirationService {
  /**
   * Get invitation expiration statistics
   */
  async getExpirationStats(): Promise<ExpirationStats | null> {
    try {
      const { data, error } = await supabase.rpc('get_invitation_expiration_stats');
      
      if (error) {
        console.error('Error getting expiration stats:', error);
        throw error;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Failed to get expiration stats:', error);
      return null;
    }
  }

  /**
   * Get invitations expiring within specified days
   */
  async getExpiringInvitations(daysAhead: number = 7): Promise<ExpiringInvitation[]> {
    try {
      const { data, error } = await supabase.rpc('get_expiring_invitations', { 
        days_ahead: daysAhead 
      });
      
      if (error) {
        console.error('Error getting expiring invitations:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get expiring invitations:', error);
      return [];
    }
  }

  /**
   * Extend expiration for specific emails
   */
  async extendInvitationExpiration(
    emails: string[], 
    extendDays: number = 30
  ): Promise<{ success: boolean; updatedCount: number; errors: string[] }> {
    try {
      // Use the existing database function
      const { data, error } = await supabase
        .rpc('extend_invitation_expiration', {
          email_list: emails,
          extend_days: extendDays
        });
      
      if (error) {
        console.error('Error extending invitation expiration:', error);
        return {
          success: false,
          updatedCount: 0,
          errors: [error.message]
        };
      }

      const result = data && data.length > 0 ? data[0] : { updated_count: 0 };
      const updatedCount = result.updated_count || 0;
      
      return {
        success: true,
        updatedCount,
        errors: []
      };
    } catch (error: any) {
      console.error('Failed to extend invitation expiration:', error);
      return {
        success: false,
        updatedCount: 0,
        errors: [error.message]
      };
    }
  }

  /**
   * Extend all active invitation expirations
   */
  async extendAllActiveInvitations(extendDays: number = 30): Promise<{ success: boolean; updatedCount: number; errors: string[] }> {
    try {
      // Use the existing database function with null to extend all
      const { data, error } = await supabase
        .rpc('extend_invitation_expiration', {
          email_list: null,
          extend_days: extendDays
        });
      
      if (error) {
        console.error('Error extending all invitations:', error);
        return {
          success: false,
          updatedCount: 0,
          errors: [error.message]
        };
      }

      const result = data && data.length > 0 ? data[0] : { updated_count: 0 };
      const updatedCount = result.updated_count || 0;
      
      return {
        success: true,
        updatedCount,
        errors: []
      };
    } catch (error: any) {
      console.error('Failed to extend all invitations:', error);
      return {
        success: false,
        updatedCount: 0,
        errors: [error.message]
      };
    }
  }

  /**
   * Check if any invitations are expiring soon and return notification data
   */
  async checkExpiringNotifications(): Promise<{
    hasUrgent: boolean;
    hasWarning: boolean;
    urgentCount: number;
    warningCount: number;
    message: string;
  }> {
    try {
      const stats = await this.getExpirationStats();
      
      if (!stats) {
        return {
          hasUrgent: false,
          hasWarning: false,
          urgentCount: 0,
          warningCount: 0,
          message: ''
        };
      }

      const urgentCount = stats.expiring_today + stats.expiring_soon_3_days;
      const warningCount = stats.expiring_soon_7_days;
      
      let message = '';
      if (stats.expiring_today > 0) {
        message = `${stats.expiring_today} invitation(s) expire today!`;
      } else if (stats.expiring_soon_3_days > 0) {
        message = `${stats.expiring_soon_3_days} invitation(s) expire in 3 days`;
      } else if (stats.expiring_soon_7_days > 0) {
        message = `${stats.expiring_soon_7_days} invitation(s) expire in 7 days`;
      }

      return {
        hasUrgent: urgentCount > 0,
        hasWarning: warningCount > 0,
        urgentCount,
        warningCount,
        message
      };
    } catch (error) {
      console.error('Failed to check expiring notifications:', error);
      return {
        hasUrgent: false,
        hasWarning: false,
        urgentCount: 0,
        warningCount: 0,
        message: ''
      };
    }
  }
}

// Export singleton instance
export const invitationExpirationService = new InvitationExpirationService();