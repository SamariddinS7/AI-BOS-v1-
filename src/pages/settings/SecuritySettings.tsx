import React, { useState, useEffect } from 'react';
import { Check, Shield, Key, Smartphone, AlertTriangle } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export default function SecuritySettings() {
  const { success, error, info } = useToast();
  const [settings, setSettings] = useState({
    two_factor_enabled: false,
    biometric_enabled: false,
    session_timeout_minutes: 30,
    login_alert_enabled: true,
    allowed_ips: [] as string[]
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [newIp, setNewIp] = useState('');

  useEffect(() => {
    fetch('/api/settings/security')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setSettings({
            two_factor_enabled: Boolean(data.two_factor_enabled),
            biometric_enabled: Boolean(data.biometric_enabled),
            session_timeout_minutes: data.session_timeout_minutes || 30,
            login_alert_enabled: Boolean(data.login_alert_enabled),
            allowed_ips: Array.isArray(data.allowed_ips) ? data.allowed_ips : []
          });
        }
      })
      .catch(err => console.error('Failed to fetch security settings:', err));
  }, []);

  const handleSave = async () => {
    try {
      await fetch('/api/settings/security', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      setSuccessMessage("Xavfsizlik sozlamalari saqlandi!");
      success("Xavfsizlik sozlamalari muvaffaqiyatli saqlandi!");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      error("Xatolik yuz berdi");
    }
  };

  const addIp = () => {
    if (newIp && !settings.allowed_ips.includes(newIp)) {
      setSettings(prev => ({ ...prev, allowed_ips: [...prev.allowed_ips, newIp] }));
      setNewIp('');
      success(`IP manzil qo'shildi: ${newIp}`);
    }
  };

  const removeIp = (ip: string) => {
    setSettings(prev => ({ ...prev, allowed_ips: prev.allowed_ips.filter(i => i !== ip) }));
    info(`IP manzil o'chirildi: ${ip}`);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Xavfsizlik va Autentifikatsiya</h3>
        <button 
          onClick={handleSave}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-blue-500/30"
        >
          {successMessage ? <Check className="w-4 h-4" /> : null}
          Saqlash
        </button>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-green-200 dark:border-green-800">
          <Check className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      <div className="space-y-8">
        {/* 2FA */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">Ikki bosqichli autentifikatsiya (2FA)</h4>
              <p className="text-base text-gray-500 dark:text-gray-400">Hisobingizni qo'shimcha himoya qatlami bilan himoyalang</p>
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only"
                checked={settings.two_factor_enabled}
                onChange={(e) => setSettings(prev => ({ ...prev, two_factor_enabled: e.target.checked }))}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${settings.two_factor_enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.two_factor_enabled ? 'translate-x-4' : ''}`}></div>
            </div>
          </label>
        </div>

        {/* Biometrics */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">Biometrik kirish</h4>
              <p className="text-base text-gray-500 dark:text-gray-400">Barmoq izi yoki Face ID orqali kirish (mobil ilova uchun)</p>
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only"
                checked={settings.biometric_enabled}
                onChange={(e) => setSettings(prev => ({ ...prev, biometric_enabled: e.target.checked }))}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${settings.biometric_enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.biometric_enabled ? 'translate-x-4' : ''}`}></div>
            </div>
          </label>
        </div>

        {/* Session Timeout */}
        <div>
          <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">Sessiya muddati (daqiqa)</h4>
          <input 
            type="number" 
            value={settings.session_timeout_minutes}
            onChange={(e) => setSettings(prev => ({ ...prev, session_timeout_minutes: parseInt(e.target.value) || 30 }))}
            className="w-full md:w-1/3 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-base text-gray-900 dark:text-gray-100"
          />
          <p className="text-base text-gray-500 dark:text-gray-400 mt-2">Belgilangan vaqt davomida harakat bo'lmasa, tizimdan avtomatik chiqish</p>
        </div>

        {/* IP Allowlist */}
        <div>
          <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">Ruxsat etilgan IP manzillar (IP Allowlist)</h4>
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              placeholder="Masalan: 192.168.1.100"
              className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-base text-gray-900 dark:text-gray-100"
            />
            <button 
              onClick={addIp}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Qo'shish
            </button>
          </div>
          <div className="space-y-2">
            {settings.allowed_ips.map(ip => (
              <div key={ip} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-base text-gray-700 dark:text-gray-300 font-mono">{ip}</span>
                <button 
                  onClick={() => removeIp(ip)}
                  className="text-red-500 hover:text-red-700 text-base font-medium"
                >
                  O'chirish
                </button>
              </div>
            ))}
            {settings.allowed_ips.length === 0 && (
              <p className="text-base text-gray-500 dark:text-gray-400 italic">Barcha IP manzillarga ruxsat berilgan</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
