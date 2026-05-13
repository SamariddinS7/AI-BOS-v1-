import React, { memo } from 'react';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface NotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Notifications = memo(({ isOpen, onClose }: NotificationsProps) => {
  if (!isOpen) return null;

  const notifications = [
    { id: 1, type: 'success', title: 'To\'lov qabul qilindi', desc: 'Mijoz #1005 dan 1,200,000 so\'m', time: '5 daqiqa oldin' },
    { id: 2, type: 'warning', title: 'Mahsulot kam qoldi', desc: 'iPhone 15 Pro Max (3 dona)', time: '1 soat oldin' },
    { id: 3, type: 'info', title: 'Yangi hisobot', desc: 'Sentyabr oyi savdo hisoboti tayyor', time: '2 soat oldin' },
  ];

  return (
    <div className="absolute top-12 right-0 w-80 glass-panel rounded-xl shadow-xl border border-border-dark z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <div className="p-4 border-b border-border-dark flex justify-between items-center bg-surface-card">
        <h3 className="font-bold text-text-primary">Bildirishnomalar</h3>
        <span className="text-base font-medium text-brand-400 bg-brand-900/30 px-2 py-1 rounded-full border border-brand-900/50">3 ta yangi</span>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notif) => (
          <div key={notif.id} className="p-4 border-b border-border-dark hover:bg-surface-dark transition-colors cursor-pointer flex gap-3">
            <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              notif.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-900/50' :
              notif.type === 'warning' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-900/50' : 'bg-blue-900/30 text-blue-400 border border-blue-900/50'
            }`}>
              {notif.type === 'success' && <CheckCircle className="w-4 h-4" />}
              {notif.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
              {notif.type === 'info' && <Info className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="text-base font-semibold text-text-primary">{notif.title}</h4>
              <p className="text-base text-text-secondary mt-1">{notif.desc}</p>
              <span className="text-base text-text-muted mt-2 block">{notif.time}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 bg-surface-card text-center border-t border-border-dark">
        <button className="text-base text-brand-400 font-medium hover:text-brand-300 transition-colors">Barchasini o'qish</button>
      </div>
    </div>
  );
});

Notifications.displayName = 'Notifications';

export default Notifications;
