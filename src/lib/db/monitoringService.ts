import db from './settings';

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
  logTestResult: (result: ApiTestResult) => {
    try {
      db.prepare(`
        INSERT INTO api_test_log (
          endpoint, method, status_code, response_time_ms, passed, error_type, requires_auth, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        result.endpoint,
        result.method,
        result.status_code,
        result.response_time_ms,
        result.passed ? 1 : 0,
        result.error_type || null,
        result.requires_auth ? 1 : 0,
        result.notes || null
      );
    } catch (error) {
      console.error('Failed to log API test result:', error);
    }
  },

  getAnalyticsSummary: () => {
    try {
      const summary = db.prepare(`
        SELECT 
            count(*) as total_tests,
            avg(response_time_ms) as avg_latency,
            sum(case when passed = 0 then 1 else 0 end) as failed_tests,
            sum(case when status_code = 401 or status_code = 403 then 1 else 0 end) as auth_issues
        FROM api_test_log
      `).get();

      const topFailures = db.prepare(`
        SELECT endpoint, count(*) as fail_count 
        FROM api_test_log 
        WHERE passed = 0 
        GROUP BY endpoint 
        ORDER BY fail_count DESC 
        LIMIT 5
      `).all();

      return {
        summary,
        topFailures
      };
    } catch (error) {
      console.error('Failed to get analytics summary:', error);
      return null;
    }
  }
};
