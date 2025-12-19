'use client';

import { useQuery } from '@tanstack/react-query';
import { CreditCard, DollarSign, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { merchantStatsOptions } from './_hooks/queries';
import { RecentPayments } from './_components/recent-payments';

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export default function DashboardPage() {
  const { data: stats, isLoading: isLoadingStats } = useQuery(
    merchantStatsOptions,
  );

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
              <p className="text-2xl font-bold">
                {isLoadingStats
                  ? '...'
                  : formatCurrency(stats?.totalRevenue ?? 0)}
              </p>
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
              <p className="text-2xl font-bold">
                {isLoadingStats ? '...' : stats?.totalTransactions ?? 0}
              </p>
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
              <p className="text-2xl font-bold">
                {isLoadingStats
                  ? '...'
                  : stats?.successRate !== undefined
                    ? `${stats.successRate.toFixed(1)}%`
                    : '—'}
              </p>
            </div>
            <div className="bg-primary/10 rounded-full p-3">
              <TrendingUp className="text-primary h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <RecentPayments />
    </div>
  );
}
