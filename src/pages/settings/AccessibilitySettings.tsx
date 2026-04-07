import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { Check, Type } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export default function AccessibilitySettings() {
  const { settings, updateSettings } = useSettings();
  const [successMessage, setSuccessMessage] = useState('');
  const [customSize, setCustomSize] = useState(16);
  const { success, info } = useToast();

  useEffect(() => {
    if (settings.font_size.endsWith('px')) {
      setCustomSize(parseInt(settings.font_size));
    } else {
      setCustomSize(
        settings.font_size === 'small' ? 14 :
        settings.font_size === 'medium' ? 16 :
        settings.font_size === 'large' ? 18 : 20
      );
    }
  }, [settings.font_size]);

  const handleSave = async () => {
    setSuccessMessage("Sozlamalar saqlandi!");
    success("Maxsus imkoniyatlar sozlamalari muvaffaqiyatli saqlandi!");
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setCustomSize(val);
    updateSettings({ font_size: `${val}px` });
    info(`Shrift o'lchami o'zgartirildi: ${val}px`);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Maxsus Imkoniyatlar</h3>
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
        {/* Font Size Control */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Type className="w-6 h-6 text-brand-500" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Shrift O'lchami</h4>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { id: 'small', label: 'Kichik', size: '16px' },
              { id: 'medium', label: 'O\'rtacha', size: '18px' },
              { id: 'large', label: 'Katta', size: '20px' },
              { id: 'extra_large', label: 'Juda Katta', size: '22px' }
            ].map(option => (
              <button
                key={option.id}
                onClick={() => updateSettings({ font_size: option.id })}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                  settings.font_size === option.id || (settings.font_size === option.size && !['small','medium','large','extra_large'].includes(settings.font_size))
                    ? 'border-blue-600 bg-brand-500/10 text-blue-700 dark:text-blue-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span style={{ fontSize: option.size }}>Aa</span>
                <span className="text-base">{option.label}</span>
              </button>
            ))}
          </div>

          <div>
            <div className="flex justify-between text-base text-gray-500 dark:text-gray-400 mb-2">
              <span>Maxsus o'lcham (16px)</span>
              <span>{customSize}px</span>
              <span>(24px)</span>
            </div>
            <input 
              type="range" 
              min="16" 
              max="24" 
              step="1"
              value={customSize}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
            />
          </div>
        </div>

        {/* Other Accessibility Options */}
        <div className="space-y-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={settings.high_contrast}
                onChange={(e) => updateSettings({ high_contrast: e.target.checked })}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${settings.high_contrast ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.high_contrast ? 'translate-x-4' : ''}`}></div>
            </div>
            <div>
              <span className="block text-base font-medium text-gray-900 dark:text-gray-100">Yuqori Kontrast (High Contrast)</span>
              <span className="text-base text-gray-500 dark:text-gray-400">Ranglar farqini oshirish</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={settings.large_cursor}
                onChange={(e) => updateSettings({ large_cursor: e.target.checked })}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${settings.large_cursor ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.large_cursor ? 'translate-x-4' : ''}`}></div>
            </div>
            <div>
              <span className="block text-base font-medium text-gray-900 dark:text-gray-100">Katta Kursor (Large Cursor)</span>
              <span className="text-base text-gray-500 dark:text-gray-400">Sichqoncha kursorini kattalashtirish</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={settings.focus_highlight}
                onChange={(e) => updateSettings({ focus_highlight: e.target.checked })}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${settings.focus_highlight ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.focus_highlight ? 'translate-x-4' : ''}`}></div>
            </div>
            <div>
              <span className="block text-base font-medium text-gray-900 dark:text-gray-100">Fokusni ajratish (Focus Highlight)</span>
              <span className="text-base text-gray-500 dark:text-gray-400">Klaviatura orqali boshqarishda elementlarni ajratib ko'rsatish</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={settings.screen_reader_optimized}
                onChange={(e) => updateSettings({ screen_reader_optimized: e.target.checked })}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${settings.screen_reader_optimized ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.screen_reader_optimized ? 'translate-x-4' : ''}`}></div>
            </div>
            <div>
              <span className="block text-base font-medium text-gray-900 dark:text-gray-100">Ekran o'quvchi optimizatsiyasi (Screen Reader)</span>
              <span className="text-base text-gray-500 dark:text-gray-400">Ko'zi ojizlar uchun maxsus rejim</span>
            </div>
          </label>
        </div>

      </div>
    </div>
  );
}
