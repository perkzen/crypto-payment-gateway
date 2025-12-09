'use client';

import { useRouter } from 'next/navigation';
import { ErrorAlert } from '@/components/error-alert';

interface ErrorStateProps {
  error?: Error | unknown;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const router = useRouter();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      router.refresh();
    }
  };

  const getErrorMessage = () => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Failed to load checkout session. Please try again.';
  };

  return (
    <ErrorAlert
      title="Error Loading Session"
      message={getErrorMessage()}
      onRetry={handleRetry}
      variant="fullscreen"
    />
  );
}
