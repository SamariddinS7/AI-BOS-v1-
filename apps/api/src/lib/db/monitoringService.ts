import prisma from './prisma.js';

export interface ApiTestResult {
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  passed: boolean;
  error_type?: string | null;
  requires_auth: boolean;
  notes?: string;
}

export const monitoringService = {
  logTestResult: async (result: ApiTestResult) => {
    try {
      await prisma.apiTestLog.create({
        data: {
          endpoint: result.endpoint,
          method: result.method,
          status_code: result.status_code,
          response_time_ms: result.response_time_ms,
          passed: result.passed,
          error_type: result.error_type || null,
          requires_auth: result.requires_auth,
          notes: result.notes || null
        }
      });
    } catch (error) {
      console.error('Failed to log API test result:', error);
    }
  },

  getAnalyticsSummary: async () => {
    try {
      const [totalTests, avgLatencyAgg, failedTests, authIssues, topFailures] = await Promise.all([
        prisma.apiTestLog.count(),
        prisma.apiTestLog.aggregate({
          _avg: { response_time_ms: true }
        }),
        prisma.apiTestLog.count({
          where: { passed: false }
        }),
        prisma.apiTestLog.count({
          where: { status_code: { in: [401, 403] } }
        }),
        prisma.$queryRaw<{ endpoint: string; fail_count: bigint }[]>`
          SELECT endpoint, count(*) as fail_count
          FROM api_test_log
          WHERE passed = false
          GROUP BY endpoint
          ORDER BY fail_count DESC
          LIMIT 5
        `
      ]);

      const summary = {
        total_tests: totalTests,
        avg_latency: avgLatencyAgg._avg.response_time_ms,
        failed_tests: failedTests,
        auth_issues: authIssues
      };

      const topFailuresFormatted = topFailures.map((row) => ({
        endpoint: row.endpoint,
        fail_count: Number(row.fail_count)
      }));

      return {
        summary,
        topFailures: topFailuresFormatted
      };
    } catch (error) {
      console.error('Failed to get analytics summary:', error);
      return null;
    }
  }
};
