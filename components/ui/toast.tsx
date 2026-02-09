// components/ui/toast.tsx
"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  title?: string;
  description: string;
  variant?: "default" | "destructive";
  onClose: () => void;
}

export function Toast({ title, description, variant = "default", onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-[100] flex max-w-sm items-start gap-3 rounded-lg p-4 shadow-lg transition-all animate-in slide-in-from-bottom-4",
        variant === "destructive" ? "bg-destructive text-destructive-foreground" : "bg-background border"
      )}
    >
      <div className="flex-1">
        {title && <p className="font-semibold text-white">{title}</p>}
        <p className="text-sm text-white">{description}</p>
      </div>
      <button onClick={onClose} className="opacity-70 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}