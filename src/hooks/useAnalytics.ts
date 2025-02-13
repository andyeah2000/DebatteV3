import { useState, useEffect, useCallback } from 'react';
import { AnalyticsData } from '@/types/analytics';
import { AnalyticsService } from '@/services/analytics.service';
import { useToast } from '@/components/ui/use-toast';

type Period = 'daily' | 'weekly' | 'monthly';

interface UseAnalyticsReturn {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: Error | null;
  period: Period;
  setPeriod: (period: Period) => void;
  refetch: () => Promise<void>;
  exportData: () => Promise<void>;
}

export function useAnalytics(): UseAnalyticsReturn {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [period, setPeriod] = useState<Period>('daily');

  const { toast } = useToast();
  const analyticsService = AnalyticsService.getInstance();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const analyticsData = await analyticsService.getAnalytics(period);
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch analytics data'));
      toast({
        title: 'Error',
        description: 'Failed to fetch analytics data. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [period, toast]);

  const exportData = async () => {
    try {
      setIsLoading(true);
      const blob = await analyticsService.exportAnalytics(period);
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Analytics data exported successfully.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to export analytics data. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    period,
    setPeriod,
    refetch: fetchData,
    exportData,
  };
} 