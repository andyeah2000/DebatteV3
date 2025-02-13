import { AnalyticsData } from '@/types/analytics';

export class AnalyticsService {
  private static instance: AnalyticsService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public async getAnalytics(period: 'daily' | 'weekly' | 'monthly'): Promise<AnalyticsData> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics?period=${period}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      return this.transformAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  private transformAnalyticsData(rawData: any): AnalyticsData {
    return {
      userActivity: rawData.userActivity.map((activity: any) => ({
        timestamp: activity.timestamp,
        activeUsers: activity.activeUsers,
        newUsers: activity.newUsers,
      })),
      categories: rawData.categories.map((category: any) => ({
        name: category.name,
        count: category.count,
      })),
      hourlyEngagement: rawData.hourlyEngagement.map((hour: any) => ({
        hour: hour.hour,
        monday: hour.monday || 0,
        tuesday: hour.tuesday || 0,
        wednesday: hour.wednesday || 0,
        thursday: hour.thursday || 0,
        friday: hour.friday || 0,
        saturday: hour.saturday || 0,
        sunday: hour.sunday || 0,
      })),
      debateNetwork: {
        nodes: rawData.debateNetwork.nodes.map((node: any) => ({
          id: node.id,
          size: node.size || 1,
          color: node.color || '#666666',
          group: node.group,
        })),
        links: rawData.debateNetwork.links.map((link: any) => ({
          source: link.source,
          target: link.target,
          distance: link.distance || 30,
        })),
      },
      qualityMetrics: {
        argumentQuality: rawData.qualityMetrics.argumentQuality || 0,
        factualAccuracy: rawData.qualityMetrics.factualAccuracy || 0,
        civilityScore: rawData.qualityMetrics.civilityScore || 0,
        sourceQuality: rawData.qualityMetrics.sourceQuality || 0,
        engagementLevel: rawData.qualityMetrics.engagementLevel || 0,
      },
    };
  }

  public async exportAnalytics(period: 'daily' | 'weekly' | 'monthly'): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/export?period=${period}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to export analytics data');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting analytics:', error);
      throw error;
    }
  }
} 