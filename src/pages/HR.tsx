import React, { useState } from 'react';
import { Users, UserPlus, Briefcase, GraduationCap, Star, Clock, Search } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import KPICard from '../components/dashboard/KPICard';
import Card from '../components/ui/Card';
import AIInsightCard from '../components/dashboard/AIInsightCard';
import ExpandedChartModal from '../components/dashboard/ExpandedChartModal';
import DrillDownModal from '../components/analytics/DrillDownModal';

import { SalaryCalculation } from '../components/hr/SalaryCalculation';
import { KPIIndicators } from '../components/hr/KPIIndicators';
import { EmployeeList } from '../components/hr/EmployeeList';
import { HRAttendance } from '../components/hr/HRAttendance';

const T = {
  accent: "var(--color-brand-500)",
  violet: "var(--color-violet-500)",
  teal: "var(--color-enterprise-teal)",
  amber: "var(--color-amber-500)",
  green: "var(--color-emerald-500)",
  sky: "var(--color-brand-400)",
  red: "var(--color-rose-500)",
};

const HR_DATA = [
  {id:1, name:"Azizbek Karimov",  dept:"Marketing", pos:"Lead Designer", kpi:94, status:"Faol",    salary:1200, color:T.accent},
  {id:2, name:"Sardor Olimov",    dept:"IT",        pos:"Senior Dev",    kpi:91, status:"Faol",    salary:1500, color:T.violet},
  {id:3, name:"Malika Ahmedova",  dept:"HR",        pos:"HR Manager",    kpi:88, status:"Ta'tilda", salary:900,  color:T.teal},
  {id:4, name:"Javohir Tursunov", dept:"Sales",     pos:"Sales Manager", kpi:82, status:"Faol",    salary:1100, color:T.amber},
  {id:5, name:"Zilola Karimova",  dept:"Finance",   pos:"Accountant",    kpi:95, status:"Faol",    salary:1300, color:T.green},
  {id:6, name:"Doston Ergashev",  dept:"Logistics", pos:"Manager",       kpi:78, status:"Sinovda", salary:700,  color:T.sky},
];

const DEPT_KPI = [
  {name:"Marketing", kpi:92, count:8},
  {name:"IT",        kpi:89, count:12},
  {name:"Sales",     kpi:84, count:15},
  {name:"Finance",   kpi:94, count:5},
  {name:"HR",        kpi:88, count:4},
  {name:"Logistics", kpi:81, count:10},
];

