
export interface UnifiedInvitationStats {
  totalCreated: number;
  emailsSent: number;
  emailsPending: number;
  signupsCompleted: number;
  awaitingSignup: number;
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
}

export interface ValidationResult {
  isConsistent: boolean;
  issues: string[];
}
