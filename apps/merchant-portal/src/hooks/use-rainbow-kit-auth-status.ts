import { useSession } from '@/lib/auth';

export function useRainbowKitAuthStatus() {
  const { data: session, isPending } = useSession();

  if (isPending) return 'loading';
  if (session?.user) return 'authenticated';
  return 'unauthenticated';
}
