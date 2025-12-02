import { Button } from '@workspace/ui/components/button';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <main className="w-full max-w-2xl space-y-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
            <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold">Payment Cancelled</h1>
            <p className="text-muted-foreground mt-2">
              Your payment was cancelled. No charges were made.
            </p>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <p className="text-muted-foreground text-sm">
            You can return to create a new checkout session or try again later.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
