import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { Check } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import AccessibilitySettings from './AccessibilitySettings';
import LanguageSettings from './LanguageSettings';

export default function GeneralSettings() {
  const { settings, updateSettings } = useSettings();
  const [successMessage, setSuccessMessage] = useState('');
  const { success, info } = useToast();

  const handleSave = async () => {
    setSuccessMessage("Sozlamalar saqlandi!");
    success("Umumiy sozlamalar muvaffaqiyatli saqlandi!");
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Umumiy Sozlamalar</h3>
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
        {/* Theme */}
        <div>
          <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">Mavzu (Theme)</h4>
          <div className="flex gap-4">
            {['light', 'dark', 'system'].map(theme => (
              <label key={theme} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="theme" 
                  value={theme}
                  checked={settings.theme === theme}
                  onChange={() => {
                    updateSettings({ theme: theme as any });
                    info(`Mavzu o'zgartirildi: ${theme}`);
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-base text-gray-700 dark:text-gray-300 capitalize">{theme}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Layout Density */}
        <div>
          <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">Interfeys Zichligi</h4>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only"
                checked={settings.compact_mode}
                onChange={(e) => {
                  updateSettings({ compact_mode: e.target.checked });
                  info(e.target.checked ? "Kompakt rejim yoqildi" : "Kompakt rejim o'chirildi");
                }}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${settings.compact_mode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.compact_mode ? 'translate-x-4' : ''}`}></div>
            </div>
            <span className="text-base text-gray-700 dark:text-gray-300">Kompakt rejim (Kichikroq paddinglar)</span>
          </label>
        </div>

        {/* Animations */}
        <div>
          <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">Animatsiyalar</h4>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only"
                checked={settings.animations_enabled}
                onChange={(e) => {
                  updateSettings({ animations_enabled: e.target.checked });
                  info(e.target.checked ? "Animatsiyalar yoqildi" : "Animatsiyalar o'chirildi");
                }}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${settings.animations_enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.animations_enabled ? 'translate-x-4' : ''}`}></div>
            </div>
            <span className="text-base text-gray-700 dark:text-gray-300">Tizim animatsiyalarini yoqish</span>
          </label>
        </div>

        {/* Auto-save */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Avtomatik saqlash</h4>
              <p className="text-base text-gray-500 dark:text-gray-400">O'zgarishlarni avtomatik tarzda saqlash</p>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                defaultChecked
                onChange={(e) => info(e.target.checked ? "Avtomatik saqlash yoqildi" : "Avtomatik saqlash o'chirildi")}
              />
              <div className="block w-10 h-6 rounded-full bg-blue-600 transition-colors"></div>
              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform translate-x-4"></div>
            </div>
            <div>
              <span className="block text-base font-medium text-gray-900 dark:text-gray-100">Faol</span>
            </div>
          </label>
        </div>

        {/* Asosiy Rang */}
        <div>
          <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">Asosiy Rang</h4>
          <div className="flex gap-3">
            {['teal', 'blue', 'indigo', 'purple', 'rose'].map(color => (
              <button
                key={color}
                onClick={() => {
                  updateSettings({ primary_color: color });
                  info(`Asosiy rang o'zgartirildi: ${color}`);
                }}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${settings.primary_color === color ? 'scale-110 border-gray-900 dark:border-white' : 'border-transparent hover:scale-105'}`}
                style={{ 
                  backgroundColor: 
                    color === 'teal' ? '#0d9488' : 
                    color === 'blue' ? '#2563eb' : 
                    color === 'indigo' ? '#4f46e5' : 
                    color === 'purple' ? '#9333ea' : '#e11d48' 
                }}
              />
            ))}
          </div>
        </div>
        
        <hr className="border-gray-200 dark:border-gray-700" />
        <AccessibilitySettings />
        <hr className="border-gray-200 dark:border-gray-700" />
        <LanguageSettings />

      </div>
    </div>
  );
}
