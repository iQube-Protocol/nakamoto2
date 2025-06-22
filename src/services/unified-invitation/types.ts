
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
