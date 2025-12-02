import { Button } from '@workspace/ui/components/button';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <main className="w-full max-w-2xl space-y-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/20">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold">Payment Successful!</h1>
            <p className="text-muted-foreground mt-2">
              Your payment has been processed successfully.
            </p>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <p className="text-muted-foreground text-sm">
            Thank you for your payment. You will receive a confirmation email
            shortly.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/">Create Another Session</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
