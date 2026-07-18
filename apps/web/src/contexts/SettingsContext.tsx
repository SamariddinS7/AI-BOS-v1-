import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  font_size: 'small' | 'medium' | 'large' | 'extra_large' | string;
  primary_color: string;
  language: string;
  timezone: string;
  date_format: string;
  number_format: string;
  currency_format: string;
  compact_mode: boolean;
  animations_enabled: boolean;
  high_contrast: boolean;
  large_cursor: boolean;
  focus_highlight: boolean;
  screen_reader_optimized: boolean;
  performance_mode: boolean;
  chart_high_contrast: boolean;
}

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  isLoading: boolean;
}

const defaultSettings: UserSettings = {
  theme: 'system',
  font_size: 'medium',
  primary_color: 'teal',
  language: 'uz',
  timezone: 'Asia/Tashkent',
  date_format: 'DD.MM.YYYY',
  number_format: 'space',
  currency_format: 'UZS',
  compact_mode: false,
  animations_enabled: true,
  high_contrast: false,
  large_cursor: false,
  focus_highlight: false,
  screen_reader_optimized: false,
  performance_mode: false,
  chart_high_contrast: false,
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: async () => {},
  isLoading: true,
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    applySettings(settings);
  }, [settings]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings/user');
      if (res.status === 401) {
        // User not authenticated, use default settings
        setIsLoading(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setSettings({
            ...defaultSettings,
            ...data,
            compact_mode: Boolean(data.compact_mode),
            animations_enabled: Boolean(data.animations_enabled),
            high_contrast: Boolean(data.high_contrast),
            large_cursor: Boolean(data.large_cursor),
            focus_highlight: Boolean(data.focus_highlight),
            screen_reader_optimized: Boolean(data.screen_reader_optimized),
            performance_mode: Boolean(data.performance_mode),
            chart_high_contrast: Boolean(data.chart_high_contrast),
          });
        }
      }
    } catch (error) {
      console.warn('Failed to fetch settings (expected if not authenticated):', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated); // Optimistic update
    
    try {
      await fetch('/api/settings/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
      // Revert on error
      fetchSettings();
    }
  };

  const applySettings = (s: UserSettings) => {
    // Theme
    if (s.theme === 'dark' || (s.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Font Size
    let baseSize = '16px';
    if (s.font_size === 'small') baseSize = '16px';
    else if (s.font_size === 'large') baseSize = '18px';
    else if (s.font_size === 'extra_large') baseSize = '20px';
    else if (s.font_size.endsWith('px')) baseSize = s.font_size;
    
    document.documentElement.style.setProperty('--base-font-size', baseSize);
    document.documentElement.style.fontSize = baseSize;

    // Animations
    if (!s.animations_enabled) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
      document.documentElement.classList.remove('reduce-motion');
    }

    // Accessibility Classes
    const classList = document.documentElement.classList;
    s.high_contrast ? classList.add('high-contrast') : classList.remove('high-contrast');
    s.large_cursor ? classList.add('large-cursor') : classList.remove('large-cursor');
    s.focus_highlight ? classList.add('focus-highlight') : classList.remove('focus-highlight');
    s.screen_reader_optimized ? classList.add('screen-reader-optimized') : classList.remove('screen-reader-optimized');
    s.chart_high_contrast ? classList.add('chart-high-contrast') : classList.remove('chart-high-contrast');
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};
