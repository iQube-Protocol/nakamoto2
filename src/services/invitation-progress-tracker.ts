
export interface BatchProgress {
  currentBatch: number;
  totalBatches: number;
  currentOperation: string;
  emailsProcessed: number;
  totalEmails: number;
  emailsCreated: number;
  emailsSkipped: number;
  errors: string[];
  startTime: number;
  estimatedTimeRemaining?: number;
}

export interface ProgressCallback {
  (progress: BatchProgress): void;
}

export class InvitationProgressTracker {
  private progress: BatchProgress;
  private callback?: ProgressCallback;

  constructor(totalEmails: number, callback?: ProgressCallback) {
    this.progress = {
      currentBatch: 0,
      totalBatches: 0,
      currentOperation: 'Initializing...',
      emailsProcessed: 0,
      totalEmails,
      emailsCreated: 0,
      emailsSkipped: 0,
      errors: [],
      startTime: Date.now()
    };
    this.callback = callback;
  }

  updateProgress(updates: Partial<BatchProgress>) {
    this.progress = { ...this.progress, ...updates };
    
    // Calculate estimated time remaining
    const elapsed = Date.now() - this.progress.startTime;
    const rate = this.progress.emailsProcessed / elapsed; // emails per ms
    const remaining = this.progress.totalEmails - this.progress.emailsProcessed;
    this.progress.estimatedTimeRemaining = remaining / rate;

    this.callback?.(this.progress);
  }

  getProgress(): BatchProgress {
    return { ...this.progress };
  }
}
