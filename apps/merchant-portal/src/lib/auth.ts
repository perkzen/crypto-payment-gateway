import { createAuthClient } from 'better-auth/react';
import { siweClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: 'http://localhost:8000',
  plugins: [siweClient()],
  fetchOptions: {
    credentials: 'include',
  },
});

export const { useSession, signOut } = authClient;
