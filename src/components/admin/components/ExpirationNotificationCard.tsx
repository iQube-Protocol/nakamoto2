import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ExpirationStats {
  total_active: number;
  total_expired: number;
  expiring_soon_7_days: number;
  expiring_soon_3_days: number;
  expiring_today: number;
}

interface ExpirationNotificationCardProps {
  onExpiringClick?: (category: string, title: string, count: number) => void;
}

export function ExpirationNotificationCard({ onExpiringClick }: ExpirationNotificationCardProps) {
  const [stats, setStats] = useState<ExpirationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadExpirationStats = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_invitation_expiration_stats');
      
      if (error) {
        console.error('Error loading expiration stats:', error);
        toast.error('Failed to load expiration statistics');
        return;
      }

      if (data && data.length > 0) {
        setStats(data[0]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load expiration statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExpirationStats();
  }, []);

  if (isLoading) {
    return (
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Invitation Expiration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const hasUrgentExpirations = stats.expiring_today > 0 || stats.expiring_soon_3_days > 0;
  const hasWarningExpirations = stats.expiring_soon_7_days > 0;

  return (
    <Card className={`border ${hasUrgentExpirations ? 'border-destructive' : hasWarningExpirations ? 'border-warning' : 'border-muted'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Invitation Expiration Status
          {hasUrgentExpirations && (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground">Active</div>
            <div className="text-lg font-semibold text-success">{stats.total_active}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Expired</div>
            <div className="text-lg font-semibold text-muted-foreground">{stats.total_expired}</div>
          </div>
        </div>

        {hasUrgentExpirations && (
          <div className="space-y-2">
            {stats.expiring_today > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="w-full justify-between"
                onClick={() => onExpiringClick?.('expiringToday', 'Expiring Today', stats.expiring_today)}
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" />
                  Expiring Today
                </span>
                <Badge variant="destructive">{stats.expiring_today}</Badge>
              </Button>
            )}
            
            {stats.expiring_soon_3_days > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="w-full justify-between"
                onClick={() => onExpiringClick?.('expiring3Days', 'Expiring in 3 Days', stats.expiring_soon_3_days)}
              >
                <span className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Next 3 Days
                </span>
                <Badge variant="destructive">{stats.expiring_soon_3_days}</Badge>
              </Button>
            )}
          </div>
        )}

        {hasWarningExpirations && !hasUrgentExpirations && (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between border-warning text-warning"
            onClick={() => onExpiringClick?.('expiring7Days', 'Expiring in 7 Days', stats.expiring_soon_7_days)}
          >
            <span className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Next 7 Days
            </span>
            <Badge variant="secondary">{stats.expiring_soon_7_days}</Badge>
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={loadExpirationStats}
          className="w-full"
        >
          Refresh Status
        </Button>
      </CardContent>
    </Card>
  );
}