import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Globe, LogOut, Clock, ShieldCheck } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface Session {
  id: number;
  device: string;
  ip_address: string;
  login_time: string;
  last_activity: string;
  status: string;
}

export default function SessionManagement() {
  const { success, error } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/settings/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const revokeSession = async (id: number) => {
    try {
      await fetch(`/api/settings/sessions/${id}`, { method: 'DELETE' });
      success("Sessiya muvaffaqiyatli to'xtatildi");
      fetchSessions();
    } catch (err) {
      console.error('Failed to revoke session:', err);
      error("Sessiyani to'xtatishda xatolik yuz berdi");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Sessiyalarni boshqarish</h3>
      </div>

      <div className="space-y-6">
        <div className="bg-brand-500/10 p-4 rounded-xl border border-blue-200 dark:border-blue-800 flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-brand-500 dark:text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-base font-medium text-blue-900 dark:text-blue-100 mb-1">Xavfsizlik eslatmasi</h4>
            <p className="text-base text-blue-700 dark:text-blue-300">
              Agar siz tanimagan qurilmani ko'rsangiz, darhol sessiyani to'xtating va parolingizni o'zgartiring.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {sessions.map((session, index) => (
            <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
              <div className="flex items-start gap-4 mb-4 sm:mb-0">
                <div className={`p-3 rounded-lg ${index === 0 ? 'bg-green-500/10 text-green-500 text-green-400' : 'bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400'}`}>
                  {session.device.toLowerCase().includes('mac') || session.device.toLowerCase().includes('windows') ? (
                    <Monitor className="w-6 h-6" />
                  ) : (
                    <Smartphone className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">{session.device}</h4>
                    {index === 0 && (
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 text-green-400 text-base font-bold uppercase tracking-wider rounded-full">
                        Joriy sessiya
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-base text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {session.ip_address}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Oxirgi faollik: {new Date(session.last_activity).toLocaleString('uz-UZ')}</span>
                  </div>
                </div>
              </div>
              
              {index !== 0 && (
                <button 
                  onClick={() => revokeSession(session.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-base font-medium text-red-500 text-red-400 bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sessiyani to'xtatish
                </button>
              )}
            </div>
          ))}
          
          {sessions.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Sessiyalar topilmadi.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
