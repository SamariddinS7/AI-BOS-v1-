import React, { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import { monitoringService } from '../lib/db/monitoringService';
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function Monitoring() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const summary = monitoringService.getAnalyticsSummary();
    setData(summary);
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">API Monitoring Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Activity className="text-blue-500" />
            <span className="text-sm">Total Tests</span>
          </div>
          <div className="text-2xl font-bold">{data.summary.total_tests}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="text-yellow-500" />
            <span className="text-sm">Avg Latency (ms)</span>
          </div>
          <div className="text-2xl font-bold">{data.summary.avg_latency?.toFixed(2) || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            <span className="text-sm">Failed Tests</span>
          </div>
          <div className="text-2xl font-bold">{data.summary.failed_tests || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-500" />
            <span className="text-sm">Auth Issues</span>
          </div>
          <div className="text-2xl font-bold">{data.summary.auth_issues || 0}</div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Top Failing Endpoints</h2>
        <table className="w-full">
            <thead>
                <tr className="border-b">
                    <th className="text-left py-2">Endpoint</th>
                    <th className="text-left py-2">Fail Count</th>
                </tr>
            </thead>
            <tbody>
                {data.topFailures.map((item: any) => (
                    <tr key={item.endpoint} className="border-b">
                        <td className="py-2">{item.endpoint}</td>
                        <td className="py-2">{item.fail_count}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </Card>
    </div>
  );
}
