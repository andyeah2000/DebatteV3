export interface UserActivity {
  timestamp: string;
  activeUsers: number;
  newUsers: number;
}

export interface Category {
  name: string;
  count: number;
}

export interface HourlyEngagement {
  hour: number;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

export interface NetworkNode {
  id: string;
  size: number;
  color: string;
  group?: string;
}

export interface NetworkLink {
  source: string;
  target: string;
  distance: number;
}

export interface QualityMetrics {
  argumentQuality: number;
  factualAccuracy: number;
  civilityScore: number;
  sourceQuality: number;
  engagementLevel: number;
}

export interface AnalyticsData {
  userActivity: UserActivity[];
  categories: Category[];
  hourlyEngagement: HourlyEngagement[];
  debateNetwork: {
    nodes: NetworkNode[];
    links: NetworkLink[];
  };
  qualityMetrics: QualityMetrics;
} 