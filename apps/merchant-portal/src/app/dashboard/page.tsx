'use client';

import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, XAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@workspace/ui/components/chart';
import { RecentPayments } from './_components/recent-payments';
import { merchantStatsOptions } from './_hooks/queries';
import { PageHeader } from '@/components/page-header';

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function DashboardPage() {
  const { data: stats, isLoading: isLoadingStats } = useQuery(
    merchantStatsOptions,
  );

  const chartData = stats?.timeSeries.map((item) => ({
    date: formatDate(item.date),
    dateValue: item.date,
    transactions: item.transactions,
    revenue: item.revenue / 100, // Convert cents to dollars
    successRate: item.successRate,
  })) ?? [];

  const revenueChartConfig = {
    revenue: {
      label: 'Revenue',
      color: 'var(--chart-1)',
    },
  };

  const transactionsChartConfig = {
    transactions: {
      label: 'Transactions',
      color: 'var(--chart-2)',
    },
  };

  const successRateChartConfig = {
    confirmed: {
      label: 'Confirmed',
      color: 'var(--chart-1)',
    },
    failed: {
      label: 'Failed',
      color: 'var(--chart-2)',
    },
  };

  const transactionStatusData = stats
    ? [
        {
          name: 'Confirmed',
          value: stats.confirmedCount,
          fill: 'var(--chart-1)',
        },
        {
          name: 'Failed',
          value: stats.failedCount,
          fill: 'var(--chart-2)',
        },
      ]
    : [];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title="Dashboard"
        description="Overview of your payment gateway activity"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue Over Time</CardTitle>
                <CardDescription>
                  Daily revenue from confirmed payments (last 30 days)
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-xs font-medium">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold">
                  {isLoadingStats
                    ? '...'
                    : formatCurrency(stats?.totalRevenue ?? 0)}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex h-[300px] items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : chartData.length > 0 ? (
              <ChartContainer config={revenueChartConfig}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatCurrency(Number(value) * 100)}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[300px] flex-col items-center justify-center gap-2">
                <p className="text-muted-foreground text-sm">
                  No revenue data available
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transactions Over Time</CardTitle>
                <CardDescription>
                  Daily transaction count (last 30 days)
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-xs font-medium">
                  Total Transactions
                </p>
                <p className="text-2xl font-bold">
                  {isLoadingStats ? '...' : stats?.totalTransactions ?? 0}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex h-[300px] items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : chartData.length > 0 ? (
              <ChartContainer config={transactionsChartConfig}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />
                  <Area
                    type="monotone"
                    dataKey="transactions"
                    stroke="var(--chart-2)"
                    fill="var(--chart-2)"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[300px] flex-col items-center justify-center gap-2">
                <p className="text-muted-foreground text-sm">
                  No transaction data available
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Success Rate</CardTitle>
                <CardDescription>
                  Confirmed vs failed transactions
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-xs font-medium">
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
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex h-[300px] items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : stats && stats.totalTransactions > 0 ? (
              <>
                <ChartContainer
                  config={successRateChartConfig}
                  className="mx-auto aspect-square max-h-[180px]"
                >
                  <PieChart>
                    <ChartTooltip
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={transactionStatusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      {transactionStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="mt-4 flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: 'var(--chart-1)' }}
                    />
                    <span className="text-sm">
                      {stats.confirmedCount} Confirmed
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: 'var(--chart-2)' }}
                    />
                    <span className="text-sm">{stats.failedCount} Failed</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-[300px] flex-col items-center justify-center gap-2">
                <p className="text-muted-foreground text-sm">
                  No transaction data available
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <RecentPayments />
    </div>
  );
}
