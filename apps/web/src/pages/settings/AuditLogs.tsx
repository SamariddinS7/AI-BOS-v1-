import React, { useState, useEffect } from 'react';
import { Activity, Search, Filter, Download } from 'lucide-react';

interface LogEntry {
  id: number;
  action: string;
  module: string;
  ip_address: string;
  timestamp: string;
  status: 'success' | 'failed' | 'warning';
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    fetch('/api/settings/audit')
      .then(res => res.json())
      .then(data => setLogs(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Audit va Faollik Jurnali</h3>
        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-base font-medium">
          <Download className="w-4 h-4" />
          Eksport
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Jurnal bo'yicha qidirish..." 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100"
            />
          </div>
          <button className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-base font-medium">
            <Filter className="w-4 h-4" />
            Filtr
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-base">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3 font-medium">Harakat</th>
                <th className="px-6 py-3 font-medium">Modul</th>
                <th className="px-6 py-3 font-medium">IP Manzil</th>
                <th className="px-6 py-3 font-medium">Vaqt</th>
                <th className="px-6 py-3 font-medium">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">{log.action}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{log.module}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-base">{log.ip_address}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString('uz-UZ')}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium ${
                      log.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 text-green-400' :
                      log.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 text-red-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {log.status === 'success' ? 'Muvaffaqiyatli' : log.status === 'failed' ? 'Xatolik' : 'Ogohlantirish'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
