import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsService } from './AnalyticsService';
import db from '../lib/db/settings';

// Mock the db module
vi.mock('../lib/db/settings', () => {
  const mockAll = vi.fn();
  const mockPrepare = vi.fn(() => ({
    all: mockAll,
    run: vi.fn(),
    get: vi.fn(),
  }));
  return {
    default: {
      prepare: mockPrepare,
    },
  };
});

// Mock GoogleGenAI
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: vi.fn().mockResolvedValue({ text: 'Mock AI Explanation' }),
      };
    },
  };
});

describe('AnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch analytics data', async () => {
    const mockData = [
      { date: '2023-01-01', value: 100 },
      { date: '2023-01-02', value: 150 },
      { date: '2023-01-03', value: 200 },
      { date: '2023-01-04', value: 250 },
      { date: '2023-01-05', value: 300 },
    ];

    // Setup mock return value
    const mockPrepare = db.prepare as any;
    mockPrepare.mockReturnValue({
      all: vi.fn().mockReturnValue(mockData),
    });

    const result = await AnalyticsService.getAnalytics('revenue', 'total', { time_range: '7d' });

    expect(result.data).toEqual(mockData);
    expect(result.forecast).toBeDefined();
    expect(result.explanation).toBe('Mock AI Explanation');
    expect(db.prepare).toHaveBeenCalled();
  });

  it('should fetch drill-down data', async () => {
    const mockData = [
      { name: '2023-01', value: 1000 },
      { name: '2023-02', value: 1500 },
    ];

    const mockPrepare = db.prepare as any;
    mockPrepare.mockReturnValue({
      all: vi.fn().mockReturnValue(mockData),
    });

    const result = await AnalyticsService.getDrillDown('revenue', 'total', 'month', {});

    expect(result.data).toEqual(mockData);
    expect(result.summary.total).toBe(2500);
    expect(db.prepare).toHaveBeenCalled();
  });

  it('should handle empty data gracefully', async () => {
    const mockPrepare = db.prepare as any;
    mockPrepare.mockReturnValue({
      all: vi.fn().mockReturnValue([]),
    });

    const result = await AnalyticsService.getAnalytics('revenue', 'total', { time_range: '7d' });

    expect(result.data).toEqual([]);
    expect(result.forecast).toEqual([]);
    expect(result.explanation).toContain('No data available');
  });
});
