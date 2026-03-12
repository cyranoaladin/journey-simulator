/**
 * @file ToastContext.tsx
 * @description Contexte global pour les notifications toast MFAI
 * Usage: const { addToast } = useToast();
 *        addToast({ type: 'success', title: 'Mint réussi', txHash: '...' });
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastContainer } from '../components/ui/Toast';
import type { ToastType } from '../components/ui/Toast';

interface ToastData {
  id:       string;
  type:     ToastType;
  title:    string;
  message?: string;
  txHash?:  string;
}

interface ToastContextValue {
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ 
  addToast: () => {}, 
  removeToast: () => {} 
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => [...prev.slice(-4), { ...toast, id }]); // Max 5 toasts
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
