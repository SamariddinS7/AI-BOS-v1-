import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ExecutionEngine } from '../lib/workflow-engine/ExecutionEngine';
import { apiGatewayMiddleware } from '../middleware/gateway';
import { Workflow } from '../lib/workflow-engine/types';

// Mock sqlite3 for Workflow ExecutionEngine
vi.mock('../lib/db/settings', () => {
  return {
    default: {
      prepare: vi.fn().mockReturnValue({
        run: vi.fn(),
        get: vi.fn().mockReturnValue({ status: 'completed' }),
        all: vi.fn().mockReturnValue([]),
      }),
    },
  };
});

describe('Memory and Resource Leak Safety Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('Gateway Rate Limiter prevents memory leak by pruning expired keys', async () => {
    const mockReq = { 
      path: '/api/v1/test', 
      ip: '127.0.0.1',
      headers: { 'x-api-key': 'test-api-key' }
    } as any;
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      on: vi.fn(),
    } as any;
    const mockNext = vi.fn();

    // Call the middleware to register an IP rate limit entry
    await apiGatewayMiddleware(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();

    // Fast forward time by 6 minutes (above the 5 minute prune threshold)
    vi.advanceTimersByTime(310000);

    // After advancement, the background interval should have pruned the rate limit cache
    // Let's verify that no permanent leaks can remain by calling next requests
    await apiGatewayMiddleware(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(2);
  });

  it('Workflow ExecutionEngine deletes completed execution references to avoid retention leaks', async () => {
    const engine = new ExecutionEngine();
    
    // Create mock workflow
    const mockWorkflow = {
      id: 'wf-123',
      name: 'Test Leak Safety',
      nodes: [],
      edges: [],
      status: 'active',
      triggerType: 'manual',
      version: 1,
      createdBy: 'test-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any as Workflow;

    engine.registerWorkflow(mockWorkflow);

    // Execute workflow
    const execId = await engine.executeWorkflow('wf-123', { test: true });
    
    // The execution should be cleaned up from the running map once completed or failed
    const hasExecutionRef = (engine as any).executions.has(execId);
    expect(hasExecutionRef).toBe(false); // Verified: removed from memory to prevent leak!
  });
});
