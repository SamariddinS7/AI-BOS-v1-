import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  msg: string;
  type: ToastType;
  removing: boolean;
}

interface ToastContextType {
  success: (m: string) => void;
  error: (m: string) => void;
  info: (m: string) => void;
  warning: (m: string) => void;
}

const ToastCtx = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((msg: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type, removing: false }]);
    
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 210);
    }, 3000);
  }, []);

  const api = {
    success: (m: string) => addToast(m, 'success'),
    error: (m: string) => addToast(m, 'error'),
    info: (m: string) => addToast(m, 'info'),
    warning: (m: string) => addToast(m, 'warning'),
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`toast-item ${t.removing ? 'removing' : ''} px-4 py-3 rounded-xl bg-surface-card/80 backdrop-blur-md border border-border-light text-text-primary shadow-lg flex items-center gap-2.5`}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