export default function HR() {
  const { success, info } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'attendance' | 'kpi' | 'salary'>('overview');
  const [analytics, setAnalytics] = useState<{isOpen: boolean, title: string, metric: string}>({isOpen: false, title: '', metric: ''});
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  // Mock data for sparklines
  const sparklineData = [
    { value: 40 }, { value: 42 }, { value: 45 }, { value: 44 },
    { value: 46 }, { value: 48 }, { value: 48 }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 font-sans transition-all duration-500 space-y-8 animate-slide-in">
      <DrillDownModal 
        isOpen={analytics.isOpen} 
        onClose={() => setAnalytics({...analytics, isOpen: false})} 
        title={analytics.title}
        metric={analytics.metric}
        module="hr"
        initialLevel="month"
      />

      <ExpandedChartModal
        isOpen={expandedChart === 'dept_kpi'}
        onClose={() => setExpandedChart(null)}
        title="Bo'limlar bo'yicha KPI"
      >
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DEPT_KPI} layout="vertical" margin={{left: -20}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-dark)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-muted)', fontSize: 16}} width={100} />
              <Tooltip 
                contentStyle={{backgroundColor: 'var(--color-surface-card)', border: '1px solid var(--color-border-dark)', borderRadius: '8px', fontSize: '16px'}}
                itemStyle={{color: 'var(--color-text-primary)'}}
              />
              <Bar dataKey="kpi" radius={[0, 4, 4, 0]} barSize={20}>
                {DEPT_KPI.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.kpi > 90 ? T.green : entry.kpi > 85 ? T.accent : T.violet} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ExpandedChartModal>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">HR Boshqaruvi</h2>
          <p className="text-text-muted text-base">Inson resurslari va xodimlar rivojlanishi</p>
        </div>
        <button 
          onClick={() => success("Yangi xodim qo'shish formasi ochilmoqda")}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 font-bold text-base"
        >
          <UserPlus className="w-5 h-5" />
          Yangi Xodim Qo'shish
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-4 border-b border-border-dark overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-4 text-base font-bold transition-all relative whitespace-nowrap ${activeTab === 'overview' ? 'text-brand-400' : 'text-text-muted hover:text-text-primary'}`}
        >
          Umumiy Ko'rinish
          {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('employees')}
          className={`pb-4 text-base font-bold transition-all relative whitespace-nowrap ${activeTab === 'employees' ? 'text-brand-400' : 'text-text-muted hover:text-text-primary'}`}
        >
          Xodimlar Ro'yxati
          {activeTab === 'employees' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('attendance')}
          className={`pb-4 text-base font-bold transition-all relative whitespace-nowrap ${activeTab === 'attendance' ? 'text-brand-400' : 'text-text-muted hover:text-text-primary'}`}
        >
          Davomat
          {activeTab === 'attendance' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('kpi')}
          className={`pb-4 text-base font-bold transition-all relative whitespace-nowrap ${activeTab === 'kpi' ? 'text-brand-400' : 'text-text-muted hover:text-text-primary'}`}
        >
          KPI & Samaradorlik
          {activeTab === 'kpi' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('salary')}
          className={`pb-4 text-base font-bold transition-all relative whitespace-nowrap ${activeTab === 'salary' ? 'text-brand-400' : 'text-text-muted hover:text-text-primary'}`}
        >
          Oylik Maoshlar
          {activeTab === 'salary' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></div>}
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <AIInsightCard 
            title="HR Tahlili"
            description="Xodimlar o'rtasida samaradorlik 5% ga oshdi. 'Dasturlash' bo'limida kadrlar qo'nimsizligi xavfi past."
            impact="+5% Samaradorlik"
            confidence={88}
            action="Onboarding rejasini ko'rish"
            onAction={() => info("Onboarding rejasi yuklanmoqda")}
            type="opportunity"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
             <KPICard 
              title="Jami Xodimlar" 
              value="54" 
              change="+2" 
              trend="up" 
              icon={Users} 
              data={sparklineData}
              onClick={() => setAnalytics({isOpen: true, title: 'Jami Xodimlar Tahlili', metric: 'total_employees'})}
            />
            <KPICard 
              title="O'rtacha KPI" 
              value="88.4%" 
              change="+1.2%" 
              trend="up" 
              icon={Star} 
              data={sparklineData}
              onClick={() => setAnalytics({isOpen: true, title: "O'rtacha KPI Tahlili", metric: 'avg_kpi'})}
            />
            <KPICard 
              title="Davomat" 
              value="96.2%" 
              change="+0.5%" 
              trend="up" 
              icon={Clock} 
              data={sparklineData}
              onClick={() => setAnalytics({isOpen: true, title: 'Davomat Tahlili', metric: 'attendance'})}
            />
            <KPICard 
              title="Maosh Fondi" 
              value="$68,400" 
              change="+4.2%" 
              trend="up" 
              icon={Briefcase} 
              data={sparklineData}
              onClick={() => setAnalytics({isOpen: true, title: 'Maosh Fondi Tahlili', metric: 'salary_fund'})}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <Card className="lg:col-span-2 p-6">
              <h3 className="text-lg font-bold text-text-primary mb-6">Xodimlar va KPI</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-base">
                  <thead className="text-text-muted uppercase tracking-wider border-b border-border-dark">
                    <tr>
                      <th className="pb-3">Xodim</th>
                      <th className="pb-3">Bo'lim</th>
                      <th className="pb-3">KPI</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark/50">
                    {HR_DATA.map(emp => (
                      <tr key={emp.id} className="hover:bg-surface-ground/30 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold" style={{backgroundColor: `${emp.color}22`, color: emp.color, border: `1px solid ${emp.color}44`}}>
                              {emp.name.split(" ").map(n=>n[0]).join("")}
                            </div>
                            <div>
                              <div className="font-bold text-text-primary">{emp.name}</div>
                              <div className="text-base text-text-muted">{emp.pos}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-text-secondary">{emp.dept}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-surface-ground rounded-full max-w-[60px] overflow-hidden border border-border-dark">
                              <div className="h-full rounded-full" style={{width: `${emp.kpi}%`, backgroundColor: emp.kpi > 90 ? T.green : emp.kpi > 80 ? T.accent : T.amber}} />
                            </div>
                            <span className="font-mono font-bold text-text-primary">{emp.kpi}%</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-base font-bold ${emp.status === 'Faol' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : emp.status === 'Ta\'tilda' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'}`}>
                            {emp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-6 cursor-pointer hover:border-accent transition-colors" onClick={() => setExpandedChart('dept_kpi')}>
              <h3 className="text-lg font-bold text-text-primary mb-6">Bo'limlar bo'yicha KPI</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DEPT_KPI} layout="vertical" margin={{left: -20}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-dark)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-muted)', fontSize: 16}} width={100} />
                    <Tooltip 
                      contentStyle={{backgroundColor: 'var(--color-surface-card)', border: '1px solid var(--color-border-dark)', borderRadius: '8px', fontSize: '16px'}}
                      itemStyle={{color: 'var(--color-text-primary)'}}
                    />
                    <Bar dataKey="kpi" radius={[0, 4, 4, 0]} barSize={16}>
                      {DEPT_KPI.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.kpi > 90 ? T.green : entry.kpi > 85 ? T.accent : T.violet} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {DEPT_KPI.slice(0, 3).map((d, i) => (
                  <div key={i} className="flex justify-between items-center text-base">
                    <span className="text-text-muted">{d.name}</span>
                    <span className="font-bold text-text-primary">{d.count} xodim</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'employees' && (
        <EmployeeList />
      )}

      {activeTab === 'attendance' && (
        <HRAttendance />
      )}

      {activeTab === 'kpi' && (
        <KPIIndicators />
      )}

      {activeTab === 'salary' && (
        <SalaryCalculation />
      )}
    </div>
  );
}
