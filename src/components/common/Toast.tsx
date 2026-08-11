// src/components/common/Toast.tsx
import React, { useEffect } from "react";
import { clsx } from "clsx";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  variant = "info",
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const variants = {
    success: {
      bg: "bg-green-50 border-green-400",
      text: "text-green-800",
      icon: CheckCircle,
    },
    error: {
      bg: "bg-red-50 border-red-400",
      text: "text-red-800",
      icon: XCircle,
    },
    warning: {
      bg: "bg-yellow-50 border-yellow-400",
      text: "text-yellow-800",
      icon: AlertCircle,
    },
    info: {
      bg: "bg-blue-50 border-blue-400",
      text: "text-blue-800",
      icon: Info,
    },
  };

  const Icon = variants[variant].icon;

  return (
    <div
      className={clsx(
        "flex items-center justify-between border-l-4 rounded-lg shadow-lg p-4 min-w-[300px] max-w-md",
        variants[variant].bg,
        "animate-slide-up",
      )}>
      <div className="flex items-center gap-3">
        <Icon className={clsx("h-5 w-5", variants[variant].text)} />
        <span className={clsx("text-sm font-medium", variants[variant].text)}>
          {message}
        </span>
      </div>
      <button
        onClick={onClose}
        className={clsx(
          "hover:opacity-70 transition-opacity",
          variants[variant].text,
        )}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
