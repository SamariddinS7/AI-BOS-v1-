import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarketingAgentFramework } from './marketingAgents';
import * as geminiModule from './gemini';
import * as aiLoggerModule from './aiLogger';

vi.mock('./gemini');
vi.mock('./aiLogger');

describe('MarketingAgentFramework', () => {
  let framework: MarketingAgentFramework;

  beforeEach(() => {
    vi.resetAllMocks();
    framework = new MarketingAgentFramework();
  });

  it('runMarketAnalyst should call Gemini and return insights', async () => {
    const mockResponse = {
      trends: ['Trend 1'],
      competitors: [{ name: 'Comp 1', strengths: [], weaknesses: [] }],
      swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
      customerSentiment: 'Positive',
    };

    (geminiModule.callGeminiWithRetry as any).mockResolvedValue({
      text: JSON.stringify(mockResponse),
    });

    const result = await framework.runMarketAnalyst({});
    expect(geminiModule.callGeminiWithRetry).toHaveBeenCalled();
    expect(result).toEqual(mockResponse);
  });

  it('runCampaignStrategist should call Gemini and return strategy', async () => {
    const mockResponse = {
      channels: [],
      objectives: [],
      timeline: 'Q1',
      keyMetrics: [],
    };

    (geminiModule.callGeminiWithRetry as any).mockResolvedValue({
      text: JSON.stringify(mockResponse),
    });

    const result = await framework.runCampaignStrategist({});
    expect(geminiModule.callGeminiWithRetry).toHaveBeenCalled();
    expect(result).toEqual(mockResponse);
  });

  it('should handle errors and log failure', async () => {
    const error = new Error('API Error');
    (geminiModule.callGeminiWithRetry as any).mockRejectedValue(error);

    await expect(framework.runMarketAnalyst({})).rejects.toThrow('API Error');
    expect(aiLoggerModule.logAIFailure).toHaveBeenCalledWith('API Error', {}, 'MARKETING_AGENT');
  });
});
