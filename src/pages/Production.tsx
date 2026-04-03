import React, { useState } from 'react';
import { Factory, Settings, AlertTriangle, CheckCircle, Clock, BarChart3, TrendingUp, Zap } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import KPICard from '../components/dashboard/KPICard';
import Card from '../components/ui/Card';
import AIInsightCard from '../components/dashboard/AIInsightCard';
import DrillDownModal from '../components/analytics/DrillDownModal';

export default function Production() {
  const { info } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<{isOpen: boolean, title: string, metric: string}>({isOpen: false, title: '', metric: ''});

  // Mock data for sparklines
  const sparklineData = [
    { value: 85 }, { value: 88 }, { value: 92 }, { value: 90 },
    { value: 95 }, { value: 94 }, { value: 98 }
  ];

  const productionLines = [
    { id: 1, name: 'Line A', status: 'Running', efficiency: 98, product: 'Widget X', target: 1000, actual: 950 },
    { id: 2, name: 'Line B', status: 'Maintenance', efficiency: 0, product: 'Widget Y', target: 800, actual: 0 },
    { id: 3, name: 'Line C', status: 'Running', efficiency: 92, product: 'Widget Z', target: 1200, actual: 1100 },
    { id: 4, name: 'Line D', status: 'Warning', efficiency: 75, product: 'Widget X', target: 1000, actual: 700 },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 font-sans transition-all duration-500 space-y-8 animate-slide-in">
      <DrillDownModal 
        isOpen={analytics.isOpen} 
        onClose={() => setAnalytics({...analytics, isOpen: false})} 
        title={analytics.title}
        metric={analytics.metric}
        module="production"
        initialLevel="month"
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Ishlab Chiqarish</h2>
          <p className="text-text-muted text-base">Real vaqt rejimida ishlab chiqarish ko'rsatkichlari</p>
        </div>
        <div className="flex items-center gap-2 bg-surface-card p-1 rounded-xl border border-border-dark">
          <button 
            onClick={() => {
              setActiveTab('overview');
            }}
            className={`px-4 py-2 rounded-lg text-base font-bold transition-all ${activeTab === 'overview' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-text-muted hover:text-text-primary'}`}
          >
            Umumiy
          </button>
          <button 
            onClick={() => {
              setActiveTab('lines');
            }}
            className={`px-4 py-2 rounded-lg text-base font-bold transition-all ${activeTab === 'lines' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-text-muted hover:text-text-primary'}`}
          >
            Liniyalar
          </button>
        </div>
      </div>

      <AIInsightCard 
        title="Ishlab Chiqarish Samaradorligi"
        description="'Line D' da samaradorlik 15% ga pasaydi. Sababi: Xomashyo yetkazib berishdagi kechikishlar va uskunadagi kichik nosozliklar."
        impact="Samaradorlik -15.00%"
        confidence={92}
        action="Texnik xizmat ko'rsatish"
        onAction={() => info("Texnik xizmat ko'rsatish jarayoni boshlandi")}
        type="warning"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="OEE (Samaradorlik)" 
          value="87.00%" 
          change="+2.50%" 
          trend="up" 
          icon={Zap} 
          data={sparklineData}
          onClick={() => setAnalytics({isOpen: true, title: 'OEE Tahlili', metric: 'oee'})}
        />
        <KPICard 
          title="Ishlab Chiqarish Hajmi" 
          value="12,450" 
          change="+5.00%" 
          trend="up" 
          icon={Factory} 
          data={sparklineData}
          onClick={() => setAnalytics({isOpen: true, title: 'Ishlab Chiqarish Hajmi Tahlili', metric: 'production_volume'})}
        />
        <KPICard 
          title="Yaroqsiz Mahsulot" 
          value="1.20%" 
          change="-0.50%" 
          trend="down" 
          icon={AlertTriangle} 
          data={sparklineData}
          onClick={() => setAnalytics({isOpen: true, title: 'Yaroqsiz Mahsulot Tahlili', metric: 'defect_rate'})}
        />
        <KPICard 
          title="To'xtalishlar" 
          value="45 daq" 
          change="+10 daq" 
          trend="up" 
          icon={Clock} 
          data={sparklineData}
          onClick={() => setAnalytics({isOpen: true, title: "To'xtalishlar Tahlili", metric: 'downtime'})}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Lines Status */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
            <Factory className="w-5 h-5 text-brand-500" />
            Liniyalar Holati
          </h3>
          <div className="space-y-4">
            {productionLines.map((line) => (
              <div 
                key={line.id} 
                onClick={() => info(`${line.name} tafsilotlari`)}
                className="p-4 bg-surface-dark rounded-xl border border-border-dark hover:border-brand-500/30 transition-colors group cursor-pointer"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      line.status === 'Running' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 
                      line.status === 'Warning' ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 
                      'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                    }`}></div>
                    <h4 className="font-bold text-text-primary group-hover:text-brand-400 transition-colors text-base">{line.name}</h4>
                  </div>
                  <span className={`px-2.5 py-1 text-base font-black uppercase tracking-wider rounded-full border ${
                    line.status === 'Running' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900/50' : 
                    line.status === 'Warning' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-900/50' : 
                    'bg-rose-900/30 text-rose-400 border-rose-900/50'
                  }`}>
                    {line.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-base mb-3">
                  <div>
                    <p className="text-text-muted text-base">Mahsulot</p>
                    <p className="font-bold text-text-primary">{line.product}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-base">Reja / Haqiqiy</p>
                    <p className="font-bold text-text-primary">{line.target} / <span className={line.actual >= line.target ? 'text-emerald-400' : 'text-yellow-400'}>{line.actual}</span></p>
                  </div>
                  <div>
                    <p className="text-text-muted text-base">Samaradorlik</p>
                    <p className={`font-bold ${line.efficiency >= 90 ? 'text-emerald-400' : line.efficiency >= 70 ? 'text-yellow-400' : 'text-rose-400'}`}>{line.efficiency.toFixed(2)}%</p>
                  </div>
                </div>
                <div className="w-full bg-surface-card rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      line.status === 'Running' ? 'bg-emerald-500' : 
                      line.status === 'Warning' ? 'bg-yellow-500' : 
                      'bg-rose-500'
                    }`} 
                    style={{ width: `${line.efficiency}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Alerts & Maintenance */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-500" />
            Texnik Xizmat & Ogohlantirishlar
          </h3>
          <div className="space-y-4">
            {[
              { id: 1, type: 'maintenance', message: 'Line B da rejali texnik xizmat', time: '2 soat oldin', status: 'Jarayonda' },
              { id: 2, type: 'alert', message: 'Line D da harorat yuqori', time: '15 daqiqa oldin', status: 'Ogohlantirish' },
              { id: 3, type: 'check', message: 'Sifat nazorati tekshiruvi yakunlandi', time: '4 soat oldin', status: 'Bajarildi' },
            ].map((item) => (
              <div 
                key={item.id} 
                onClick={() => info(`${item.message} holati: ${item.status}`)}
                className="flex items-start gap-4 p-4 bg-surface-dark rounded-xl border border-border-dark hover:border-brand-500/30 transition-colors group cursor-pointer"
              >
                <div className={`p-2 rounded-lg ${
                  item.type === 'maintenance' ? 'bg-blue-500/20 text-blue-400' :
                  item.type === 'alert' ? 'bg-rose-500/20 text-rose-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {item.type === 'maintenance' ? <Settings className="w-5 h-5" /> :
                   item.type === 'alert' ? <AlertTriangle className="w-5 h-5" /> :
                   <CheckCircle className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-text-primary text-base mb-1">{item.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-base text-text-muted flex items-center gap-1">
                      <Clock className="w-5 h-5" />
                      {item.time}
                    </span>
                    <span className={`text-base font-black uppercase tracking-wider ${
                      item.status === 'Jarayonda' ? 'text-blue-400' :
                      item.status === 'Ogohlantirish' ? 'text-rose-400' :
                      'text-emerald-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
