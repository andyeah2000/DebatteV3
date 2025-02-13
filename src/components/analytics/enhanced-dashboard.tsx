import { useMemo } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { ResponsiveNetwork } from '@nivo/network';
import { ResponsiveRadar } from '@nivo/radar';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { AnalyticsData, NetworkNode, NetworkLink } from '@/types/analytics';
import { LoadingState } from './loading-state';
import { ErrorState } from './error-state';

interface EnhancedDashboardProps {
  analytics: AnalyticsData | null;
  isLoading: boolean;
  error: Error | null;
  period: 'daily' | 'weekly' | 'monthly';
  onPeriodChange: (period: 'daily' | 'weekly' | 'monthly') => void;
  onExport: () => Promise<void>;
  onRetry: () => void;
}

export function EnhancedDashboard({
  analytics,
  isLoading,
  error,
  period,
  onPeriodChange,
  onExport,
  onRetry,
}: EnhancedDashboardProps) {
  const { toast } = useToast();

  const userActivityData = useMemo(() => {
    if (!analytics) return [];
    return [
      {
        id: 'Active Users',
        data: analytics.userActivity.map((d) => ({
          x: new Date(d.timestamp),
          y: d.activeUsers,
        })),
      },
      {
        id: 'New Users',
        data: analytics.userActivity.map((d) => ({
          x: new Date(d.timestamp),
          y: d.newUsers,
        })),
      },
    ];
  }, [analytics]);

  const debateDistributionData = useMemo(() => {
    if (!analytics) return [];
    return analytics.categories.map((category) => ({
      id: category.name,
      label: category.name,
      value: category.count,
    }));
  }, [analytics]);

  const userEngagementHeatmap = useMemo(() => {
    if (!analytics) return [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map(day => ({
      id: day,
      data: analytics.hourlyEngagement.map(hour => ({
        x: hour.hour.toString(),
        y: hour[day.toLowerCase() as keyof typeof hour],
      }))
    }));
  }, [analytics]);

  const debateNetworkData = useMemo(() => {
    if (!analytics) return { nodes: [], links: [] };
    return {
      nodes: analytics.debateNetwork.nodes.map(node => ({
        ...node,
        data: { height: node.size }
      })),
      links: analytics.debateNetwork.links
    };
  }, [analytics]);

  const qualityMetricsData = useMemo(() => {
    if (!analytics) return [];
    return [
      {
        metric: 'Argument Quality',
        value: analytics.qualityMetrics.argumentQuality,
      },
      {
        metric: 'Factual Accuracy',
        value: analytics.qualityMetrics.factualAccuracy,
      },
      {
        metric: 'Civility Score',
        value: analytics.qualityMetrics.civilityScore,
      },
      {
        metric: 'Source Quality',
        value: analytics.qualityMetrics.sourceQuality,
      },
      {
        metric: 'Engagement Level',
        value: analytics.qualityMetrics.engagementLevel,
      },
    ];
  }, [analytics]);

  const handleExport = async () => {
    try {
      await onExport();
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
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !analytics) {
    return <ErrorState message={error?.message} onRetry={onRetry} />;
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Enhanced Analytics Dashboard</h1>
        <div className="flex space-x-4">
          <div className="flex space-x-2">
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <Button
                key={p}
                onClick={() => onPeriodChange(p)}
                variant={period === p ? 'default' : 'outline'}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </div>
          <Button onClick={handleExport} variant="outline">
            Export Data
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* User Activity Line Chart */}
        <motion.div
          className="rounded-lg bg-white p-6 shadow-lg dark:bg-secondary-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="mb-4 text-lg font-semibold">User Activity Trends</h2>
          <div className="h-80">
            <ResponsiveLine
              data={userActivityData}
              margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
              xScale={{ type: 'time', format: 'native' }}
              yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
              axisBottom={{
                format: '%b %d',
                tickRotation: -45,
              }}
              curve="monotoneX"
              enablePointLabel={true}
              pointSize={8}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              enableSlices="x"
              enableGridX={false}
              theme={{
                axis: {
                  ticks: {
                    text: {
                      fill: '#64748b',
                    },
                  },
                },
                grid: {
                  line: {
                    stroke: '#e2e8f0',
                  },
                },
              }}
            />
          </div>
        </motion.div>

        {/* Debate Distribution Pie Chart */}
        <motion.div
          className="rounded-lg bg-white p-6 shadow-lg dark:bg-secondary-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="mb-4 text-lg font-semibold">Debate Categories</h2>
          <div className="h-80">
            <ResponsivePie
              data={debateDistributionData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              borderWidth={1}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor={{ from: 'color', modifiers: [] }}
              theme={{
                labels: {
                  text: {
                    fill: '#64748b',
                  },
                },
              }}
            />
          </div>
        </motion.div>

        {/* Engagement Heatmap */}
        <motion.div
          className="rounded-lg bg-white p-6 shadow-lg dark:bg-secondary-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="mb-4 text-lg font-semibold">Activity Heatmap</h2>
          <div className="h-80">
            <ResponsiveHeatMap
              data={userEngagementHeatmap}
              margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
              valueFormat=">-.2s"
              axisTop={null}
              axisRight={null}
              emptyColor="#555555"
              colors={{
                type: 'sequential',
                scheme: 'blues',
              }}
              enableLabels={false}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: 'Hour of Day',
                legendPosition: 'middle',
                legendOffset: 36,
              }}
              theme={{
                axis: {
                  ticks: {
                    text: {
                      fill: '#64748b',
                    },
                  },
                },
              }}
            />
          </div>
        </motion.div>

        {/* Network Visualization */}
        <motion.div
          className="rounded-lg bg-white p-6 shadow-lg dark:bg-secondary-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="mb-4 text-lg font-semibold">Debate Network</h2>
          <div className="h-80">
            <ResponsiveNetwork
              data={debateNetworkData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              linkDistance={(e) => e.distance}
              centeringStrength={0.3}
              repulsivity={6}
              nodeSize={(n) => n.size}
              activeNodeSize={(n) => 1.5 * n.size}
              nodeColor={(e) => e.color}
              nodeBorderWidth={1}
              nodeBorderColor={{
                from: 'color',
                modifiers: [['darker', 0.8]],
              }}
              linkThickness={(l) => 2 + 2 * l.target.size}
              linkBlendMode="multiply"
              motionConfig="gentle"
            />
          </div>
        </motion.div>

        {/* Quality Metrics Radar Chart */}
        <motion.div
          className="rounded-lg bg-white p-6 shadow-lg dark:bg-secondary-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="mb-4 text-lg font-semibold">Quality Metrics</h2>
          <div className="h-80">
            <ResponsiveRadar
              data={qualityMetricsData}
              keys={['value']}
              indexBy="metric"
              maxValue="auto"
              margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
              curve="linearClosed"
              borderWidth={2}
              borderColor={{ from: 'color' }}
              gridLevels={5}
              gridShape="circular"
              gridLabelOffset={36}
              enableDots={true}
              dotSize={10}
              dotColor={{ theme: 'background' }}
              dotBorderWidth={2}
              dotBorderColor={{ from: 'color' }}
              enableDotLabel={true}
              dotLabel="value"
              dotLabelYOffset={-12}
              fillOpacity={0.25}
              blendMode="multiply"
              animate={true}
              motionConfig="gentle"
              theme={{
                dots: {
                  text: {
                    fill: '#64748b',
                  },
                },
                labels: {
                  text: {
                    fill: '#64748b',
                  },
                },
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
} 