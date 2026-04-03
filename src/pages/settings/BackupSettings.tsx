import React, { useState } from 'react';
import { Save, Check, Database, Cloud, Clock, Download, RotateCcw, AlertTriangle, HardDrive } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export default function BackupSettings() {
  const { success, loading } = useToast();
  const [settings, setSettings] = useState({
    autoBackup: true,
    frequency: 'daily',
    retention: '30',
    storageLocation: 'local',
    encryptBackups: true
  });
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const backups = [
    { id: 1, name: 'backup_2023-10-25_0300.sql.gz', size: '45 MB', date: '2023-10-25 03:00', type: 'Auto' },
    { id: 2, name: 'backup_2023-10-24_0300.sql.gz', size: '44 MB', date: '2023-10-24 03:00', type: 'Auto' },
    { id: 3, name: 'manual_backup_v2.sql.gz', size: '44 MB', date: '2023-10-23 15:30', type: 'Manual' },
  ];

  const handleSave = () => {
    setSuccessMessage("Backup sozlamalari saqlandi!");
    success("Backup sozlamalari muvaffaqiyatli saqlandi!");
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleBackupNow = () => {
    setIsBackingUp(true);
    const toastId = loading("Arxivlash jarayoni boshlandi...");
    setTimeout(() => {
      setIsBackingUp(false);
      success("Backup muvaffaqiyatli yakunlandi!", { id: toastId });
    }, 2000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Ma'lumotlar Bazasi Arxivi</h3>
          <p className="text-base text-gray-500 dark:text-gray-400">Tizim ma'lumotlarini xavfsiz saqlash va qayta tiklash</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleBackupNow}
            disabled={isBackingUp}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
          >
            {isBackingUp ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            Hozir Arxivlash
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-blue-500/30"
          >
            {successMessage ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            Saqlash
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2 border border-green-200 dark:border-green-800">
          <Check className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Avtomatik Arxivlash</h4>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <span className="block text-base font-medium text-gray-900 dark:text-gray-100">Avtomatik arxivlashni yoqish</span>
                  <span className="text-base text-gray-500 dark:text-gray-400">Belgilangan vaqtda tizim o'zi nusxa oladi</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.autoBackup}
                    onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Davriylik</label>
                  <select 
                    value={settings.frequency}
                    onChange={(e) => setSettings({...settings, frequency: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100 text-base"
                  >
                    <option value="daily">Har kuni (03:00)</option>
                    <option value="weekly">Har hafta (Yakshanba)</option>
                    <option value="monthly">Har oy (1-sana)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Saqlash muddati (kun)</label>
                  <input 
                    type="number" 
                    value={settings.retention}
                    onChange={(e) => setSettings({...settings, retention: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100 text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                <Cloud className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Saqlash Joyi</h4>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <input 
                  type="radio" 
                  name="storage" 
                  value="local"
                  checked={settings.storageLocation === 'local'}
                  onChange={(e) => setSettings({...settings, storageLocation: e.target.value})}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <HardDrive className="w-5 h-5 text-gray-500" />
                <span className="text-base font-medium text-gray-900 dark:text-gray-100">Lokal Server (Disk)</span>
              </label>
              
              <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <input 
                  type="radio" 
                  name="storage" 
                  value="s3"
                  checked={settings.storageLocation === 's3'}
                  onChange={(e) => setSettings({...settings, storageLocation: e.target.value})}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <Cloud className="w-5 h-5 text-gray-500" />
                <span className="text-base font-medium text-gray-900 dark:text-gray-100">AWS S3 / Cloud Storage</span>
              </label>
            </div>
          </div>
        </div>

        {/* Recent Backups Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-full">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">So'nggi Arxivlar</h4>
            <div className="space-y-3">
              {backups.map((backup) => (
                <div key={backup.id} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 group hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-500" />
                      <span className="text-base font-semibold text-gray-700 dark:text-gray-300">{backup.type}</span>
                    </div>
                    <span className="text-base text-gray-500">{backup.size}</span>
                  </div>
                  <p className="text-base font-mono text-gray-600 dark:text-gray-400 mb-3 break-all">{backup.name}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-base text-gray-400">{backup.date}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" title="Yuklab olish">
                        <Download className="w-3 h-3" />
                      </button>
                      <button className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded" title="Qayta tiklash">
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-base text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
              Barcha arxivlarni ko'rish
            </button>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-base font-bold text-yellow-800 dark:text-yellow-400 mb-1">Eslatma</h5>
              <p className="text-base text-yellow-700 dark:text-yellow-500/80 leading-relaxed">
                Qayta tiklash jarayoni joriy ma'lumotlarni o'chirib yuboradi. Tiklashdan oldin joriy holatni arxivlash tavsiya etiladi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
