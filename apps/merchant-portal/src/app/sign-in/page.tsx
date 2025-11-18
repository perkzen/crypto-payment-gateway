import { AuthenticationButton } from '@/components/authentication-button';

export default function SignInPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <div className="flex flex-col items-center justify-center gap-6 rounded-lg border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Merchant Portal</h1>
          <p className="text-muted-foreground">
            Sign in with Ethereum to access your dashboard
          </p>
        </div>
        <AuthenticationButton />
        <div className="text-center text-sm text-muted-foreground">
          Powered by RainbowKit & WalletConnect
        </div>
      </div>
    </div>
  );
}

