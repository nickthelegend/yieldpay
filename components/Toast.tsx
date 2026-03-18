'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { useState, useEffect, createContext, useContext, useCallback } from 'react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'loading';
  message: string;
  txHash?: string;
}

interface ToastContextType {
  showToast: (type: Toast['type'], message: string, txHash?: string) => string;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: Toast['type'], message: string, txHash?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, txHash }]);

    if (type !== 'loading') {
      setTimeout(() => hideToast(id), 4000);
    }
    return id;
  }, [hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] w-[340px] pointer-events-none flex flex-col gap-3 font-body ">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className={clsx(
                "neo-brutal p-4 pointer-events-auto flex items-center gap-3 wiggle ",
                toast.type === 'success' && "bg-primary", // Lime green from theme
                toast.type === 'error' && "bg-card-1",    // Orange from theme
                toast.type === 'loading' && "bg-accent"   // Yellow from theme
              )}
            >
              {toast.type === 'loading' ? (
                <Loader2 size={20} className="animate-spin" />
              ) : toast.type === 'success' ? (
                <CheckCircle2 size={20} />
              ) : (
                <XCircle size={20} />
              )}
              <div className="flex-1 text-left">
                <p className="text-[10px] font-black uppercase leading-tight ">{toast.message}</p>
                {toast.txHash && (
                  <p className="text-[8px] font-mono opacity-60 mt-1 break-all">
                    Tx: {toast.txHash.slice(0, 10)}...
                  </p>
                )}
              </div>
              {toast.type !== 'loading' && (
                <button onClick={() => hideToast(toast.id)} className="opacity-40">×</button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
