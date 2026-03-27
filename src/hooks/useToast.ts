"use client";

import { useState, useCallback } from "react";
import { ToastType } from "@/components/ui/toast";
import { v4 as uuidv4 } from "uuid";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (message: string) => addToast(message, "success"),
    [addToast]
  );

  const error = useCallback(
    (message: string) => addToast(message, "error"),
    [addToast]
  );

  const info = useCallback(
    (message: string) => addToast(message, "info"),
    [addToast]
  );

  return { toasts, addToast, removeToast, success, error, info };
}
