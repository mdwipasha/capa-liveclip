"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { create } from "zustand";
import { cn } from "@web/lib/utils";

interface ToastState {
  title: string;
  description?: string;
  open: boolean;
  show: (toast: Omit<ToastState, "open" | "show" | "dismiss">) => void;
  dismiss: () => void;
}

export const useToast = create<ToastState>((set) => ({
  title: "",
  open: false,
  show: (toast) => set({ ...toast, open: true }),
  dismiss: () => set({ open: false })
}));

export function Toaster() {
  const { open, title, description, dismiss } = useToast();
  return (
    <ToastPrimitive.Provider swipeDirection="right">
      <ToastPrimitive.Root
        open={open}
        onOpenChange={(value) => (value ? undefined : dismiss())}
        className={cn(
          "glass-panel fixed bottom-6 right-6 z-50 w-[min(360px,calc(100vw-2rem))] rounded-2xl p-4 shadow-panel"
        )}
      >
        <ToastPrimitive.Title className="text-sm font-semibold">{title}</ToastPrimitive.Title>
        {description ? (
          <ToastPrimitive.Description className="mt-1 text-sm text-muted-foreground">
            {description}
          </ToastPrimitive.Description>
        ) : null}
      </ToastPrimitive.Root>
      <ToastPrimitive.Viewport />
    </ToastPrimitive.Provider>
  );
}
