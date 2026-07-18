import React, { useState, useEffect } from 'react';
import { Check, Bell, Mail, MessageSquare, Smartphone, AlertTriangle, TrendingUp, Cpu } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export default function NotificationSettings() {
  const { success, error, info } = useToast();
  const [settings, setSettings] = useState({
    email_enabled: true,
    sms_enabled: false,
    push_enabled: true,
    marketing_alerts: true,
    financial_alerts: true,
    ai_alerts: true,
    ai_alerts_critical_only: false,
    system_alerts: true
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetch('/api/settings/notifications')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      });
  }, []);

  const handleSave = async () => {
    try {
      await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      setSuccessMessage("Bildirishnomalar saqlandi!");
      success("Bildirishnoma sozlamalari muvaffaqiyatli saqlandi!");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      error("Xatolik yuz berdi");
    }
  };

  const toggleSetting = (key: keyof typeof settings) => {
    const newValue = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newValue }));
    info(`${key.replace('_', ' ')} holati o'zgartirildi: ${newValue ? 'Yoqildi' : "O'chirildi"}`);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Bildirishnomalar</h3>
        <button 
          onClick={handleSave}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-blue-500/30"
        >
          {successMessage ? <Check className="w-4 h-4" /> : null}
          Saqlash
        </button>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-500/10 text-green-700 text-green-400 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-green-200 dark:border-green-800">
          <Check className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      <div className="space-y-8">
        {/* Delivery Channels */}
        <div>
          <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">Yetkazib berish kanallari</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${settings.email_enabled ? 'border-blue-600 bg-brand-500/10' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-800'}`} onClick={() => toggleSetting('email_enabled')}>
              <div className="flex justify-between items-center mb-2">
                <Mail className={`w-6 h-6 ${settings.email_enabled ? 'text-brand-500' : 'text-gray-400'}`} />
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${settings.email_enabled ? 'border-blue-600 bg-blue-600' : 'border-gray-300 dark:border-gray-600'}`}>
                  {settings.email_enabled && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
              <h5 className={`font-medium ${settings.email_enabled ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'}`}>Email</h5>
              <p className={`text-base mt-1 ${settings.email_enabled ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>Asosiy xabarlar</p>
            </div>

            <div className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${settings.sms_enabled ? 'border-blue-600 bg-brand-500/10' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-800'}`} onClick={() => toggleSetting('sms_enabled')}>
              <div className="flex justify-between items-center mb-2">
                <MessageSquare className={`w-6 h-6 ${settings.sms_enabled ? 'text-brand-500' : 'text-gray-400'}`} />
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${settings.sms_enabled ? 'border-blue-600 bg-blue-600' : 'border-gray-300 dark:border-gray-600'}`}>
                  {settings.sms_enabled && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
              <h5 className={`font-medium ${settings.sms_enabled ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'}`}>SMS</h5>
              <p className={`text-base mt-1 ${settings.sms_enabled ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>Muhim ogohlantirishlar</p>
            </div>

            <div className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${settings.push_enabled ? 'border-blue-600 bg-brand-500/10' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-800'}`} onClick={() => toggleSetting('push_enabled')}>
              <div className="flex justify-between items-center mb-2">
                <Smartphone className={`w-6 h-6 ${settings.push_enabled ? 'text-brand-500' : 'text-gray-400'}`} />
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${settings.push_enabled ? 'border-blue-600 bg-blue-600' : 'border-gray-300 dark:border-gray-600'}`}>
                  {settings.push_enabled && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
              <h5 className={`font-medium ${settings.push_enabled ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'}`}>Push</h5>
              <p className={`text-base mt-1 ${settings.push_enabled ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>Ilova ichidagi bildirishnomalar</p>
            </div>
          </div>
        </div>

        {/* Alert Types */}
        <div>
          <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">Xabar turlari</h4>
          <div className="space-y-4">
            {[
              { id: 'financial_alerts', label: 'Moliyaviy ogohlantirishlar', desc: 'Katta xarajatlar, byudjetdan oshish', icon: TrendingUp, color: 'text-green-500' },
              { id: 'ai_alerts', label: 'AI xavf ogohlantirishlari', desc: 'Anomaliyalar, xatarlar tahlili', icon: Cpu, color: 'text-purple-500' },
              { id: 'ai_alerts_critical_only', label: 'Faqat tanqidiy AI ogohlantirishlari', desc: 'Faqat eng muhim xatarlar haqida xabar berish', icon: AlertTriangle, color: 'text-red-500' },
              { id: 'marketing_alerts', label: 'Marketing natijalari', desc: 'Kampaniya tugashi, KPI bajarilishi', icon: Bell, color: 'text-blue-500' },
              { id: 'system_alerts', label: 'Tizim xabarlari', desc: 'Yangilanishlar, xavfsizlik ogohlantirishlari', icon: AlertTriangle, color: 'text-yellow-500' }
            ].map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-gray-50 dark:bg-gray-900 rounded-lg ${alert.color}`}>
                    <alert.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">{alert.label}</h4>
                    <p className="text-base text-gray-500 dark:text-gray-400">{alert.desc}</p>
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only"
                      checked={settings[alert.id as keyof typeof settings] as boolean}
                      onChange={() => toggleSetting(alert.id as keyof typeof settings)}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${settings[alert.id as keyof typeof settings] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings[alert.id as keyof typeof settings] ? 'translate-x-4' : ''}`}></div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
