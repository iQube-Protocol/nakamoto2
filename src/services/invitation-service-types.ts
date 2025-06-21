
export interface InvitationData {
  email: string;
  personaType: 'knyt' | 'qrypto';
  personaData: Record<string, any>;
}

export interface PendingInvitation {
  id: string;
  email: string;
  persona_type: string;
  invited_at: string;
  email_sent?: boolean;
  email_sent_at?: string | null;
  batch_id?: string | null;
  send_attempts?: number;
  signup_completed?: boolean;
}

export interface DeduplicationStats {
  totalEntries: number;
  finalCount: number;
  duplicatesFound: number;
  mergedEmails: string[];
}

export interface BatchProgress {
  batchId: string;
  totalEmails: number;
  emailsProcessed: number;
  emailsSuccessful: number;
  emailsFailed: number;
  errors: string[];
  isComplete: boolean;
}

export interface EmailBatch {
  id: string;
  batch_id: string;
  total_emails: number;
  emails_sent: number;
  emails_failed: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  created_by: string | null;
}

export interface InvitationStats {
  totalCreated: number;
  emailsSent: number;
  emailsPending: number;
  signupsCompleted: number;
  awaitingSignup: number;
  conversionRate: number;
}

export interface UserDetail {
  id: string;
  email: string;
  persona_type: string;
  invited_at: string;
  email_sent: boolean;
  email_sent_at: string | null;
  signup_completed: boolean;
  completed_at: string | null;
  persona_data: Record<string, any>;
  batch_id?: string | null;
  send_attempts?: number;
  blak_qube_data?: Record<string, any>;
  user_id?: string;
}
