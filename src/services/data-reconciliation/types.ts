
export interface ReconciliationResult {
  emailsReconciled: number;
  signupsReconciled: number;
  duplicatesHandled: number;
  errors: string[];
}

export interface InvitationRecord {
  id: string;
  email: string;
  email_sent: boolean;
  email_sent_at: string | null;
  batch_id: string | null;
  invited_at: string;
}

export interface ReconciliationReport {
  totalInvitations: number;
  emailsSent: number;
  signupsCompleted: number;
  pendingEmails: number;
  awaitingSignup: number;
}

export interface DuplicateEmailRecord {
  email: string;
  count: number;
  ids: string[];
}
