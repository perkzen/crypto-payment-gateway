import { apiKeyClient, siweClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: 'http://localhost:8000',
  plugins: [siweClient(), apiKeyClient()],
  fetchOptions: {
    credentials: 'include',
  },
});

export const { useSession, signOut } = authClient;
