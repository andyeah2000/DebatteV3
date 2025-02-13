'use client';

import { useAnalytics } from '@/hooks/useAnalytics';
import { EnhancedDashboard } from '@/components/analytics/enhanced-dashboard';
import { Toaster } from '@/components/ui/toaster';

export default function AdminPage() {
  const {
    data,
    isLoading,
    error,
    period,
    setPeriod,
    refetch,
    exportData,
  } = useAnalytics();

  return (
    <>
      <EnhancedDashboard
        analytics={data}
        isLoading={isLoading}
        error={error}
        period={period}
        onPeriodChange={setPeriod}
        onExport={exportData}
        onRetry={refetch}
      />
      <Toaster />
    </>
  );
} 