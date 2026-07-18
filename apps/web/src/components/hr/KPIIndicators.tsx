import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { TrendingUp, TrendingDown, Target, Award, AlertTriangle } from "lucide-react";

const kpiData = [
  { name: "Abdullayev Jasur", department: "IT", tasks: 45, completed: 42, quality: 94, efficiency: 93, target: 90, trend: 5 },
  { name: "Karimova Dilnoza", department: "Moliya", tasks: 38, completed: 35, quality: 92, efficiency: 88, target: 85, trend: 3 },
  { name: "Rahimov Bobur", department: "Savdo", tasks: 50, completed: 48, quality: 96, efficiency: 95, target: 90, trend: 8 },
  { name: "Toshmatov Sardor", department: "IT", tasks: 42, completed: 38, quality: 88, efficiency: 85, target: 85, trend: -2 },
  { name: "Xolmatova Madina", department: "Marketing", tasks: 35, completed: 33, quality: 95, efficiency: 92, target: 90, trend: 4 },
];

export const KPIIndicators = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-base font-bold text-text-muted uppercase tracking-wider mb-1">O'rtacha KPI</p>
                <h3 className="text-3xl font-bold text-text-primary">92.4%</h3>
                <p className="text-base text-emerald-400 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> +2.4% o'tgan oyga nisbatan
                </p>
              </div>
              <div className="p-3 bg-brand-500/10 rounded-2xl text-brand-500">
                <Target className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-base font-bold text-text-muted uppercase tracking-wider mb-1">Top Performers</p>
                <h3 className="text-3xl font-bold text-text-primary">12 kishi</h3>
                <p className="text-base text-emerald-400 mt-2 flex items-center gap-1">
                  <Award className="w-4 h-4" /> KPI {'>'} 95%
                </p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-base font-bold text-text-muted uppercase tracking-wider mb-1">Diqqat talab</p>
                <h3 className="text-3xl font-bold text-text-primary">3 kishi</h3>
                <p className="text-base text-rose-400 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> KPI {'<'} 80%
                </p>
              </div>
              <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Xodimlar KPI Ko'rsatkichlari</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-base">
            <thead className="bg-surface-card/50 text-text-muted border-b border-border-dark">
              <tr>
                <th className="px-6 py-4 font-medium">Xodim</th>
                <th className="px-6 py-4 font-medium">Bo'lim</th>
                <th className="px-6 py-4 font-medium text-center">Sifat</th>
                <th className="px-6 py-4 font-medium text-center">Samaradorlik</th>
                <th className="px-6 py-4 font-medium">Trend</th>
                <th className="px-6 py-4 font-medium">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {kpiData.map((kpi, i) => (
                <tr key={i} className="hover:bg-surface-card/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-text-primary">{kpi.name}</td>
                  <td className="px-6 py-4 text-text-secondary">{kpi.department}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 rounded bg-emerald-900/20 text-emerald-400 font-bold text-base">
                      {kpi.quality}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 rounded bg-brand-900/20 text-brand-400 font-bold text-base">
                      {kpi.efficiency}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1 font-bold ${kpi.trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {kpi.trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(kpi.trend)}%
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-32 space-y-1">
                      <div className="w-full bg-surface-dark rounded-full h-1.5">
                        <div 
                          className={`h-full rounded-full ${kpi.quality >= 90 ? 'bg-emerald-500' : kpi.quality >= 85 ? 'bg-brand-500' : 'bg-amber-500'}`} 
                          style={{ width: `${kpi.quality}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
