import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { X, Undo2, CheckCircle2, AlertCircle } from 'lucide-react';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'undo';
  undoAction?: () => void;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, options?: { type?: 'info' | 'success' | 'undo'; undoAction?: () => void; duration?: number }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback((
    message: string,
    options?: { type?: 'info' | 'success' | 'undo'; undoAction?: () => void; duration?: number }
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = options?.duration || (options?.undoAction ? 5000 : 2500);

    const newToast: ToastItem = {
      id,
      message,
      type: options?.undoAction ? 'undo' : (options?.type || 'success'),
      undoAction: options?.undoAction,
      duration
    };

    setToasts(prev => [...prev.slice(-2), newToast]); // Keep at most 2 active

    const timeout = setTimeout(() => {
      removeToast(id);
    }, duration);

    timeoutsRef.current.set(id, timeout);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Render Stage */}
      <div
        className="fixed bottom-24 sm:bottom-22 inset-x-0 z-50 flex flex-col items-center pointer-events-none gap-2 px-4 select-none"
        role="status"
        aria-live="polite"
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[var(--bg-card-active)]/95 text-white border border-white/10 backdrop-blur-2xl shadow-2xl shadow-black/40 text-xs font-medium max-w-sm w-full sm:w-auto animate-in fade-in zoom-in-95 duration-200"
            style={{
              animationTimingFunction: 'var(--ease-apple-out)',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)'
            }}
          >
            {toast.type === 'undo' ? (
              <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-3.5 h-3.5" />
              </span>
            ) : (
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            )}

            <span className="truncate flex-1">{toast.message}</span>

            {toast.undoAction && (
              <button
                onClick={() => {
                  toast.undoAction?.();
                  removeToast(toast.id);
                }}
                className="px-2.5 py-1 rounded-lg bg-accent text-white font-bold text-[11px] hover:bg-accent/90 btn-press transition-colors flex items-center gap-1 flex-shrink-0 hit-area-44"
              >
                <Undo2 className="w-3 h-3" />
                <span>Undo</span>
              </button>
            )}

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-muted hover:text-white rounded-md transition-colors hit-area-44"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
