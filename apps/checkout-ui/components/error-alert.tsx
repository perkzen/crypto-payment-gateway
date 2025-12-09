'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  dismissible?: boolean;
  variant?: 'default' | 'inline' | 'fullscreen';
  className?: string;
}

export function ErrorAlert({
  title = 'Something went wrong',
  message,
  onRetry,
  onDismiss,
  dismissible = false,
  variant = 'default',
  className = '',
}: ErrorAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const baseClasses =
    'flex items-start gap-3 rounded-lg border p-4 shadow-sm backdrop-blur-sm';
  const variantClasses = {
    default:
      'border-red-200/60 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20',
    inline:
      'border-red-200/60 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20',
    fullscreen:
      'border-red-200/60 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20',
  };

  const content = (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      <div className="flex-shrink-0">
        <div className="rounded-full bg-red-100 p-1.5 dark:bg-red-900/30">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="mb-1 text-sm font-semibold text-red-900 dark:text-red-100">
          {title}
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300">{message}</p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 flex items-center gap-2 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
        )}
      </div>

      {dismissible && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 rounded-md p-1 text-red-600 transition-colors hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );

  if (variant === 'fullscreen') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-black">
        <div className="w-full max-w-md">
          <AnimatePresence>{isVisible && content}</AnimatePresence>
        </div>
      </div>
    );
  }

  return <AnimatePresence>{isVisible && content}</AnimatePresence>;
}
