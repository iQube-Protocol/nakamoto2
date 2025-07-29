
export interface UnifiedInvitationStats {
  totalCreated: number;
  emailsSent: number;
  emailsPending: number;
  signupsCompleted: number;
  awaitingSignup: number;
  directSignups: number;
  conversionRate: number;
  lastUpdated: string;
}

export interface BatchStatus {
  batchId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  totalEmails: number;
  emailsSent: number;
  emailsFailed: number;
  errors: string[];
  createdAt?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ValidationResult {
  isConsistent: boolean;
  issues: string[];
}

export interface DetailedValidationResult {
  isConsistent: boolean;
  issues: string[];
  detailedStats: {
    totalInvitations?: number;
    emailsSent?: number;
    emailsPending?: number;
    signupsCompleted?: number;
    totalBatches?: number;
    batchEmailTotals?: number;
  };
}

export interface PendingInvitation {
  id: string;
  email: string;
  persona_type: string;
  invited_at: string;
  email_sent: boolean;
  email_sent_at?: string;
  batch_id?: string;
  send_attempts: number;
}

export interface EmailBatch {
  id: string;
  batch_id: string;
  total_emails: number;
  emails_sent: number;
  emails_failed: number;
  status: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}
