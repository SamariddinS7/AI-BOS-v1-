// Analytics module shared types

export type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';
export type ForecastModel = 'linear' | 'prophet' | 'arima' | 'lstm';

export interface AnalyticsParams {
  time_range?: TimeRange;
  department?: string;
  region?: string;
  product?: string;
  campaign?: string;
  model?: ForecastModel;
}

export interface DataPoint {
  date: string;
  value: number;
  [key: string]: unknown;
}

export interface AnalyticsSummary {
  total: number;
  average: number;
  growth: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AnalyticsInsights {
  whyChanged: string;
  anomaly: string;
  suggestion: string;
}

export interface AnalyticsResult {
  data: DataPoint[];
  summary: AnalyticsSummary;
  insights: AnalyticsInsights;
  forecast?: DataPoint[];
}

export interface DrilldownResult {
  module: string;
  metric: string;
  dimension: string;
  data: DataPoint[];
  summary: AnalyticsSummary;
}
