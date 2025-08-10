
import { PersonaReconciler } from './persona-reconciler';
import { EmailReconciler } from './email-reconciler';
import { ReportGenerator } from './report-generator';
import { ReconciliationResult, ReconciliationReport, DuplicateEmailRecord } from './types';

class DataReconciliationService {
  private personaReconciler = new PersonaReconciler();
  private emailReconciler = new EmailReconciler();
  private reportGenerator = new ReportGenerator();

  async reconcileHistoricalData(): Promise<ReconciliationResult> {
    const result: ReconciliationResult = {
      emailsReconciled: 0,
      signupsReconciled: 0,
      duplicatesHandled: 0,
      errors: []
    };

    try {
      // Step 1: Reconcile direct signups (new users with personas but no invitation records)
      await this.personaReconciler.reconcileDirectSignups(result);
      
      // Step 2: Reconcile orphaned personas (existing invitation flow)
      await this.personaReconciler.reconcileOrphanedPersonas(result);

      // Step 3: Reconcile email counts by checking actual sent emails
      await this.emailReconciler.reconcileEmailCounts(result);

      return result;
    } catch (error: any) {
      result.errors.push(`Unexpected error: ${error.message}`);
      return result;
    }
  }

  async reconcileDirectSignupForEmail(email: string, personaType?: 'knyt' | 'qrypto'): Promise<void> {
    try {
      await this.personaReconciler.reconcileDirectSignupByEmail(email, personaType);
    } catch (error) {
      console.error('DataReconciliationService: Failed to reconcile direct signup for email', email, error);
    }
  }

  async getReconciliationReport(): Promise<ReconciliationReport> {
    return this.reportGenerator.getReconciliationReport();
  }

  async findDuplicateEmails(): Promise<DuplicateEmailRecord[]> {
    return this.reportGenerator.findDuplicateEmails();
  }
}

export const dataReconciliationService = new DataReconciliationService();
export type { ReconciliationResult, ReconciliationReport, DuplicateEmailRecord };
