import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType | 'loading';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'> & { id?: string }) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, toast: Partial<Omit<Toast, 'id'>>) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = toast.id || Math.random().toString(36).substring(2, 9);
    set((state) => {
      const existingIndex = state.toasts.findIndex(t => t.id === id);
      if (existingIndex > -1) {
        const newToasts = [...state.toasts];
        newToasts[existingIndex] = { ...newToasts[existingIndex], ...toast, id };
        return { toasts: newToasts };
      }
      return { toasts: [...state.toasts, { ...toast, id }] };
    });
    return id;
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  updateToast: (id, toast) =>
    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...t, ...toast } : t)),
    })),
}));

export function useToast() {
  const addToast = useToastStore((state) => state.addToast);
  const updateToast = useToastStore((state) => state.updateToast);
  const removeToast = useToastStore((state) => state.removeToast);
  
  return {
    toast: (props: Omit<Toast, 'id'> & { id?: string }) => addToast(props),
    success: (title: string, options?: { message?: string; id?: string }) => 
      addToast({ type: 'success', title, ...options }),
    error: (title: string, options?: { message?: string; id?: string }) => 
      addToast({ type: 'error', title, ...options }),
    info: (title: string, options?: { message?: string; id?: string }) => 
      addToast({ type: 'info', title, ...options }),
    warning: (title: string, options?: { message?: string; id?: string }) => 
      addToast({ type: 'warning', title, ...options }),
    loading: (title: string, options?: { message?: string; id?: string }) => 
      addToast({ type: 'loading', title, ...options }),
    dismiss: (id: string) => removeToast(id),
  };
}
