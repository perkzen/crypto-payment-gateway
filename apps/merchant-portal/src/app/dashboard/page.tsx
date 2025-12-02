import { Button } from '@workspace/ui/components/button';
import { CreditCard, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title="Dashboard"
        description="Overview of your payment gateway activity"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Total Revenue
              </p>
              <p className="text-2xl font-bold">$0.00</p>
            </div>
            <div className="bg-primary/10 rounded-full p-3">
              <DollarSign className="text-primary h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Total Transactions
              </p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="bg-primary/10 rounded-full p-3">
              <CreditCard className="text-primary h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Success Rate
              </p>
              <p className="text-2xl font-bold">—</p>
            </div>
            <div className="bg-primary/10 rounded-full p-3">
              <TrendingUp className="text-primary h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-card rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">Recent Transactions</h2>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground text-sm">No transactions yet</p>
            <Button className="mt-4" variant="outline" asChild>
              <Link href="/dashboard/payments">View All Payments</Link>
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/payments">View Payments</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/settings/api-keys">Manage API Keys</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/settings/webhooks">
                Configure Webhooks
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
