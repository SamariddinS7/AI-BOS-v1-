import { useState, useCallback } from 'react';

const DEFAULTS = {
  aiModel: "claude-3-5-sonnet",
  theme: "dark",
  voiceEnabled: true,
  refreshInterval: 30, // sekundlar
};

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    if (typeof window === 'undefined') return DEFAULTS;
    const saved = localStorage.getItem("aibos_settings");
    return saved ? JSON.parse(saved) : DEFAULTS;
  });

  const update = useCallback((key: string, val: any) => {
    setSettings((prev: any) => {
      const next = { ...prev, [key]: val };
      if (typeof window !== 'undefined') {
        localStorage.setItem("aibos_settings", JSON.stringify(next));
      }
      return next;
    });
  }, []);

  return { settings, update };
}
