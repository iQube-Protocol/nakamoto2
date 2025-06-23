
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Shield,
  Wrench,
  TrendingUp,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { DataIntegrityService } from '@/services/unified-invitation/data-integrity-service';
import { StatsCalculator } from '@/services/unified-invitation/stats-calculator';

interface DataIntegrityReport {
  totalInvitations: number;
  emailsSent: number;
  emailsPending: number;
  signupsCompleted: number;
  awaitingSignup: number;
  discrepancies: string[];
  criticalIssues: string[];
  recommendations: string[];
}

const DataIntegrityMonitor: React.FC = () => {
  const [report, setReport] = useState<DataIntegrityReport | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [legacyUsers, setLegacyUsers] = useState<{ email: string; invited_at: string; completed_at: string | null }[]>([]);

  const runIntegrityCheck = async () => {
    setIsChecking(true);
    try {
      console.log('DataIntegrityMonitor: Starting integrity check...');
      
      // Run comprehensive check
      const integrityReport = await DataIntegrityService.generateFullReport();
      setReport(integrityReport);
      setLastCheck(new Date());
      
      // Get legacy users for display
      const legacy = await DataIntegrityService.getLegacyUsers();
      setLegacyUsers(legacy);
      
      // Also run the debug method for detailed logging
      await StatsCalculator.debugStatusDistribution();
      
      if (integrityReport.criticalIssues.length > 0) {
        toast.error(`Found ${integrityReport.criticalIssues.length} critical data issues`);
      } else if (integrityReport.discrepancies.length > 0) {
        toast.warning(`Found ${integrityReport.discrepancies.length} minor discrepancies`);
      } else {
        toast.success('Data integrity check passed!');
      }
    } catch (error: any) {
      console.error('DataIntegrityMonitor: Check failed:', error);
      toast.error(`Integrity check failed: ${error.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  const fixDataIssues = async () => {
    setIsFixing(true);
    try {
      console.log('DataIntegrityMonitor: Starting data fix...');
      
      const result = await DataIntegrityService.fixDataInconsistencies();
      
      if (result.fixed > 0) {
        toast.success(`Fixed ${result.fixed} data inconsistencies`);
        // Re-run check after fixing
        await runIntegrityCheck();
      } else {
        toast.info('No data issues found to fix');
      }
      
      if (result.errors.length > 0) {
        toast.error(`Fix completed with ${result.errors.length} errors`);
        result.errors.forEach(error => console.error('Fix error:', error));
      }
    } catch (error: any) {
      console.error('DataIntegrityMonitor: Fix failed:', error);
      toast.error(`Fix failed: ${error.message}`);
    } finally {
      setIsFixing(false);
    }
  };

  useEffect(() => {
    // Run initial check
    runIntegrityCheck();
  }, []);

  const hasCriticalIssues = report?.criticalIssues && report.criticalIssues.length > 0;
  const hasDiscrepancies = report?.discrepancies && report.discrepancies.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Data Integrity Monitor
            {hasCriticalIssues && (
              <Badge variant="destructive" className="ml-2">
                {report.criticalIssues.length} Critical
              </Badge>
            )}
            {hasDiscrepancies && !hasCriticalIssues && (
              <Badge variant="secondary" className="ml-2">
                {report.discrepancies.length} Minor Issues
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {lastCheck && (
              <span className="text-xs text-gray-500">
                Last: {lastCheck.toLocaleTimeString()}
              </span>
            )}
            <Button
              onClick={fixDataIssues}
              disabled={isFixing || !report}
              variant="outline"
              size="sm"
            >
              <Wrench className={`h-4 w-4 mr-1 ${isFixing ? 'animate-spin' : ''}`} />
              Fix Issues
            </Button>
            <Button
              onClick={runIntegrityCheck}
              disabled={isChecking}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
              Check Now
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isChecking && (
          <div className="text-center py-4">
            <RefreshCw className="h-8 w-8 mx-auto animate-spin text-blue-600 mb-2" />
            <p className="text-gray-600">Running comprehensive data integrity check...</p>
          </div>
        )}

        {report && !isChecking && (
          <>
            {/* Status Overview */}
            <div className="flex items-center justify-center p-4 rounded-lg border">
              {hasCriticalIssues ? (
                <div className="flex items-center text-red-600">
                  <AlertTriangle className="h-6 w-6 mr-2" />
                  <span className="font-medium">Critical Data Issues Detected</span>
                </div>
              ) : hasDiscrepancies ? (
                <div className="flex items-center text-yellow-600">
                  <AlertTriangle className="h-6 w-6 mr-2" />
                  <span className="font-medium">Minor Discrepancies Found</span>
                </div>
              ) : (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-6 w-6 mr-2" />
                  <span className="font-medium">Data Integrity Verified</span>
                </div>
              )}
            </div>

            {/* Current Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-blue-600">{report.totalInvitations}</div>
                <div className="text-sm text-gray-600">Total Invitations</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-green-600">{report.emailsSent}</div>
                <div className="text-sm text-gray-600">Emails Sent</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-orange-600">{report.emailsPending}</div>
                <div className="text-sm text-gray-600">Emails Pending</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-purple-600">{report.signupsCompleted}</div>
                <div className="text-sm text-gray-600">Signups Completed</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-yellow-600">{report.awaitingSignup}</div>
                <div className="text-sm text-gray-600">Awaiting Signup</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-indigo-600">
                  {report.emailsSent > 0 ? ((report.signupsCompleted / report.emailsSent) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-gray-600">Conversion Rate</div>
              </div>
            </div>

            {/* Legacy Users Alert */}
            {legacyUsers.length > 0 && (
              <Alert className="border-blue-200 bg-blue-50">
                <Users className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium text-blue-800">Legacy Users Found ({legacyUsers.length}):</p>
                    <p className="text-sm text-blue-700">
                      These users signed up before the automated email system was implemented. 
                      Click "Fix Issues" to correct their email_sent status.
                    </p>
                    <div className="text-xs text-blue-600 max-h-20 overflow-y-auto">
                      {legacyUsers.slice(0, 5).map((user, index) => (
                        <div key={index}>{user.email} (invited: {new Date(user.invited_at).toLocaleDateString()})</div>
                      ))}
                      {legacyUsers.length > 5 && <div>... and {legacyUsers.length - 5} more</div>}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Critical Issues */}
            {hasCriticalIssues && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium text-red-800">Critical Issues Found:</p>
                    {report.criticalIssues.map((issue, index) => (
                      <p key={index} className="text-sm text-red-700">• {issue}</p>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Discrepancies */}
            {hasDiscrepancies && (
              <div className="space-y-2">
                <h3 className="font-medium text-yellow-700 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Data Discrepancies
                </h3>
                {report.discrepancies.map((discrepancy, index) => (
                  <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-700">• {discrepancy}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {report.recommendations.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-blue-700">Recommendations:</h3>
                {report.recommendations.map((recommendation, index) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-700">• {recommendation}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Math Verification */}
            <div className="p-3 bg-gray-50 border rounded">
              <h3 className="font-medium text-gray-700 mb-2">Math Verification:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  Basic: {report.emailsSent} + {report.emailsPending} = {report.emailsSent + report.emailsPending} 
                  {report.emailsSent + report.emailsPending === report.totalInvitations ? 
                    <Badge variant="default" className="ml-2">✓ Correct</Badge> : 
                    <Badge variant="destructive" className="ml-2">✗ Mismatch</Badge>
                  }
                </p>
                <p>
                  Signup: {report.signupsCompleted} + {report.awaitingSignup} = {report.signupsCompleted + report.awaitingSignup}
                  {report.signupsCompleted + report.awaitingSignup === report.emailsSent ? 
                    <Badge variant="default" className="ml-2">✓ Correct</Badge> : 
                    <Badge variant="destructive" className="ml-2">✗ Mismatch</Badge>
                  }
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DataIntegrityMonitor;
