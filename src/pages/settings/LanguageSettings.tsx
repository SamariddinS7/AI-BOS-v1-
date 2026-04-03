import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { Check, Globe } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export default function LanguageSettings() {
  const { settings, updateSettings } = useSettings();
  const [successMessage, setSuccessMessage] = useState('');
  const { success } = useToast();

  const handleSave = async () => {
    setSuccessMessage("Sozlamalar saqlandi!");
    success("Til va hudud sozlamalari muvaffaqiyatli saqlandi!");
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Til va Hudud</h3>
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
        {/* Language */}
        <div>
          <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">Tizim Tili</h4>
          <select 
            value={settings.language}
            onChange={(e) => updateSettings({ language: e.target.value })}
            className="w-full md:w-1/2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100"
          >
            <option value="uz">O'zbekcha</option>
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Timezone */}
        <div>
          <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">Vaqt Mintaqasi (Timezone)</h4>
          <select 
            value={settings.timezone}
            onChange={(e) => updateSettings({ timezone: e.target.value })}
            className="w-full md:w-1/2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100"
          >
            <option value="Asia/Tashkent">Asia/Tashkent (GMT+5)</option>
            <option value="Europe/Moscow">Europe/Moscow (GMT+3)</option>
            <option value="Europe/London">Europe/London (GMT+0)</option>
            <option value="America/New_York">America/New_York (GMT-5)</option>
          </select>
        </div>

        {/* Date Format */}
        <div>
          <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">Sana Formati</h4>
          <select 
            value={settings.date_format}
            onChange={(e) => updateSettings({ date_format: e.target.value })}
            className="w-full md:w-1/2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100"
          >
            <option value="DD.MM.YYYY">31.12.2026 (DD.MM.YYYY)</option>
            <option value="MM/DD/YYYY">12/31/2026 (MM/DD/YYYY)</option>
            <option value="YYYY-MM-DD">2026-12-31 (YYYY-MM-DD)</option>
          </select>
        </div>

        {/* Number Format */}
        <div>
          <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">Raqam Formati</h4>
          <select 
            value={settings.number_format}
            onChange={(e) => updateSettings({ number_format: e.target.value })}
            className="w-full md:w-1/2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100"
          >
            <option value="space">1 000 000,00 (Bo'sh joy)</option>
            <option value="comma">1,000,000.00 (Vergul)</option>
            <option value="dot">1.000.000,00 (Nuqta)</option>
          </select>
        </div>

        {/* Currency Format */}
        <div>
          <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">Valyuta Formati</h4>
          <select 
            value={settings.currency_format}
            onChange={(e) => updateSettings({ currency_format: e.target.value })}
            className="w-full md:w-1/2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100"
          >
            <option value="UZS">UZS (So'm)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="RUB">RUB (₽)</option>
          </select>
        </div>

      </div>
    </div>
  );
}
