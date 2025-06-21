
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
      // Step 1: Reconcile orphaned personas
      await this.personaReconciler.reconcileOrphanedPersonas(result);

      // Step 2: Reconcile email counts by checking actual sent emails
      await this.emailReconciler.reconcileEmailCounts(result);

      return result;
    } catch (error: any) {
      result.errors.push(`Unexpected error: ${error.message}`);
      return result;
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
