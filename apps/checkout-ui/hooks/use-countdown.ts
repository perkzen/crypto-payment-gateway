import { useEffect, useState } from 'react';

export function useCountdown(expiresAt: Date) {
  const [timeRemaining, setTimeRemaining] = useState(() => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    return Math.max(0, diff);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();
      setTimeRemaining(Math.max(0, diff));
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);

  return { minutes, seconds, isExpired: timeRemaining === 0 };
}

export function formatCountdown(minutes: number, seconds: number): string {
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

