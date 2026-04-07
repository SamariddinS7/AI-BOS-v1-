import React, { useState, useEffect } from 'react';
import { Check, Link as LinkIcon, Webhook, Key, AlertCircle, Eye, EyeOff, Save } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export default function IntegrationSettings() {
  const { success, error } = useToast();
  const [settings, setSettings] = useState({
    n8n_url: '',
    n8n_api_key: '',
    webhook_secret: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/settings/integrations')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSettings(data);
        }
      });
  }, []);

  const handleSave = async () => {
    try {
      await fetch('/api/settings/integrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      setSuccessMessage("Integratsiyalar saqlandi!");
      success("Integratsiya sozlamalari muvaffaqiyatli saqlandi!");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      error("Xatolik yuz berdi");
    }
  };

  const toggleKeyVisibility = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Integratsiyalar va API</h3>
        <button 
          onClick={handleSave}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-blue-500/30"
        >
          {successMessage ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
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
        {/* n8n Integration */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
              <Webhook className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">n8n Avtomatlashtirish</h4>
              <p className="text-base text-gray-500 dark:text-gray-400">Ish oqimlarini avtomatlashtirish uchun n8n ulanishi</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">n8n Webhook URL</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <LinkIcon className="w-5 h-5" />
                </span>
                <input 
                  type="url" 
                  name="n8n_url"
                  value={settings.n8n_url || ''}
                  onChange={handleChange}
                  placeholder="https://n8n.yourdomain.com/webhook/..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100 font-mono text-base"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">n8n API Kaliti</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-gray-400">
                  <Key className="w-5 h-5" />
                </span>
                <input 
                  type={showKeys['n8n'] ? 'text' : 'password'} 
                  name="n8n_api_key"
                  value={settings.n8n_api_key || ''}
                  onChange={handleChange}
                  placeholder="API kalitni kiriting"
                  className="w-full pl-10 pr-12 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100 font-mono text-base"
                />
                <button 
                  type="button"
                  onClick={() => toggleKeyVisibility('n8n')}
                  className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showKeys['n8n'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Plugin Permissions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-brand-500/10 rounded-lg text-brand-500 dark:text-blue-400">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Plagin Ruxsatlari</h4>
              <p className="text-base text-gray-500 dark:text-gray-400">Uchinchi tomon plaginlari uchun ruxsatlarni boshqarish</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" defaultChecked />
                <div className="block w-10 h-6 rounded-full bg-blue-600"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform translate-x-4"></div>
              </div>
              <div>
                <span className="block text-base font-medium text-gray-900 dark:text-gray-100">Ma'lumotlarni o'qish (Read Access)</span>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" />
                <div className="block w-10 h-6 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform"></div>
              </div>
              <div>
                <span className="block text-base font-medium text-gray-900 dark:text-gray-100">Ma'lumotlarni yozish (Write Access)</span>
              </div>
            </label>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-600 dark:text-yellow-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Webhook Xavfsizligi</h4>
              <p className="text-base text-gray-500 dark:text-gray-400">Kiruvchi so'rovlarni tasdiqlash uchun maxfiy so'z</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Webhook Secret</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-gray-400">
                  <Key className="w-5 h-5" />
                </span>
                <input 
                  type={showKeys['webhook'] ? 'text' : 'password'} 
                  name="webhook_secret"
                  value={settings.webhook_secret || ''}
                  onChange={handleChange}
                  placeholder="Maxfiy so'zni kiriting"
                  className="w-full pl-10 pr-12 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100 font-mono text-base"
                />
                <button 
                  type="button"
                  onClick={() => toggleKeyVisibility('webhook')}
                  className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showKeys['webhook'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
