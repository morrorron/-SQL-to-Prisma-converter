"use client";

import * as React from "react";
import type { ToastProps } from "@radix-ui/react-toast";

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
};

type ToastContextType = {
  toasts: ToasterToast[];
  toast: (props: Omit<ToasterToast, "id">) => void;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProviderInternal: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);

  const toast = React.useCallback((props: Omit<ToasterToast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((current) => [...current, { id, ...props }]);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const value = React.useMemo(
    () => ({
      toasts,
      toast,
      dismiss
    }),
    [toasts, toast, dismiss]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProviderInternal");
  }
  return ctx;
}

