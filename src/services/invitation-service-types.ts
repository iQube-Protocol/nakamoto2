
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
